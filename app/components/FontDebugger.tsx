'use client'

export default function FontDebugger() {
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm z-50">
      <h3 className="font-bold mb-2">字体调试</h3>
      <div className="space-y-1">
        <div className="font-sans">默认字体 (Medium)</div>
        <div className="font-bold">粗体字体</div>
        <div className="font-light">细体字体</div>
        <div className="font-zen-kaku">ZenKaku Medium</div>
        <div className="font-zen-kaku-bold">ZenKaku Bold</div>
        <div className="font-zen-kaku-light">ZenKaku Light</div>
      </div>
    </div>
  )
} 