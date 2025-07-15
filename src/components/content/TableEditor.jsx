// components/content/TableEditor.jsx
const TableEditor = () => (
  <table className="table-auto w-full text-sm border border-gray-300 bg-white">
    <thead>
      <tr className="bg-gray-200">
        <th className="border px-2 py-1">Rule</th>
        <th className="border px-2 py-1">Definition</th>
        <th className="border px-2 py-1">Severity</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td className="border px-2 py-1">LoginLimit</td>
        <td className="border px-2 py-1">Max 5 logins</td>
        <td className="border px-2 py-1">High</td>
      </tr>
      <tr>
        <td className="border px-2 py-1">Timeout</td>
        <td className="border px-2 py-1">30 minutes</td>
        <td className="border px-2 py-1">Medium</td>
      </tr>
    </tbody>
  </table>
);

export default TableEditor;
