import { useEffect, useCallback } from 'react';

interface KeyboardNavigationOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onSpace?: () => void;
  onTab?: (direction: 'forward' | 'backward') => void;
  onArrowKey?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  disabled?: boolean;
}

export function useKeyboardNavigation({
  onEscape,
  onEnter,
  onSpace,
  onTab,
  onArrowKey,
  disabled = false
}: KeyboardNavigationOptions) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter();
        }
        break;
      case ' ':
        if (onSpace) {
          event.preventDefault();
          onSpace();
        }
        break;
      case 'Tab':
        if (onTab) {
          event.preventDefault();
          onTab(event.shiftKey ? 'backward' : 'forward');
        }
        break;
      case 'ArrowUp':
        if (onArrowKey) {
          event.preventDefault();
          onArrowKey('up');
        }
        break;
      case 'ArrowDown':
        if (onArrowKey) {
          event.preventDefault();
          onArrowKey('down');
        }
        break;
      case 'ArrowLeft':
        if (onArrowKey) {
          event.preventDefault();
          onArrowKey('left');
        }
        break;
      case 'ArrowRight':
        if (onArrowKey) {
          event.preventDefault();
          onArrowKey('right');
        }
        break;
    }
  }, [onEscape, onEnter, onSpace, onTab, onArrowKey, disabled]);

  useEffect(() => {
    if (disabled) return;
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, disabled]);
}

export function useFocusManagement() {
  const trapFocus = useCallback((containerElement: HTMLElement) => {
    const focusableElements = containerElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    containerElement.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      containerElement.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  const restoreFocus = useCallback((previouslyFocusedElement: HTMLElement | null) => {
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
    }
  }, []);

  return { trapFocus, restoreFocus };
}