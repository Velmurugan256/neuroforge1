const Footer = () => {
  return (
    <footer className="bg-slate-950 px-8 py-2 flex justify-center items-center border-t border-slate-800/50 text-xs text-slate-500 flex-shrink-0">
      <div className="flex items-center gap-2">
        <span>Powered by</span>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-400">endava</span>
          <img src="/endava-icon.png" alt="Endava logo" className="w-3 h-3 opacity-80" />
        </div>
      </div>
    </footer>
  )
}

export default Footer
