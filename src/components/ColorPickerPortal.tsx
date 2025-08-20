import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// react-colorを動的インポート
let SketchPicker = null

function ColorPickerPortal({ color, onChange, onClose, anchorEl }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const PickerComponent = useRef(null)
  const portalRef = useRef(null)

  useEffect(() => {
    // react-colorのSketchPickerを動的にインポート
    if (!SketchPicker) {
      import('react-color').then((module) => {
        SketchPicker = module.SketchPicker
        PickerComponent.current = SketchPicker
        setIsLoaded(true)
      })
    } else {
      PickerComponent.current = SketchPicker
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    // anchorElの位置を基準にピッカーの位置を計算
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect()
      const scrollY = window.scrollY
      const scrollX = window.scrollX
      
      // ピッカーのサイズ（おおよそ）
      const pickerWidth = 220
      const pickerHeight = 300
      
      // 画面内に収まるように位置を調整
      let left = rect.left + scrollX
      let top = rect.bottom + scrollY + 8
      
      // 右端からはみ出る場合は左に寄せる
      if (left + pickerWidth > window.innerWidth + scrollX) {
        left = window.innerWidth + scrollX - pickerWidth - 20
      }
      
      // 下端からはみ出る場合は上に表示
      if (top + pickerHeight > window.innerHeight + scrollY) {
        top = rect.top + scrollY - pickerHeight - 8
      }
      
      setPosition({ top, left })
    }
  }, [anchorEl])

  const handleChange = (newColor) => {
    onChange(newColor.hex)
  }

  // ピッカーがまだロードされていない場合はローディング表示
  if (!isLoaded || !PickerComponent.current) {
    return createPortal(
      <>
        <div 
          className="fixed inset-0 z-[1000]" 
          onClick={onClose}
        />
        <div 
          className="absolute z-[1001] bg-white rounded-lg shadow-xl p-4 animate-pulse"
          style={{ top: position.top, left: position.left }}
        >
          <div className="w-48 h-48 bg-gray-200 rounded"></div>
        </div>
      </>,
      document.body
    )
  }

  const Picker = PickerComponent.current

  return createPortal(
    <>
      <div 
        className="fixed inset-0 z-[1000]" 
        onClick={onClose}
      />
      <div 
        className="absolute z-[1001] bg-white rounded-lg shadow-xl"
        style={{ top: position.top, left: position.left }}
      >
        <Picker
          color={color}
          onChangeComplete={handleChange}
          disableAlpha
        />
      </div>
    </>,
    document.body
  )
}

export default ColorPickerPortal