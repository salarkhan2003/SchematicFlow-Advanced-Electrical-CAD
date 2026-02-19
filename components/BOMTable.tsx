
import React from 'react';
import { SchematicData } from '../types';
import { Download, FileText } from 'lucide-react';

interface Props {
  data: SchematicData;
}

const BOMTable: React.FC<Props> = ({ data }) => {
  const exportCSV = () => {
    const headers = ['Part Name', 'Type', 'Specification', 'Description'];
    const rows = data.components.map(c => [
      c.label,
      c.subType,
      c.value || 'N/A',
      c.description
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bill_of_materials.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden print:border-slate-800">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between print:bg-slate-50 print:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500 print:text-slate-900" />
          Bill of Materials (BOM)
        </h3>
        <button 
          onClick={exportCSV}
          className="text-xs flex items-center gap-1.5 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors no-print"
        >
          <Download className="w-3 h-3" />
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider print:bg-slate-100 print:text-slate-900">
            <tr>
              <th className="px-4 py-3 font-medium print:border-b print:border-slate-300">Ref</th>
              <th className="px-4 py-3 font-medium print:border-b print:border-slate-300">Component</th>
              <th className="px-4 py-3 font-medium print:border-b print:border-slate-300">Spec</th>
              <th className="px-4 py-3 font-medium print:border-b print:border-slate-300 print:table-cell hidden">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 print:divide-slate-300">
            {data.components.map((comp) => (
              <tr key={comp.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{comp.label}</td>
                <td className="px-4 py-3 text-slate-600">{comp.subType}</td>
                <td className="px-4 py-3 text-blue-600 font-mono font-bold">{comp.value || '-'}</td>
                <td className="px-4 py-3 text-slate-500 text-[10px] print:table-cell hidden max-w-xs">{comp.description}</td>
              </tr>
            ))}
            {data.components.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">
                  No components in circuit.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BOMTable;
