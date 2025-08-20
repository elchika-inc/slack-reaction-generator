/**
 * GIF生成Worker管理クラス
 * - Web Workerのライフサイクル管理
 * - 進捗管理とエラーハンドリング
 * - 複数のGIF生成リクエストのキュー管理
 */

export interface GifGenerationProgress {
  message: string;
  progress: number; // 0-100
}

export interface GifGenerationResult {
  dataUrl: string;
  blob: Blob;
  size: number;
}

export interface GifGenerationTask {
  id: string;
  settings: any;
  onProgress?: (progress: GifGenerationProgress) => void;
  onComplete?: (result: GifGenerationResult) => void;
  onError?: (error: Error) => void;
}

export class GifWorkerManager {
  private worker: Worker | null = null;
  private currentTask: GifGenerationTask | null = null;
  private taskQueue: GifGenerationTask[] = [];
  private isWorkerReady = false;
  private static instance: GifWorkerManager | null = null;

  private constructor() {
    this.initializeWorker();
  }

  /**
   * シングルトンインスタンスの取得
   */
  static getInstance(): GifWorkerManager {
    if (!GifWorkerManager.instance) {
      GifWorkerManager.instance = new GifWorkerManager();
    }
    return GifWorkerManager.instance;
  }

  /**
   * Web Workerの初期化
   */
  private async initializeWorker(): Promise<void> {
    try {
      // Web Workerの対応確認
      if (typeof Worker === 'undefined') {
        throw new Error('Web Workerがサポートされていません');
      }

      // ワーカーファイルの作成（動的生成）
      const workerBlob = await this.createWorkerBlob();
      const workerUrl = URL.createObjectURL(workerBlob);
      
      this.worker = new Worker(workerUrl);
      
      this.worker.onmessage = (event) => {
        this.handleWorkerMessage(event);
      };
      
      this.worker.onerror = (error) => {
        console.error('GIF Worker Error:', error);
        this.handleWorkerError(new Error(`Worker error: ${error.message}`));
      };
      
      this.isWorkerReady = true;
      
      // URL cleanup
      URL.revokeObjectURL(workerUrl);
      
    } catch (error) {
      console.error('GIF Worker initialization failed:', error);
      this.isWorkerReady = false;
    }
  }

  /**
   * Workerブロブの動的作成
   */
  private async createWorkerBlob(): Promise<Blob> {
    // Worker用のコードをfetchで取得
    const workerPath = '/gifWorker.js';
    
    try {
      const response = await fetch(workerPath);
      if (!response.ok) {
        throw new Error(`Worker script load failed: ${response.status}`);
      }
      const workerCode = await response.text();
      return new Blob([workerCode], { type: 'application/javascript' });
    } catch (error) {
      // フォールバック: インラインワーカー作成
      const inlineWorkerCode = this.getInlineWorkerCode();
      return new Blob([inlineWorkerCode], { type: 'application/javascript' });
    }
  }

  /**
   * インラインワーカーコードの生成（フォールバック用）
   */
  private getInlineWorkerCode(): string {
    return `
      // Minimal inline GIF worker - just report error to trigger fallback
      self.onmessage = async function(event) {
        const { type } = event.data;
        
        if (type === 'generateGIF') {
          // Always report error to trigger main thread fallback
          self.postMessage({
            type: 'error',
            data: { message: 'Worker fallback - using main thread' }
          });
        }
      };
    `;
  }

  /**
   * Workerメッセージハンドラー
   */
  private handleWorkerMessage(event: MessageEvent): void {
    const { type, data } = event.data;
    
    if (!this.currentTask) return;
    
    switch (type) {
      case 'progress':
        if (this.currentTask.onProgress) {
          this.currentTask.onProgress(data);
        }
        break;
        
      case 'complete':
        this.handleTaskComplete(data);
        break;
        
      case 'error':
        this.handleTaskError(new Error(data.message));
        break;
        
      case 'frameComplete':
        // 個別フレーム完了処理（必要に応じて）
        break;
        
      default:
        console.warn('Unknown worker message type:', type);
    }
  }

