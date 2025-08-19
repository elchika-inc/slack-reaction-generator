import { useState } from 'react'
import BasicSettings from './editor/BasicSettings'
import AnimationSettings from './editor/AnimationSettings'
import ImageSettings from './editor/ImageSettings'
import OptimizationSettings from './editor/OptimizationSettings'

function IconEditor({ settings, onChange, isMobile }) {
  // アコーディオンの開閉状態を管理
  const [openSections, setOpenSections] = useState({
    basic: true,
    animation: false,
    image: false,
    optimization: false
  })

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const sections = [
    {
      id: 'basic',
      title: '基本設定',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      component: <BasicSettings settings={settings} onChange={onChange} isMobile={isMobile} />
    },
    {
      id: 'animation',
      title: 'アニメーション',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      component: <AnimationSettings settings={settings} onChange={onChange} isMobile={isMobile} />
    },
    {
      id: 'image',
      title: '画像',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      component: <ImageSettings settings={settings} onChange={onChange} />
    },
    {
      id: 'optimization',
      title: 'サイズ最適化',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      ),
      component: <OptimizationSettings settings={settings} onChange={onChange} />
    }
  ]

  return (
    <div className="space-y-2">
      {sections.map((section) => (
        <div key={section.id} className="border border-gray-200 rounded-lg shadow-md" style={{ overflow: openSections[section.id] ? 'visible' : 'hidden' }}>
          {/* アコーディオンヘッダー */}
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full px-4 py-3 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
            aria-expanded={openSections[section.id]}
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
                openSections[section.id] ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* アコーディオンコンテンツ */}
          <div
            id={`section-${section.id}`}
            className={`transition-all duration-300 ${
              openSections[section.id] 
                ? 'max-h-[2000px] opacity-100' 
                : 'max-h-0 opacity-0'
            }`}
            style={{ 
              overflow: openSections[section.id] ? 'visible' : 'hidden',
              position: 'relative', 
              zIndex: openSections[section.id] ? 10 : 0 
            }}
          >
            <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 relative">
              {section.component}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default IconEditor