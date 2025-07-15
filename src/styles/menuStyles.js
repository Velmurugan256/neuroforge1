// src/styles/menuStyles.js
export const sharedMenuStyles = {
  menuClassName: 'bg-gray-800 text-white rounded shadow-lg min-w-max',
  itemProps: {
    className:
      'flex items-center gap-2 whitespace-nowrap ' +      // ← keeps icon + text inline
      'text-white hover:bg-gray-700 focus:bg-gray-700 ' +
      'px-3 py-1',
  },
};
