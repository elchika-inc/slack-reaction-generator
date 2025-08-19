import { useEffect, useRef, useState } from 'react'

// react-colorを動的インポート
let SketchPicker = null

function ColorPicker({ color, onChange, onClose: _onClose }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const PickerComponent = useRef(null)

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

  const handleChange = (newColor) => {
    onChange(newColor.hex)
  }

  // ピッカーがまだロードされていない場合はローディング表示
  if (!isLoaded || !PickerComponent.current) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-4 animate-pulse">
        <div className="w-48 h-48 bg-gray-200 rounded"></div>
      </div>
    )
  }

  const Picker = PickerComponent.current

  return (
    <div className="bg-white rounded-lg shadow-xl">
      <Picker
        color={color}
        onChangeComplete={handleChange}
        disableAlpha
      />
    </div>
  )
}

export default ColorPicker
