import { AccordionContentProps } from '../../types/editor';

function AccordionContent({ section, isOpen }: AccordionContentProps) {
  return (
    <div
      id={`section-${section.id}`}
      className={`transition-all duration-300 ${
        isOpen 
          ? 'max-h-[2000px] opacity-100' 
          : 'max-h-0 opacity-0 overflow-hidden'
      }`}
      style={{ 
        position: 'relative', 
        zIndex: isOpen ? 10 : 0 
      }}
    >
      <div className="px-4 py-4 bg-white border-t border-gray-200 relative rounded-b-lg">
        {section.component}
      </div>
    </div>
  );
}

export default AccordionContent;