const Breadcrumb = ({ pathArray = [] }) => {
  // Show "/" for root directory when no path
  if (pathArray.length === 0) {
    return (
      <div className="text-gray-400 text-xs font-mono mb-2">
        <span className="text-white">/</span>
      </div>
    )
  }

  return (
    <div className="text-gray-400 text-xs font-mono mb-2">
      <span className="text-white">/</span>
      {pathArray.map((crumb, i) => (
        <span key={i} className="text-white">
          {" / "}
          {decodeURIComponent(crumb)}
        </span>
      ))}
    </div>
  )
}

export default Breadcrumb
