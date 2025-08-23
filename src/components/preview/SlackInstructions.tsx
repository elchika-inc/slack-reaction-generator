import { useLanguage } from '../../contexts/LanguageContext';

export function SlackInstructions() {
  const { t } = useLanguage();

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-sm font-medium mb-2">{t('preview.slackInstructions.title')}</h3>
      <ol className="text-xs text-gray-600 space-y-1">
        <li>{t('preview.slackInstructions.step1')}</li>
        <li>{t('preview.slackInstructions.step2')}</li>
        <li>{t('preview.slackInstructions.step3')}</li>
        <li>{t('preview.slackInstructions.step4')}</li>
      </ol>
    </div>
  );
}