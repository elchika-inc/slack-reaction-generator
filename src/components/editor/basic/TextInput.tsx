import { FlatSettings } from '../../../types/settings';
import { useLanguage } from '../../../contexts/LanguageContext';
import { TEXT_CONSTANTS } from '../../../constants/appConstants';

interface TextInputProps {
  text: string;
  onChange: (text: string) => void;
}

export function TextInput({ text, onChange }: TextInputProps) {
  const { t } = useLanguage();

  return (
    <div>
      <label htmlFor="emoji-text-input" className="block text-sm font-medium text-gray-700 mb-2">
        {t('editor.basic.text')}
        <span className="text-xs text-gray-500 ml-1">({t('editor.basic.maxChars')})</span>
      </label>
      <textarea
        id="emoji-text-input"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          // Enterキーが押されたときはイベントの伝播を停止
          if (e.key === 'Enter') {
            e.stopPropagation();
          }
        }}
        maxLength={TEXT_CONSTANTS.MAX_LENGTH}
        rows={3}
        className="w-full px-3 py-3 lg:py-2 text-base lg:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono"
        aria-describedby="text-help"
        placeholder={t('editor.basic.textPlaceholder')}
      />
      <div id="text-help" className="mt-1 flex justify-between text-xs text-gray-500" aria-live="polite">
        <span>{t('editor.basic.textHelp')}</span>
        <span aria-label={t('editor.basic.charCount', { current: text.length, max: TEXT_CONSTANTS.MAX_LENGTH })}>
          {text.length} / {TEXT_CONSTANTS.MAX_LENGTH}
        </span>
      </div>
    </div>
  );
}