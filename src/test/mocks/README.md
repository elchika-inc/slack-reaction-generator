# Canvas Test Double Implementation

Canvas APIの包括的なTest Double実装です。Test Doubleパターンのベストプラクティスに基づいて、テストの独立性・実行速度・保守性を向上させる設計になっています。

## 実装されたTest Doubleの種類

### 1. Mock - 期待される呼び出しの検証
- Canvas描画メソッド（`fillRect`, `strokeRect`, `drawImage` など）
- 呼び出し回数、引数、順序の検証が可能
- 副作用のないクリーンなテスト実行

### 2. Stub - 決まった値を返すオブジェクト
- `measureText` - テキスト幅の計算結果を返す
- `getImageData` - 模擬的なImageDataオブジェクトを返す
- `toDataURL` - データURLを返す

### 3. Fake - 軽量な実装を持つオブジェクト
- Canvas State Manager - 実際の状態管理を模倣
- Animation Frame Controller - requestAnimationFrameの制御
- File/Blob API - ファイル操作の軽量実装

### 4. Spy - 呼び出し情報の記録
- 描画コマンドレコーダー - すべての描画操作を記録
- 状態変更トラッキング - fillStyle, font等の変更を追跡
- タイムスタンプ付き呼び出し履歴

## 主要コンポーネント

### DrawingCommandRecorder
```javascript
// 描画コマンドを記録し、検証に使用
const recorder = context.__getRecorder();
const commands = recorder.getCommands();
const fillRectCalls = recorder.getCommandsByType('fillRect');
```

### CanvasDrawingVerifier
```javascript
// 描画操作の検証用ヘルパー
const verifier = context.__getVerifier();
const textResult = verifier.expectTextDrawn('Hello', 50, 50);
const imageResult = verifier.expectImageDrawn();
```

### CanvasStateManager
```javascript
// Canvas状態の管理（save/restore対応）
const stateManager = context.__getStateManager();
const currentState = stateManager.getState();
```

## 使用方法

### 基本的なテスト設定

```javascript
import { 
  createCanvasMock, 
  createCanvasContextMock, 
  setupCanvasEnvironment 
} from '../test/mocks/canvasMock';

describe('Canvas Tests', () => {
  let mockCanvas;
  let mockContext;

  beforeEach(() => {
    mockCanvas = createCanvasMock(128, 128);
    mockContext = mockCanvas.__getContext();
    mockContext.__clearRecording(); // テスト間でのクリーンアップ
  });
});
```

### Canvas描画の検証

```javascript
it('テキストが正しく描画される', () => {
  // Act
  mockContext.fillText('Hello World', 50, 50);
  
  // Assert - アサーション関数を使用
  canvasAssertions.expectTextDrawn(mockContext, 'Hello World', 50, 50);
  
  // または手動検証
  const verifier = mockContext.__getVerifier();
  const result = verifier.expectTextDrawn('Hello World', 50, 50);
  expect(result.found).toBe(true);
});
```

### 描画順序の検証

```javascript
it('画像がテキストより先に描画される', () => {
  // Act
  mockContext.drawImage(image, 0, 0);
  mockContext.fillText('Text', 50, 50);
  
  // Assert - タイムスタンプベースの順序検証
  const verifier = mockContext.__getVerifier();
  const commands = verifier.recorder.getCommands();
  const imageIndex = commands.findIndex(cmd => cmd.command === 'drawImage');
  const textIndex = commands.findIndex(cmd => cmd.command === 'fillText');
  
  expect(imageIndex).toBeLessThan(textIndex);
});
```

### 状態管理のテスト

```javascript
it('save/restoreが正しく動作する', () => {
  // Arrange
  mockContext.fillStyle = '#FF0000';
  
  // Act
  mockContext.save();
  mockContext.fillStyle = '#00FF00';
  mockContext.restore();
  
  // Assert
  expect(mockContext.fillStyle).toBe('#FF0000');
});
```

### アニメーションフレームのテスト

```javascript
it('アニメーションフレームが制御可能', () => {
  const animationMock = createAnimationFrameMock();
  
  // アニメーション開始
  let frameCount = 0;
  animationMock.requestAnimationFrame(() => frameCount++);
  
  // 手動でフレームを進める
  animationMock.tick();
  expect(frameCount).toBe(1);
  
  // 複数フレーム実行
  animationMock.tickAll(5);
  expect(animationMock.getPendingCallbacks()).toHaveLength(0);
});
```

## アサーション関数

