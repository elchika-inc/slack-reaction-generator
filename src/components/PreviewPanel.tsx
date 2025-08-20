import { useState, useEffect, useRef } from "react";
// file-saverを遅延読み込み
let saveAs = null;
const loadFileSaver = async () => {
  if (!saveAs) {
    const module = await import('file-saver');
    saveAs = module.saveAs;
  }
  return saveAs;
};
// gifencライブラリを使用（透明背景サポート向上）
// 従来のgif.jsを使いたい場合は以下をコメントアウト解除
import {
  generateIconData,
  drawAnimationFrame,
  drawTextIcon,
} from "../utils/canvasUtils";
import { useIconSettingsContext } from '../contexts/IconSettingsContext';
import { useCanvasContext } from '../contexts/CanvasContext';
import { useAppStateContext } from '../contexts/AppStateContext';

interface PreviewPanelProps {
  previewData?: string | null;
  onRegenerate?: () => void;
}

function PreviewPanel({ previewData, onRegenerate }: PreviewPanelProps) {
  const { iconSettings } = useIconSettingsContext();
  const { isMobile } = useAppStateContext();
  const [theme, setTheme] = useState("light");
  const canvasRef = useRef(null);
  const smallCanvasRef = useRef(null);
  const animationRef = useRef(null);
  const smallAnimationRef = useRef(null);
  const frameRef = useRef(0);
  const smallFrameRef = useRef(0);

  useEffect(() => {
    // アニメーション停止
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (smallAnimationRef.current) {
      cancelAnimationFrame(smallAnimationRef.current);
      smallAnimationRef.current = null;
    }

    // フォントロード待機処理
    const loadFonts = async () => {
      if (iconSettings.fontFamily && iconSettings.fontFamily !== "sans-serif") {
        // フォントファミリーはそのまま使用
        const fontFamily = iconSettings.fontFamily;

        // 装飾的フォントの判定
        const isDecorativeFont =
          fontFamily.includes("Pacifico") || fontFamily.includes("Caveat");

        // ウェイトの設定
        let fontWeight = "bold";
        if (fontFamily.includes("M PLUS") || fontFamily.includes("M+")) {
          fontWeight = "900";
        } else if (isDecorativeFont) {
          fontWeight = "normal";
        }

        try {
          // フォントの読み込みを確認
          await document.fonts.load(`${fontWeight} 16px ${fontFamily}`);
          // Font loaded successfully
        } catch (e) {
          // Font loading error
          // エラー時でも描画を続行
        }
      }
    };

    loadFonts().then(() => {
      if (canvasRef.current && smallCanvasRef.current) {
        const canvas = canvasRef.current;
        const canvasSize = iconSettings.canvasSize || 128;
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true }); // アルファチャンネルを明示的に有効化

        const smallCanvas = smallCanvasRef.current;
        smallCanvas.width = 32;
        smallCanvas.height = 32;
        const smallCtx = smallCanvas.getContext("2d", { alpha: true, willReadFrequently: true }); // アルファチャンネルを明示的に有効化

        // アニメーションがある場合はリアルタイムで描画
        const hasTextAnimation = iconSettings.animation && iconSettings.animation !== "none";
        const hasImageAnimation = iconSettings.imageData && iconSettings.imageAnimation && iconSettings.imageAnimation !== "none";
        
        if (hasTextAnimation || hasImageAnimation) {
          frameRef.current = 0;
          smallFrameRef.current = 0;
          const frameCount = iconSettings.gifFrames || 30; // GIFと同じフレーム数
          // animationSpeedは既にミリ秒単位
          const requestedDelay = iconSettings.animationSpeed || 33;

          // GIFと同じ制限を適用（30ms未満は30msに）
          const delay = requestedDelay < 30 ? 30 : requestedDelay;
          let lastTime = 0;
          let smallLastTime = 0;

          const animate = (currentTime) => {
            if (!lastTime) lastTime = currentTime;
            const deltaTime = currentTime - lastTime;

            if (deltaTime >= delay) {
              frameRef.current = (frameRef.current + 1) % frameCount;
              // 背景色を描画
              ctx.fillStyle = iconSettings.backgroundColor || "#FFFFFF";
              ctx.fillRect(0, 0, canvasSize, canvasSize);
              // アニメーションフレームを描画
              drawAnimationFrame(ctx, iconSettings, frameRef.current, frameCount);
              lastTime = currentTime;
            }

            animationRef.current = requestAnimationFrame(animate);
          };

          const animateSmall = (currentTime) => {
            if (!smallLastTime) smallLastTime = currentTime;
            const deltaTime = currentTime - smallLastTime;

            if (deltaTime >= delay) {
              smallFrameRef.current = (smallFrameRef.current + 1) % frameCount;
              // 32x32キャンバスをクリア
              smallCtx.clearRect(0, 0, 32, 32);
              // 32x32にスケールダウンして描画
              smallCtx.save();
              const scale = 32 / canvasSize;
              smallCtx.scale(scale, scale);
              // 背景色を描画（元のキャンバスサイズで）
              smallCtx.fillStyle = iconSettings.backgroundColor || "#FFFFFF";
              smallCtx.fillRect(0, 0, canvasSize, canvasSize);
              drawAnimationFrame(
                smallCtx,
                iconSettings,
                smallFrameRef.current,
                frameCount
              );
              smallCtx.restore();
              smallLastTime = currentTime;
            }

            smallAnimationRef.current = requestAnimationFrame(animateSmall);
          };

          animate(0);
          animateSmall(0);

          // ダウンロード用のデータURLも生成しておく
          generateIconData(iconSettings, null);
        } else {
          // アニメーションなしの場合は静止画を生成
          // canvasをクリアしてから描画
          ctx.clearRect(0, 0, canvasSize, canvasSize);
          smallCtx.clearRect(0, 0, 32, 32);

          generateIconData(iconSettings, canvas);
          // 32x32も生成（元サイズをスケールダウン）
          smallCtx.save();
          const scale = 32 / canvasSize;
          smallCtx.scale(scale, scale);
          drawTextIcon(smallCtx, iconSettings);
          smallCtx.restore();
        }
      }
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (smallAnimationRef.current) {
        cancelAnimationFrame(smallAnimationRef.current);
        smallAnimationRef.current = null;
      }
    };
  }, [iconSettings]);

  const handleDownload = async () => {
    const fileName = `slack-reaction-${Date.now()}.${
      iconSettings.animation !== "none" ? "gif" : "png"
    }`;

    try {
      // アニメーションの場合はGIFを生成
      if (iconSettings.animation !== "none") {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = 128;
        tempCanvas.height = 128;

        // GIF生成処理（新しいキャンバスで）
        const url = await generateIconData(iconSettings, tempCanvas);

        const response = await fetch(url);
        const blob = await response.blob();
        const fileSaver = await loadFileSaver();
        fileSaver(blob, fileName);
      } else {
        // 静止画の場合、新しいキャンバスで再生成（透明背景対応）
        const tempCanvas = document.createElement("canvas");
        const canvasSize = iconSettings.canvasSize || 128;
        tempCanvas.width = canvasSize;
        tempCanvas.height = canvasSize;

        const url = await generateIconData(iconSettings, tempCanvas);
        const response = await fetch(url);
        const blob = await response.blob();
        const fileSaver = await loadFileSaver();
        fileSaver(blob, fileName);
      }
    } catch (error) {
      // Download error
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Slackアイコン",
        text: "カスタムSlackアイコンを作成しました！",
        url: window.location.href,
      });
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg p-6 preview-container ${
        isMobile ? "" : "sticky top-8"
      }`}
    >
      {/* テーマ切り替え */}
      <div className="flex justify-center mb-4">
        <fieldset className="inline-flex rounded-lg border border-gray-200">
          <legend className="sr-only">プレビューテーマ選択</legend>
          <button
            onClick={() => setTheme("light")}
            className={`px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 ${
              theme === "light" ? "bg-gray-100" : ""
            }`}
            role="radio"
            aria-checked={theme === "light"}
            aria-label="ライトテーマを選択"
          >
            ライト
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 ${
              theme === "dark" ? "bg-gray-100" : ""
            }`}
            role="radio"
            aria-checked={theme === "dark"}
            aria-label="ダークテーマを選択"
          >
            ダーク
          </button>
        </fieldset>
      </div>

      {/* プレビューエリア */}
      <div
        className={`
          rounded-lg ${isMobile ? "p-4" : "p-8"} mb-6 transition-colors preview-area
          ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}
        `}
      >
        <div
          className={`flex justify-center ${
            isMobile ? "space-x-4" : "space-x-8"
          }`}
        >
          {/* メインプレビュー */}
          <div className="text-center">
            <p
              className={`text-xs mb-2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
              id="main-preview-label"
            >
              実サイズ ({iconSettings.canvasSize || 128}×{iconSettings.canvasSize || 128})
            </p>
            <canvas
              ref={canvasRef}
              width={iconSettings.canvasSize || 128}
              height={iconSettings.canvasSize || 128}
              className="icon-canvas mx-auto"
              role="img"
              aria-labelledby="main-preview-label"
              aria-description="作成された絵文字のメインプレビュー表示"
            />
          </div>

          {/* Slack表示サイズ */}
          <div className="text-center">
            <p
              className={`text-xs mb-2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
              id="slack-preview-label"
            >
              Slack表示 (32×32)
            </p>
            <div className="flex items-center justify-center h-32">
              <canvas
                ref={smallCanvasRef}
                width={32}
                height={32}
                className="icon-canvas-small"
                style={{ imageRendering: "pixelated" }}
                role="img"
                aria-labelledby="slack-preview-label"
                aria-description="Slackアプリでの実際の表示サイズのプレビュー"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ファイル情報 */}
      <div className="bg-gray-50 rounded-lg p-3 mb-6">
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">フォーマット:</span>
            <span className="font-medium">
              {iconSettings.animation !== "none" ? "GIF" : "PNG"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">サイズ:</span>
            <span className="font-medium">128 × 128px</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">推定ファイルサイズ:</span>
            <span className="font-medium">&lt; 128KB</span>
          </div>
        </div>
      </div>

      {/* アクションボタン - モバイルでは非表示 */}
      {!isMobile && (
        <div className="space-y-3">
          <button
            onClick={handleDownload}
            className="w-full btn-primary flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            aria-label="作成した絵文字をダウンロード"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            ダウンロード
          </button>

          {navigator.share && (
            <button
              onClick={handleShare}
              className="w-full btn-secondary flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label="絵文字作成ページをシェア"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326"
                />
              </svg>
              シェア
            </button>
          )}
        </div>
      )}

      {/* Slackへの追加方法 - デスクトップのみ表示 */}
      {!isMobile && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium mb-2">💡 Slackへの追加方法</h3>
          <ol className="text-xs text-gray-600 space-y-1">
            <li>1. Slackを開き、ワークスペース名をクリック</li>
            <li>2. 「ワークスペースをカスタマイズ」を選択</li>
            <li>3. 「カスタム絵文字を追加する」をクリック</li>
            <li>4. ダウンロードしたファイルをアップロード</li>
          </ol>
        </div>
      )}
    </div>
  );
}

export default PreviewPanel;
