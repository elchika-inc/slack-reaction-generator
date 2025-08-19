import { useState, useEffect, useRef } from "react";
// file-saverを遅延読み込み
let saveAs = null;
const loadFileSaver = async () => {
  if (!saveAs) {
    const module = await import("file-saver");
    saveAs = module.saveAs;
  }
  return saveAs;
};
import Header from "./components/Header";
import IconEditor from "./components/IconEditor";
import PreviewPanel from "./components/PreviewPanel";
import { shouldEnableFeature } from "./utils/networkAware";
// gifencライブラリを使用（透明背景サポート向上）
// 従来のgif.jsを使いたい場合は以下をコメントアウト解除
import {
  generateIconData,
  drawAnimationFrame,
  drawTextIcon,
} from "./utils/canvasUtils";

function App() {
  // ランダムな色を生成
  const getRandomColor = () => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FD79A8",
      "#A29BFE",
      "#6C5CE7",
      "#00B894",
      "#FDCB6E",
      "#E17055",
      "#74B9FF",
      "#A29BFE",
      "#FD79A8",
      "#55A3FF",
      "#FD79A8",
      "#00CEC9",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const [iconSettings, setIconSettings] = useState({
    text: "いいかも",
    fontSize: 60,
    fontFamily: '"Noto Sans JP", sans-serif',
    fontColor: getRandomColor(),
    secondaryColor: "#FFD700", // グローと点滅用のセカンドカラー
    backgroundType: "transparent", // 'transparent' or 'color'
    backgroundColor: "#FFFFFF",
    animation: "none",
    animationSpeed: 20, // デフォルトを超高速（20ms）に設定
    animationAmplitude: 50, // アニメーション幅の制御（デフォルト50%）
    textColorType: "solid", // 'solid' or 'gradient'
    gradientColor1: getRandomColor(),
    gradientColor2: getRandomColor(),
    gradientDirection: "vertical", // 'vertical' or 'horizontal'
    // 画像関連の設定
    imageData: null, // 画像データ（base64）
    imageX: 50, // 画像のX位置（0-100%）
    imageY: 50, // 画像のY位置（0-100%）
    imageSize: 50, // 画像のサイズ（0-100%）
    imageOpacity: 100, // 画像の透過度（0-100%）
    imagePosition: "back", // 画像の前後位置（'front' or 'back'）
    imageAnimation: "none", // 画像のアニメーション
    imageAnimationAmplitude: 50, // 画像アニメーションの幅（0-100%）
    // サイズ最適化設定
    canvasSize: 128, // 出力キャンバスサイズ（64 or 128）
    pngQuality: 85, // PNG品質（0-100）
    gifQuality: 20, // GIF品質（1-30、数値が小さいほど高品質）
    gifFrames: 30, // GIFフレーム数（5-30）
  });
  const [previewData, setPreviewData] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState("light");

  // モバイル用Canvas refs
  const canvasRef = useRef(null);
  const smallCanvasRef = useRef(null);
  const animationRef = useRef(null);
  const smallAnimationRef = useRef(null);
  const frameRef = useRef(0);
  const smallFrameRef = useRef(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // ネットワーク状況に基づいてアニメーションを調整
    if (!shouldEnableFeature("animations")) {
      setIconSettings((prev) => ({ ...prev, animation: "none" }));
    }

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // モバイル用プレビュー描画
  useEffect(() => {
    if (!isMobile) return;

    // アニメーション停止
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (smallAnimationRef.current) {
      cancelAnimationFrame(smallAnimationRef.current);
      smallAnimationRef.current = null;
    }

    const loadFonts = async () => {
      if (iconSettings.fontFamily && iconSettings.fontFamily !== "sans-serif") {
        const fontFamily = iconSettings.fontFamily;
        const isDecorativeFont =
          fontFamily.includes("Pacifico") || fontFamily.includes("Caveat");
        let fontWeight = "bold";
        if (fontFamily.includes("M PLUS") || fontFamily.includes("M+")) {
          fontWeight = "900";
        } else if (isDecorativeFont) {
          fontWeight = "normal";
        }

        try {
          await document.fonts.load(`${fontWeight} 16px ${fontFamily}`);
        } catch (e) {
          // Font loading error
        }
      }
    };

    loadFonts().then(() => {
      if (canvasRef.current && smallCanvasRef.current) {
        const canvas = canvasRef.current;
        const canvasSize = iconSettings.canvasSize || 128;
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        const ctx = canvas.getContext("2d", {
          alpha: true,
          willReadFrequently: true,
        });

        const smallCanvas = smallCanvasRef.current;
        smallCanvas.width = 32;
        smallCanvas.height = 32;
        const smallCtx = smallCanvas.getContext("2d", {
          alpha: true,
          willReadFrequently: true,
        });

        // テキストまたは画像のアニメーションがある場合はリアルタイムで描画
        const hasTextAnimation =
          iconSettings.animation && iconSettings.animation !== "none";
        const hasImageAnimation =
          iconSettings.imageData &&
          iconSettings.imageAnimation &&
          iconSettings.imageAnimation !== "none";

        if (hasTextAnimation || hasImageAnimation) {
          frameRef.current = 0;
          smallFrameRef.current = 0;
          const frameCount = 30;
          const requestedDelay = iconSettings.animationSpeed || 33;
          const delay = requestedDelay < 30 ? 30 : requestedDelay;
          let lastTime = 0;
          let smallLastTime = 0;

          const animate = (currentTime) => {
            if (!lastTime) lastTime = currentTime;
            const deltaTime = currentTime - lastTime;

            if (deltaTime >= delay) {
              frameRef.current = (frameRef.current + 1) % frameCount;
              ctx.fillStyle = iconSettings.backgroundColor || "#FFFFFF";
              ctx.fillRect(0, 0, canvasSize, canvasSize);
              drawAnimationFrame(
                ctx,
                iconSettings,
                frameRef.current,
                frameCount
              );
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
        } else {
          // アニメーションなしの場合は静止画を生成
          ctx.clearRect(0, 0, canvasSize, canvasSize);
          smallCtx.clearRect(0, 0, 32, 32);
          drawTextIcon(ctx, iconSettings);
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
  }, [iconSettings, isMobile]);

  const handleSettingsChange = (newSettings) => {
    setIconSettings({ ...iconSettings, ...newSettings });
  };

  const handleGeneratePreview = async () => {
    const data = await generateIconData(iconSettings);
    setPreviewData(data);

    // モバイルの場合は自動でダウンロード
    if (isMobile) {
      const fileName = `slack-reaction-${Date.now()}.${
        iconSettings.animation !== "none" ? "gif" : "png"
      }`;
      try {
        const response = await fetch(data);
        const blob = await response.blob();
        const fileSaver = await loadFileSaver();
        fileSaver(blob, fileName);
      } catch (error) {
        // Download error
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />

      <main
        className={`container mx-auto px-2 lg:px-4 py-4 lg:py-8 ${
          isMobile ? "pb-80" : ""
        }`}
        role="main"
        aria-label="Slack絵文字作成エディタ"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* エディタ部分 */}
          <section className="lg:col-span-2" aria-label="絵文字設定エディタ">
            <h2 className="sr-only">絵文字の設定とカスタマイズ</h2>
            <IconEditor
              settings={iconSettings}
              onChange={handleSettingsChange}
              isMobile={isMobile}
            />
          </section>

          {/* デスクトップ用プレビュー */}
          {!isMobile && (
            <section className="lg:col-span-1" aria-label="絵文字プレビュー">
              <PreviewPanel
                settings={iconSettings}
                previewData={previewData}
                onRegenerate={handleGeneratePreview}
              />
            </section>
          )}
        </div>
      </main>

      {/* モバイル用固定プレビュー＆ボタン */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-30">
          {/* プレビュー部分 */}
          <div
            className={`border-t border-gray-200 px-4 py-3 ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-around">
              {/* 128x128プレビュー */}
              <div className="text-center">
                <p
                  className={`text-xs mb-1 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  実サイズ
                </p>
                <canvas
                  ref={canvasRef}
                  width={iconSettings.canvasSize || 128}
                  height={iconSettings.canvasSize || 128}
                  className="icon-canvas mx-auto"
                  style={{ width: "80px", height: "80px" }}
                />
              </div>

              {/* 32x32プレビュー */}
              <div className="text-center">
                <p
                  className={`text-xs mb-1 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Slack表示
                </p>
                <div
                  className="flex items-center justify-center"
                  style={{ height: "80px" }}
                >
                  <canvas
                    ref={smallCanvasRef}
                    width={32}
                    height={32}
                    className="icon-canvas-small"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
              </div>

              {/* テーマ切り替え */}
              <div className="text-center">
                <p
                  className={`text-xs mb-1 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  背景
                </p>
                <div className="inline-flex rounded-lg border border-gray-200">
                  <button
                    onClick={() => setTheme("light")}
                    className={`px-2 py-1 text-xs ${
                      theme === "light" ? "bg-gray-100" : ""
                    }`}
                  >
                    ライト
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`px-2 py-1 text-xs ${
                      theme === "dark" ? "bg-gray-100" : ""
                    }`}
                  >
                    ダーク
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ボタン部分 */}
          <div className="bg-white border-t border-gray-100 p-3">
            <button
              onClick={handleGeneratePreview}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
