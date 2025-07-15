// components/controls/ActionToolbar.jsx
import { FaSave, FaEye, FaCheck, FaPlus, FaTrash, FaFile } from 'react-icons/fa';

const ActionToolbar = () => {
  const fileType = 'js';
  const isFileSelected = fileType === 'txt' || fileType === 'js';

  return (
    <div className="bg-gray-800 text-white px-4 py-2 flex gap-4 text-sm items-center">
      <button disabled={!isFileSelected} className="hover:text-green-400 disabled:text-gray-500"><FaSave /> Save</button>
      <button disabled={!isFileSelected} className="hover:text-blue-400 disabled:text-gray-500"><FaEye /> Review</button>
      <button disabled={!isFileSelected} className="hover:text-purple-400 disabled:text-gray-500"><FaCheck /> Commit</button>

      {fileType === 'js' && (
        <>
          <button className="hover:text-yellow-300"><FaPlus /> Add Row</button>
          <button className="hover:text-yellow-300"><FaPlus /> Add Column</button>
          <button className="hover:text-red-400"><FaTrash /> Delete Row</button>
          <button className="hover:text-red-400"><FaTrash /> Delete Column</button>
        </>
      )}

      <div className="ml-auto flex gap-4">
        <button><FaFile /> Add .txt</button>
        <button><FaFile /> Add Rules</button>
        <button><FaFile /> Upload Doc</button>
      </div>
    </div>
  );
};

export default ActionToolbar;