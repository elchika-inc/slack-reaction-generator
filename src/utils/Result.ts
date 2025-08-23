/**
 * Result型パターンによる型安全なエラーハンドリング
 */

export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * 成功結果を作成
 */
export function Ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * エラー結果を作成
 */
export function Err<E = Error>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Result型のユーティリティ関数
 */
export class ResultUtils {
  /**
   * Resultが成功かどうかをチェック（型ガード）
   */
  static isOk<T, E>(result: Result<T, E>): result is { success: true; data: T } {
    return result.success === true;
  }

  /**
   * Resultがエラーかどうかをチェック（型ガード）
   */
  static isErr<T, E>(result: Result<T, E>): result is { success: false; error: E } {
    return result.success === false;
  }

  /**
   * Resultから値を取得（エラーの場合は例外を投げる）
   */
  static unwrap<T, E>(result: Result<T, E>): T {
    if (result.success) {
      return result.data;
    }
    throw result.error;
  }

  /**
   * Resultから値を取得（エラーの場合はデフォルト値を返す）
   */
  static unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
    if (result.success) {
      return result.data;
    }
    return defaultValue;
  }

  /**
   * Resultをマップする
   */
  static map<T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => U
  ): Result<U, E> {
    if (result.success) {
      return Ok(fn(result.data));
    }
    return result;
  }

  /**
   * Resultをフラットマップする
   */
  static flatMap<T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => Result<U, E>
  ): Result<U, E> {
    if (result.success) {
      return fn(result.data);
    }
    return result;
  }

  /**
   * エラーをマップする
   */
  static mapError<T, E, F>(
    result: Result<T, E>,
    fn: (error: E) => F
  ): Result<T, F> {
    if (!result.success) {
      return Err(fn(result.error));
    }
    return result as Result<T, F>;
  }

  /**
   * Promise<Result>を扱うユーティリティ
   */
  static async fromPromise<T>(
    promise: Promise<T>
  ): Promise<Result<T, Error>> {
    try {
      const data = await promise;
      return Ok(data);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * 複数のResultを結合
   */
  static combine<T extends readonly Result<any, any>[]>(
    results: T
  ): Result<
    { [K in keyof T]: T[K] extends Result<infer U, any> ? U : never },
    T[number] extends Result<any, infer E> ? E : never
  > {
    const values: any[] = [];
    
    for (const result of results) {
      if (!result.success) {
        return Err(result.error);
      }
      values.push(result.data);
    }
    
    return Ok(values as any);
  }
}

/**
 * try-catchをResult型でラップ
 */
export function tryCatch<T>(
  fn: () => T
): Result<T, Error> {
  try {
    return Ok(fn());
  } catch (error) {
    return Err(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * 非同期try-catchをResult型でラップ
 */
export async function tryCatchAsync<T>(
  fn: () => Promise<T>
): Promise<Result<T, Error>> {
  try {
    const data = await fn();
    return Ok(data);
  } catch (error) {
    return Err(error instanceof Error ? error : new Error(String(error)));
  }
}