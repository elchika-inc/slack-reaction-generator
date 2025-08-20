import { AccordionHeaderProps } from '../../types/editor';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';

function AccordionHeader({ section, isOpen, onToggle }: AccordionHeaderProps) {
  useKeyboardNavigation({
    onEnter: onToggle,
    onSpace: onToggle,
  });

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle();
    }
  };

  return (
    <button
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      className={`w-full px-4 py-3 bg-white hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 transition-colors flex items-center justify-between ${
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
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

export default AccordionHeader;