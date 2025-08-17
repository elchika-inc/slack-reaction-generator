// 軽量でSEO影響のないシンプルカラーピッカー
export default function ColorPicker({ color, onChange, onClose }) {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FD79A8', '#A29BFE',
    '#6C5CE7', '#00B894', '#FDCB6E', '#E17055', '#74B9FF',
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#808080', '#800000'
  ]

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 w-60">
      <div className="grid grid-cols-5 gap-2 mb-3">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => {
              onChange(c)
              onClose()
            }}
            className={`w-8 h-8 rounded border-2 ${
              color === c ? 'border-purple-500' : 'border-gray-300'
            } hover:scale-105`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>
      
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-8 rounded border border-gray-300"
      />
    </div>
  )
}