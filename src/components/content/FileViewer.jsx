// components/content/FileViewer.jsx
import TextEditor from './TextEditor.jsx';
import TableEditor from './TableEditor.jsx';

const FileViewer = () => {
  const selectedFile = { name: 'Pricing_rule.js', type: 'js' };

  return (
    <div className="flex-1 p-4 bg-gray-100 overflow-auto">
      <h2 className="text-lg font-semibold mb-2">{selectedFile.name}</h2>
      {selectedFile.type === 'txt' && <TextEditor />}
      {selectedFile.type === 'js' && <TableEditor />}
      {!['txt', 'js'].includes(selectedFile.type) && (
        <div className="text-gray-600">Preview not available</div>
      )}
    </div>
  );
};

export default FileViewer;