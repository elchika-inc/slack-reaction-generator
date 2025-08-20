import { useEffect } from "react";
import { JSX } from "preact/jsx-runtime";
import { FunctionalComponent } from "preact";
import Header from "./components/Header";
import IconEditor from "./components/IconEditor";
import PreviewPanel from "./components/PreviewPanel";
import ErrorNotification from "./components/ErrorNotification";
import { IconSettingsProvider, useIconSettingsContext } from "./contexts/IconSettingsContext";
import { CanvasProvider, useCanvasContext } from "./contexts/CanvasContext";
import { AppStateProvider, useAppStateContext } from "./contexts/AppStateContext";

const AppContent: FunctionalComponent = () => {
  const { iconSettings, handleSettingsChange } = useIconSettingsContext();
  const { previewData, handleGeneratePreview, canvasRef, smallCanvasRef } = useCanvasContext();
  const { isMobile, theme, setTheme, configureNetworkFeatures } = useAppStateContext();

  useEffect(() => {
    configureNetworkFeatures(handleSettingsChange);
  }, [configureNetworkFeatures, handleSettingsChange]);

  const onGeneratePreview = (): void => {
    handleGeneratePreview(iconSettings, isMobile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <ErrorNotification />
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
            <IconEditor />
          </section>

          {/* デスクトップ用プレビュー */}
          {!isMobile && (
            <section className="lg:col-span-1" aria-label="絵文字プレビュー">
              <PreviewPanel
                previewData={previewData}
                onRegenerate={onGeneratePreview}
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
              onClick={onGeneratePreview}
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

const App: FunctionalComponent = () => {
  return (
    <AppStateProvider>
      <IconSettingsProvider>
        <AppWithProviders />
      </IconSettingsProvider>
    </AppStateProvider>
  );
}

const AppWithProviders: FunctionalComponent = () => {
  const { iconSettings } = useIconSettingsContext();
  const { isMobile } = useAppStateContext();

  return (
    <CanvasProvider iconSettings={iconSettings} isMobile={isMobile}>
      <AppContent />
    </CanvasProvider>
  );
}

export default App;
