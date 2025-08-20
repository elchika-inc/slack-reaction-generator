import { useState } from 'react';
import { OpenSections } from '../types/editor';

export function useAccordion(initialState: OpenSections) {
  const [openSections, setOpenSections] = useState<OpenSections>(initialState);

  const toggleSection = (section: keyof OpenSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return {
    openSections,
    toggleSection
  };
}