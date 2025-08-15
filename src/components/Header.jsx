function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg sm:text-xl">S</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                Slack Reaction Generator
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                カスタムリアクション絵文字を簡単作成
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <a
              href="https://slack.com/help/articles/206870177"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              <span className="hidden sm:inline">Slackガイドライン</span>
              <span className="sm:hidden">ガイド</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
