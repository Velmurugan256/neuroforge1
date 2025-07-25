"use client"

import ChatInterface from "./ChatInterface"

const ChatPlayground = ({ onClose }) => {
  return (
    <div className="flex flex-col flex-1 h-full bg-slate-950 text-white font-sans text-sm">
      {/* Tab bar to match other viewers */}
      <div className="flex-shrink-0 bg-slate-950 border-b border-slate-800/50 shadow-lg">
        <div className="flex">
          <div className="flex items-center pl-4 pr-2 py-2.5 border-r border-slate-800/50 bg-slate-900 min-w-0 max-w-[220px] group relative">
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 shadow-[0_0_10px_theme(colors.cyan.500)]"></div>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-lg flex-shrink-0">🤖</span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-white">AI Playground</div>
                <div className="text-xs text-slate-500 truncate">Interactive Chat</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden bg-slate-950">
        <ChatInterface onClose={onClose} />
      </div>
    </div>
  )
}

export default ChatPlayground