  /**
   * タスク完了処理
   */
  private async handleTaskComplete(data: any): Promise<void> {
    if (!this.currentTask) return;
    
    try {
      // ArrayBufferからBlobを再構築
      const arrayBuffer = data.gif instanceof ArrayBuffer ? data.gif : new ArrayBuffer(data.gif);
      const blob = new Blob([arrayBuffer], { type: data.mimeType || 'image/gif' });
      
      // Data URLを生成
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      
      const result: GifGenerationResult = {
        dataUrl,
        blob,
        size: blob.size
      };
      
      if (this.currentTask.onComplete) {
        this.currentTask.onComplete(result);
      }
      
    } catch (error) {
      this.handleTaskError(error as Error);
      return;
    }
    
    // 次のタスクを処理
    this.processNextTask();
  }

  /**
   * タスクエラー処理
   */
  private handleTaskError(error: Error): void {
    if (this.currentTask?.onError) {
      this.currentTask.onError(error);
    }
    
    console.error('GIF generation task error:', error);
    this.processNextTask();
  }

  /**
   * Workerエラー処理
   */
  private handleWorkerError(error: Error): void {
    this.isWorkerReady = false;
    
    if (this.currentTask?.onError) {
      this.currentTask.onError(error);
    }
    
    // Worker再初期化
    setTimeout(() => {
      this.initializeWorker();
    }, 1000);
  }

  /**
   * 次のタスクを処理
   */
  private processNextTask(): void {
    this.currentTask = null;
    
    if (this.taskQueue.length > 0) {
      const nextTask = this.taskQueue.shift()!;
      this.executeTask(nextTask);
    }
  }

  /**
   * タスクの実行
   */
  private executeTask(task: GifGenerationTask): void {
    if (!this.isWorkerReady || !this.worker) {
      task.onError?.(new Error('Worker is not ready'));
      return;
    }
    
    this.currentTask = task;
    
    this.worker.postMessage({
      type: 'generateGIF',
      data: {
        settings: task.settings
      }
    });
  }

  /**
   * GIF生成を開始
   */
  public generateGIF(
    settings: any,
    onProgress?: (progress: GifGenerationProgress) => void,
    onComplete?: (result: GifGenerationResult) => void,
    onError?: (error: Error) => void
  ): string {
    const taskId = `gif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task: GifGenerationTask = {
      id: taskId,
      settings,
      onProgress,
      onComplete,
      onError
    };
    
    if (this.currentTask) {
      // 他のタスクが実行中の場合はキューに追加
      this.taskQueue.push(task);
    } else {
      // すぐに実行
      this.executeTask(task);
    }
    
    return taskId;
  }

  /**
   * タスクのキャンセル
   */
  public cancelTask(taskId: string): boolean {
    // キューから削除
    const queueIndex = this.taskQueue.findIndex(task => task.id === taskId);
    if (queueIndex !== -1) {
      this.taskQueue.splice(queueIndex, 1);
      return true;
    }
    
    // 現在のタスクの場合はワーカーを終了
    if (this.currentTask?.id === taskId) {
      if (this.worker) {
        this.worker.terminate();
        this.worker = null;
      }
      this.currentTask = null;
      this.isWorkerReady = false;
      
      // Worker再初期化
      this.initializeWorker();
      return true;
    }
    
    return false;
  }

  /**
   * 全タスクをキャンセル
   */
  public cancelAllTasks(): void {
    this.taskQueue.length = 0;
    
    if (this.currentTask && this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.currentTask = null;
      this.isWorkerReady = false;
      this.initializeWorker();
    }
  }

  /**
   * ワーカーの状態取得
   */
  public getStatus(): {
    isReady: boolean;
    hasCurrentTask: boolean;
    queueSize: number;
  } {
    return {
      isReady: this.isWorkerReady,
      hasCurrentTask: this.currentTask !== null,
      queueSize: this.taskQueue.length
    };
  }

  /**
   * リソースクリーンアップ
   */
  public cleanup(): void {
    this.cancelAllTasks();
    
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    
    this.isWorkerReady = false;
  }
}

// グローバルインスタンス
export const gifWorkerManager = GifWorkerManager.getInstance();