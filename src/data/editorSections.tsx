import { Section } from '../types/editor';
import { FlatSettings } from '../types/settings';
import BasicSettings from '../components/editor/BasicSettings';
import AnimationSettings from '../components/editor/AnimationSettings';
import ImageSettings from '../components/editor/ImageSettings';
import OptimizationSettings from '../components/editor/OptimizationSettings';
import { BasicIcon, AnimationIcon, ImageIcon, OptimizationIcon } from '../components/editor/SectionIcons';

export function createEditorSections(
  iconSettings: FlatSettings,
  handleSettingsChange: (key: keyof FlatSettings, value: any) => void,
  isMobile: boolean
): Section[] {
  return [
    {
      id: 'basic',
      title: '基本設定',
      icon: <BasicIcon />,
      component: <BasicSettings settings={iconSettings} onChange={handleSettingsChange} isMobile={isMobile} />
    },
    {
      id: 'animation',
      title: 'アニメーション',
      icon: <AnimationIcon />,
      component: <AnimationSettings settings={iconSettings} onChange={handleSettingsChange} isMobile={isMobile} />
    },
    {
      id: 'image',
      title: '画像',
      icon: <ImageIcon />,
      component: <ImageSettings settings={iconSettings} onChange={handleSettingsChange} />
    },
    {
      id: 'optimization',
      title: 'サイズ最適化',
      icon: <OptimizationIcon />,
      component: <OptimizationSettings settings={iconSettings} onChange={handleSettingsChange} />
    }
  ];
}