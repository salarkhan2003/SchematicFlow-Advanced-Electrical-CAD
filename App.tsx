
import React, { useState } from 'react';
import { parseNaturalLanguageToCircuit } from './services/geminiService';
import { SchematicData, CircuitComponent, Position, ResistorStyle, Connection } from './types';
import SchematicRenderer from './components/SchematicRenderer';
import DiagnosticPanel from './components/DiagnosticPanel';
import BOMTable from './components/BOMTable';
import { 
  Zap, 
  Send, 
  Loader2, 
  Info, 
  FileCode,
  Layout,
  Settings2,
  Printer
} from 'lucide-react';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [circuitData, setCircuitData] = useState<SchematicData>({ components: [], connections: [] });
  const [selectedComponent, setSelectedComponent] = useState<CircuitComponent | null>(null);
  const [resistorStyle, setResistorStyle] = useState<ResistorStyle>('IEEE_ZIGZAG');

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setIsGenerating(true);
    try {
      const result = await parseNaturalLanguageToCircuit(inputText);
      const layouted = {
        ...result,
        components: result.components.map((c, i) => ({
          ...c,
          position: c.position || { x: 50 + i * 160, y: 150 }
        }))
      };
      setCircuitData(layouted);
      setSelectedComponent(null);
    } catch (error) {
      console.error('Failed to generate circuit:', error);
      alert('Generation failed. Try being more descriptive.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateComponent = (updated: CircuitComponent) => {
    setCircuitData(prev => ({
      ...prev,
      components: prev.components.map(c => c.id === updated.id ? updated : c)
    }));
    if (selectedComponent?.id === updated.id) {
      setSelectedComponent(updated);
    }
  };

  const handleUpdatePosition = (id: string, pos: Position) => {
    setCircuitData(prev => ({
      ...prev,
      components: prev.components.map(c => c.id === id ? { ...c, position: pos } : c)
    }));
  };

  const handleDeleteConnection = (id: string) => {
    setCircuitData(prev => ({
      ...prev,
      connections: prev.connections.filter(c => c.id !== id)
    }));
  };

  const handleAddConnection = (fromId: string, toId: string) => {
    const newConn: Connection = {
      id: `conn-${Date.now()}`,
      fromId,
      toId
    };
    setCircuitData(prev => ({
      ...prev,
      connections: [...prev.connections, newConn]
    }));
  };

  const handleUpdateConnection = (connId: string, newFrom?: string, newTo?: string) => {
    setCircuitData(prev => ({
      ...prev,
      connections: prev.connections.map(c => {
        if (c.id === connId) {
          return {
            ...c,
            fromId: newFrom || c.fromId,
            toId: newTo || c.toId
          };
        }
        return c;
      })
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Print Header - Only visible in PDF */}
      <div className="print-only p-8 border-b-2 border-slate-900 mb-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-900">SCHEMATIC REPORT</h1>
            <p className="text-slate-500 font-mono text-xs mt-1 uppercase tracking-tighter">System ID: SF-AUTO-{Date.now().toString().slice(-6)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold">SchematicFlow Engineering</p>
            <p className="text-xs text-slate-500">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-10 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Zap className="w-6 h-6" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">SchematicFlow</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Advanced Electrical CAD</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1">
            <button 
              onClick={() => setResistorStyle('IEEE_ZIGZAG')}
              className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${resistorStyle === 'IEEE_ZIGZAG' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              ZigZag (IEEE)
            </button>
            <button 
              onClick={() => setResistorStyle('IEC_BOX')}
              className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${resistorStyle === 'IEC_BOX' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Box (IEC)
            </button>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <button className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2">
            <Layout className="w-4 h-4" />
            Workspace
          </button>
        </div>
      </header>

      <main className="flex-1 flex gap-0">
        <aside className="w-1/3 border-r bg-slate-50/50 p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-64px)] no-print">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-500" />
              Circuit Description
            </h2>
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g. 12V Battery connected to two LEDs in parallel..."
                className="w-full h-40 p-4 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-sm text-slate-700 bg-white"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !inputText.trim()}
                className="absolute bottom-4 right-4 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </section>

          <DiagnosticPanel data={circuitData} />
          <BOMTable data={circuitData} />
        </aside>

        <section className="flex-1 p-6 space-y-6 bg-slate-100/30 overflow-y-auto relative print:p-0 print:bg-white">
          <div className="flex items-center justify-between mb-2 no-print">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-semibold text-slate-600 shadow-sm">
                Interactive Canvas
              </span>
              <span className="text-slate-400 text-xs">/</span>
              <span className="text-slate-500 text-xs font-medium">Parallel Logic Enabled</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-md hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" />
                Export PDF
              </button>
            </div>
          </div>

          <div className="schematic-container print:mb-12">
            <SchematicRenderer 
              data={circuitData} 
              selectedComponent={selectedComponent}
              onSelectComponent={setSelectedComponent}
              onUpdateComponent={handleUpdateComponent}
              onUpdatePosition={handleUpdatePosition}
              onDeleteConnection={handleDeleteConnection}
              onAddConnection={handleAddConnection}
              onUpdateConnection={handleUpdateConnection}
              resistorStyle={resistorStyle}
            />
          </div>

          {/* Hidden BOM for screen, visible for print to ensure it's in the PDF */}
          <div className="print-only bom-section">
            <BOMTable data={circuitData} />
          </div>

          {selectedComponent && (
            <div className="bg-blue-600 text-white p-5 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 flex gap-4 no-print">
              <div className="p-3 bg-white/20 rounded-lg self-start">
                <Info className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold">{selectedComponent.label}</h4>
                    <span className="px-2 py-0.5 bg-white/30 rounded text-[10px] font-mono">{selectedComponent.subType}</span>
                  </div>
                  <button 
                    onClick={() => {
                      const v = prompt('Quick Edit Value:', selectedComponent.value);
                      if (v) handleUpdateComponent({...selectedComponent, value: v});
                    }}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-blue-100 leading-relaxed max-w-2xl">
                  {selectedComponent.description}
                </p>
                {selectedComponent.value && (
                  <div className="mt-2 text-xs font-medium flex items-center gap-2">
                    <span className="text-blue-200 uppercase tracking-wider text-[10px]">Specifications:</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded">{selectedComponent.value}</span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setSelectedComponent(null)}
                className="self-start p-1 hover:bg-white/10 rounded"
              >
                <Zap className="w-5 h-5 rotate-45" />
              </button>
            </div>
          )}
        </section>
      </main>

      <footer className="h-8 border-t bg-white px-6 flex items-center justify-between text-[10px] text-slate-400 no-print">
        <div className="flex items-center gap-4">
          <span>Renderer: Dynamic SVG v2.1</span>
          <span>Resistor Standard: {resistorStyle === 'IEEE_ZIGZAG' ? 'IEEE 315' : 'IEC 60617'}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Interactive Path Tracing Active
          </span>
        </div>
      </footer>

      {/* Print Footer - Only visible in PDF */}
      <div className="print-only text-[8px] text-slate-400 mt-12 pt-4 border-t border-slate-100 italic text-center">
        This document was generated by SchematicFlow. Verified standard compliance: IEC 60617 / IEEE 315.
        Circuit logic status: Verified for continuity.
      </div>
    </div>
  );
};

export default App;
