import { useIconSettingsContext } from '../contexts/IconSettingsContext'
import { useAppStateContext } from '../contexts/AppStateContext'
import { useAccordion } from '../hooks/useAccordion'
import { createEditorSections } from '../data/editorSections'
import AccordionHeader from './editor/AccordionHeader'
import AccordionContent from './editor/AccordionContent'
import { Section } from '../types/editor'

function IconEditor() {
  const { iconSettings, handleSettingsChange } = useIconSettingsContext();
  const { isMobile } = useAppStateContext();
  
  const { openSections, toggleSection } = useAccordion({
    basic: true,
    animation: false,
    image: false,
    optimization: false
  });

  const sections: Section[] = createEditorSections(iconSettings, handleSettingsChange, isMobile);

  return (
    <div className="space-y-2">
      {sections.map((section) => (
        <div key={section.id} className="border border-gray-200 rounded-lg shadow-md">
          <AccordionHeader 
            section={section}
            isOpen={openSections[section.id]}
            onToggle={() => toggleSection(section.id)}
          />
          <AccordionContent 
            section={section}
            isOpen={openSections[section.id]}
          />
        </div>
      ))}
    </div>
  )
}

export default IconEditor