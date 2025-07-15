const HeaderBar = () => {
  return (
    <header className="bg-[#252526] px-6 py-4 flex justify-between items-center shadow-md border-b border-gray-800 w-full">
      <div className="flex flex-col leading-tight">
        {/* Title Row with Shared Font Size */}
        <div className="flex items-center gap-2 text-5xl font-bold tracking-wide text-white">
          <span role="img" aria-label="brain">🧠</span>
          <span>NEUROFORGE -V.1.0</span>
        </div>

        {/* Tagline Row */}
        <div className="flex items-center gap-2 ml-[10.1rem] mt-1">
          <span className="text-3xl text-white font-normal">powered by endava</span>
          <img
            src="/endava-icon.png"
            alt="Endava logo"
            style={{ width: '1em', height: '1em' }}
            className="inline-block"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex gap-4 items-center">
        <div className="bg-[#007acc] px-3 py-1 rounded text-sm text-white">
          Login Placeholder
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;
