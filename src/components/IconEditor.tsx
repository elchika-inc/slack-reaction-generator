import { useRef, useEffect } from 'react'
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
  const editorRef = useRef<HTMLDivElement>(null);
  
  const { openSections, toggleSection } = useAccordion({
    basic: true,
    animation: false,
    image: false,
    optimization: false
  });

  const sections: Section[] = createEditorSections(iconSettings, handleSettingsChange, isMobile);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!editorRef.current) return;

      // textareaにフォーカスがある場合は、デフォルトの動作を維持
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      // 上下矢印でセクション間を移動
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        const focusableElements = Array.from(
          editorRef.current.querySelectorAll('button, input, textarea, select')
        ) as HTMLElement[];
        
        const currentIndex = focusableElements.findIndex(el => el === document.activeElement);
        
        if (currentIndex !== -1) {
          event.preventDefault();
          const nextIndex = event.key === 'ArrowDown' 
            ? Math.min(currentIndex + 1, focusableElements.length - 1)
            : Math.max(currentIndex - 1, 0);
          
          focusableElements[nextIndex]?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      ref={editorRef}
      className="space-y-2"
      role="region"
      aria-label="絵文字設定エディタ"
    >
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