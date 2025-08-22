import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

function Header() {
  const { t } = useLanguage();
  return (
    <header
      className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40"
      style={{ minHeight: "64px" }}
      role="banner"
    >
      <div className="container mx-auto px-3 lg:px-4 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div
              className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0"
              aria-hidden="true"
              role="img"
              aria-label={t('app.title')}
            >
              <span className="text-white font-bold text-lg lg:text-xl">S</span>
            </div>
            <div>
              <h1
                className="text-lg lg:text-2xl font-bold text-gray-900"
                style={{ lineHeight: "1.2" }}
              >
                {t('app.title')}
              </h1>
              <p
                className="text-xs lg:text-sm text-gray-700 hidden lg:block"
                style={{ lineHeight: "1.2" }}
              >
                {t('app.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
