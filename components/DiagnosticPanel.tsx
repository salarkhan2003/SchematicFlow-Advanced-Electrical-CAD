
import React, { useMemo } from 'react';
import { SchematicData, DiagnosticResult, ComponentType } from '../types';
import { AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

interface Props {
  data: SchematicData;
}

const DiagnosticPanel: React.FC<Props> = ({ data }) => {
  const diagnostics = useMemo<DiagnosticResult[]>(() => {
    const results: DiagnosticResult[] = [];
    if (!data.components || data.components.length === 0) return [];

    const hasSource = data.components.some(c => c.type === ComponentType.SOURCE);
    const hasGround = data.components.some(c => c.type === ComponentType.GROUND);
    const hasProtection = data.components.some(c => c.type === ComponentType.PROTECTION);

    if (!hasSource) {
      results.push({
        status: 'ERROR',
        message: 'No power source detected. Circuit will not function.',
        code: 'MISSING_SOURCE'
      });
    }

    if (!hasGround) {
      results.push({
        status: 'WARNING',
        message: 'No ground return detected. Ensure a return path to the negative terminal is established.',
        code: 'MISSING_GROUND'
      });
    }

    if (!hasProtection) {
      results.push({
        status: 'WARNING',
        message: 'No over-current protection (Fuse/Breaker). Safety hazard if a short occurs.',
        code: 'SAFETY_RISK'
      });
    }

    if (hasSource && hasGround && hasProtection) {
      results.push({
        status: 'SAFE',
        message: 'Continuity loop verified. Core components present.',
        code: 'VALIDATED'
      });
    }

    return results;
  }, [data]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-slate-500" />
        Logic Diagnostics
      </h3>
      <div className="space-y-2">
        {diagnostics.length === 0 && (
          <p className="text-xs text-slate-400 italic">No circuit logic to analyze.</p>
        )}
        {diagnostics.map((diag, i) => (
          <div 
            key={i} 
            className={`flex items-start gap-3 p-3 rounded-lg border text-xs leading-relaxed ${
              diag.status === 'ERROR' ? 'bg-red-50 border-red-100 text-red-700' :
              diag.status === 'WARNING' ? 'bg-amber-50 border-amber-100 text-amber-700' :
              'bg-emerald-50 border-emerald-100 text-emerald-700'
            }`}
          >
            {diag.status === 'ERROR' ? <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> :
             diag.status === 'WARNING' ? <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> :
             <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />}
            <p>{diag.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiagnosticPanel;
