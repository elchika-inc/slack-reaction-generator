import { AccordionHeaderProps } from '../../types/editor';

function AccordionHeader({ section, isOpen, onToggle }: AccordionHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full px-4 py-3 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between ${
        isOpen ? '' : 'rounded-lg'
      }`}
      aria-expanded={isOpen}
      aria-controls={`section-${section.id}`}
    >
      <div className="flex items-center gap-3">
        <div className="text-purple-600">
          {section.icon}
        </div>
        <h3 className="text-sm font-semibold text-gray-700">
          {section.title}
        </h3>
      </div>
      <svg
        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

export default AccordionHeader;