### canvasAssertions.expectTextDrawn
```javascript
// テキスト描画の検証
canvasAssertions.expectTextDrawn(context, 'テキスト', x, y);
```

### canvasAssertions.expectImageDrawn
```javascript
// 画像描画の検証
canvasAssertions.expectImageDrawn(context, {
  imageSource: image,
  dx: 10,
  dy: 20,
  dw: 100,
  dh: 100
});
```

### canvasAssertions.expectCanvasCleared
```javascript
// キャンバスクリアの検証
canvasAssertions.expectCanvasCleared(context, 0, 0, 128, 128);
```

### canvasAssertions.expectDrawingCount
```javascript
// 描画回数の検証
canvasAssertions.expectDrawingCount(context, 5, 'fillRect');
```

## パフォーマンス最適化

### 1. 効率的なモック初期化
```javascript
// 重いセットアップは beforeAll で実行
beforeAll(() => {
  setupCanvasEnvironment();
});

// 軽い初期化は beforeEach で実行
beforeEach(() => {
  mockContext.__clearRecording();
});
```

### 2. メモリリーク防止
```javascript
afterEach(() => {
  // 描画記録のクリア
  mockContext.__clearRecording();
  // 状態のリセット
  mockContext.__resetState();
});
```

### 3. バッチテスト最適化
```javascript
// 複数の類似テストをまとめて実行
const testCases = [
  { text: 'A', x: 10, y: 20 },
  { text: 'B', x: 30, y: 40 },
  { text: 'C', x: 50, y: 60 }
];

testCases.forEach(({ text, x, y }) => {
  mockContext.__clearRecording();
  mockContext.fillText(text, x, y);
  canvasAssertions.expectTextDrawn(mockContext, text, x, y);
});
```

## 統合テストでの使用

### canvasUtilsのテスト
```javascript
import { generateIconData } from '../canvasUtils';

it('アイコン生成で適切なCanvas操作が実行される', async () => {
  const settings = { text: 'Test', canvasSize: 128 };
  await generateIconData(settings, mockCanvas);
  
  // キャンバスクリア確認
  canvasAssertions.expectCanvasCleared(mockContext, 0, 0, 128, 128);
  
  // テキスト描画確認
  const verifier = mockContext.__getVerifier();
  const textDrawn = verifier.expectTextDrawn('Test');
  expect(textDrawn.found).toBe(true);
});
```

### useCanvasPreviewのテスト
```javascript
import { renderHook } from '@testing-library/react';
import { useCanvasPreview } from '../useCanvasPreview';

// renderingEngineのモック設定
mockRenderingEngine.getCanvas.mockReturnValue({
  canvas: mockCanvas,
  ctx: mockContext
});

const { result } = renderHook(() => useCanvasPreview(settings, true));
expect(result.current.canvasRef).toBeDefined();
```

## Test Doubleパターンの利点

### 1. テストの独立性
- 外部依存（実際のCanvas、画像ファイル）から分離
- テスト間での状態汚染を防止
- 並列テスト実行が安全

### 2. 実行速度の向上
- 実際の描画処理をスキップ
- ファイルI/Oや画像読み込みを模擬
- アニメーションフレームの制御

### 3. テスト精度の向上
- 期待する動作の明確な検証
- 描画順序やタイミングの検証
- エラーケースの再現

### 4. 保守性の確保
- 本番コード変更時の影響を局所化
- テストコードの可読性向上
- モックのバージョン管理

## ベストプラクティス

### 1. 適切なTest Double選択
- **Mock**: 呼び出し回数や引数を検証したい場合
- **Stub**: 特定の戻り値が必要な場合  
- **Fake**: 軽量な実装で十分な場合
- **Spy**: 実際の処理も実行しつつ監視したい場合

### 2. 過度なモック化の回避
```javascript
// 悪い例 - 全てをモック化
const overMockedContext = vi.fn().mockImplementation(() => ({}));

// 良い例 - 必要な部分のみモック化
const mockContext = createCanvasContextMock(); // 適切な機能を持つMock
```

### 3. テストの可読性重視
```javascript
// 描画操作の意図を明確に
it('背景→画像→テキストの順序で描画される', () => {
  // テスト内容が期待動作と一致
});
```

### 4. 本番環境との整合性確保
```javascript
// Mock仕様を実際のAPIに合わせる
expect(mockContext.measureText('test').width).toBe(32); // 実際の計算に近い値
```

この実装により、Canvas関連のテストが高速かつ安定して実行でき、Test Doubleパターンのベストプラクティスに従った保守しやすいテストコードを記述することができます。