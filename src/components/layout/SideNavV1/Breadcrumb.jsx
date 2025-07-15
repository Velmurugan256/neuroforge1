import React from 'react';

const Breadcrumb = ({ pathArray = [] }) => {
  if (pathArray.length === 0) return null;

  return (
    <div className="text-gray-400 text-xs font-mono mb-2">
      {pathArray.map((crumb, i) => (
        <span key={i} className="text-white">
          {i > 0 && ' / '}
          {decodeURIComponent(crumb)}
        </span>
      ))}
    </div>
  );
};

export default Breadcrumb;
