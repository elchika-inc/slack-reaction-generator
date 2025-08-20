export interface Section {
  id: 'basic' | 'animation' | 'image' | 'optimization';
  title: string;
  icon: React.ReactElement;
  component: React.ReactElement;
}

export interface OpenSections {
  basic: boolean;
  animation: boolean;
  image: boolean;
  optimization: boolean;
}

export interface AccordionHeaderProps {
  section: Section;
  isOpen: boolean;
  onToggle: () => void;
}

export interface AccordionContentProps {
  section: Section;
  isOpen: boolean;
}

export interface SectionIconProps {
  type: 'basic' | 'animation' | 'image' | 'optimization';
}