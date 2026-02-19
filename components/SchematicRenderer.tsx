
import React, { useState, useRef, useMemo } from 'react';
import { SchematicData, CircuitComponent, Position, Connection, ResistorStyle } from '../types';
import { renderComponentSymbol } from './Symbols';
import { Trash2, Edit2, X, Check } from 'lucide-react';

interface Props {
  data: SchematicData;
  onSelectComponent: (comp: CircuitComponent | null) => void;
  selectedComponent: CircuitComponent | null;
  onUpdateComponent: (comp: CircuitComponent) => void;
  onUpdatePosition: (id: string, pos: Position) => void;
  onDeleteConnection: (id: string) => void;
  onAddConnection: (fromId: string, toId: string) => void;
  onUpdateConnection: (connId: string, newFrom?: string, newTo?: string) => void;
  resistorStyle: ResistorStyle;
}

const SchematicRenderer: React.FC<Props> = ({ 
  data, 
  onSelectComponent, 
  selectedComponent,
  onUpdateComponent,
  onUpdatePosition,
  onDeleteConnection,
  onAddConnection,
  onUpdateConnection,
  resistorStyle
}) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [connectionDrag, setConnectionDrag] = useState<{fromId: string, currentPos: Position} | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ label: '', value: '', description: '' });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Path Tracing: Find all components connected to the selected one
  const highlightedComponentIds = useMemo(() => {
    if (!selectedComponent) return new Set<string>();
    
    const visited = new Set<string>();
    const queue = [selectedComponent.id];
    visited.add(selectedComponent.id);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      data.connections.forEach(conn => {
        if (conn.fromId === currentId && !visited.has(conn.toId)) {
          visited.add(conn.toId);
          queue.push(conn.toId);
        } else if (conn.toId === currentId && !visited.has(conn.fromId)) {
          visited.add(conn.fromId);
          queue.push(conn.fromId);
        }
      });
    }
    return visited;
  }, [selectedComponent, data.connections]);

  const handleComponentMouseDown = (e: React.MouseEvent, id: string) => {
    if (editingId) return;
    e.stopPropagation();
    const comp = data.components.find(c => c.id === id);
    if (!comp) return;

    const rect = (e.currentTarget as SVGGElement).getBoundingClientRect();
    setDraggingId(id);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    onSelectComponent(comp);
  };

  const handlePortMouseDown = (e: React.MouseEvent, fromId: string) => {
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setConnectionDrag({
      fromId,
      currentPos: { x: e.clientX - rect.left, y: e.clientY - rect.top }
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggingId) {
      onUpdatePosition(draggingId, { x: x - dragOffset.x, y: y - dragOffset.y });
    } else if (connectionDrag) {
      setConnectionDrag(prev => prev ? { ...prev, currentPos: { x, y } } : null);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (connectionDrag) {
      // Check if dropped on another component
      const target = (e.target as SVGElement).closest('.component-group');
      if (target) {
        const toId = target.getAttribute('data-id');
        if (toId && toId !== connectionDrag.fromId) {
          onAddConnection(connectionDrag.fromId, toId);
        }
      }
      setConnectionDrag(null);
    }
    setDraggingId(null);
  };

  const startEditing = (comp: CircuitComponent) => {
    setEditingId(comp.id);
    setEditForm({
      label: comp.label,
      value: comp.value || '',
      description: comp.description
    });
  };

  const saveEdit = () => {
    if (!editingId) return;
    const comp = data.components.find(c => c.id === editingId);
    if (comp) {
      onUpdateComponent({
        ...comp,
        label: editForm.label,
        value: editForm.value,
        description: editForm.description
      });
    }
    setEditingId(null);
  };

  const getCompCenter = (id: string) => {
    const comp = data.components.find(c => c.id === id);
    if (!comp || !comp.position) return { x: 0, y: 0 };
    return { x: comp.position.x + 37, y: comp.position.y + 30 };
  };

  const getRightPort = (id: string) => {
    const comp = data.components.find(c => c.id === id);
    if (!comp || !comp.position) return { x: 0, y: 0 };
    return { x: comp.position.x + 75, y: comp.position.y + 30 };
  };

  const getLeftPort = (id: string) => {
    const comp = data.components.find(c => c.id === id);
    if (!comp || !comp.position) return { x: 0, y: 0 };
    return { x: comp.position.x, y: comp.position.y + 30 };
  };

  if (!data.components || data.components.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
        Enter a circuit description to generate schematic
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="overflow-hidden bg-white rounded-xl shadow-inner border border-slate-200 relative h-[600px] cursor-default"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg width="3000" height="2000" className="absolute top-0 left-0">
        <defs>
          <filter id="pathGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Connections */}
        {data.connections.map((conn) => {
          const from = getRightPort(conn.fromId);
          const to = getLeftPort(conn.toId);
          const isHighlighted = highlightedComponentIds.has(conn.fromId) && highlightedComponentIds.has(conn.toId);
          
          return (
            <g key={conn.id} className="group">
              <path
                d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
                stroke={isHighlighted ? "#3b82f6" : "#cbd5e1"}
                strokeWidth={isHighlighted ? "4" : "2"}
                fill="none"
                filter={isHighlighted ? "url(#pathGlow)" : ""}
                className="transition-all duration-200"
              />
              {/* Invisible path for deletion */}
              <path
                d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
                stroke="transparent"
                strokeWidth="10"
                fill="none"
                className="cursor-pointer"
                onClick={() => onDeleteConnection(conn.id)}
              />
              <g 
                transform={`translate(${(from.x + to.x) / 2 - 10}, ${(from.y + to.y) / 2 - 10})`}
                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => onDeleteConnection(conn.id)}
              >
                <circle r="10" cx="10" cy="10" className="fill-red-500" />
                <Trash2 x="5" y="5" width="10" height="10" className="text-white" />
              </g>
            </g>
          );
        })}

        {/* Temporary Connection Line */}
        {connectionDrag && (
          <line
            x1={getRightPort(connectionDrag.fromId).x}
            y1={getRightPort(connectionDrag.fromId).y}
            x2={connectionDrag.currentPos.x}
            y2={connectionDrag.currentPos.y}
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        )}

        {/* Components */}
        {data.components.map((comp) => {
          const pos = comp.position || { x: 0, y: 0 };
          const isSelected = selectedComponent?.id === comp.id;
          const isHighlighted = highlightedComponentIds.has(comp.id);
          const isEditing = editingId === comp.id;
          
          return (
            <g 
              key={comp.id} 
              data-id={comp.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              className={`component-group cursor-move group select-none ${isSelected ? 'z-10' : ''}`}
              onMouseDown={(e) => handleComponentMouseDown(e, comp.id)}
              onDoubleClick={(e) => { e.stopPropagation(); startEditing(comp); }}
            >
              <rect 
                x="-5" y="-5" width="85" height="85" 
                className={`transition-all duration-200 rounded ${
                  isHighlighted ? 'fill-blue-50/50 stroke-blue-200 stroke-1' : 'fill-transparent'
                } ${
                  isSelected ? 'stroke-blue-500 stroke-2 bg-white' : 'group-hover:fill-slate-50'
                }`}
                rx="8"
              />
              
              <g className={isSelected || isHighlighted ? 'text-blue-600' : 'text-slate-700'}>
                {renderComponentSymbol(comp.subType, resistorStyle)}
              </g>

              {/* Ports */}
              <circle 
                cx="0" cy="30" r="4" 
                className="fill-slate-200 hover:fill-blue-500 transition-colors cursor-crosshair" 
              />
              <circle 
                cx="75" cy="30" r="4" 
                className="fill-slate-200 hover:fill-blue-500 transition-colors cursor-crosshair"
                onMouseDown={(e) => handlePortMouseDown(e, comp.id)}
              />

              <text x="37.5" y="80" textAnchor="middle" className={`text-[10px] font-bold ${isSelected ? 'fill-blue-600' : 'fill-slate-500'}`}>
                {comp.label}
              </text>
              <text x="37.5" y="-8" textAnchor="middle" className="text-[9px] font-bold fill-blue-500">
                {comp.value}
              </text>

              {/* Inline Editor */}
              {isEditing && (
                <foreignObject x="-60" y="-120" width="200" height="150" className="overflow-visible">
                  <div className="bg-white border border-slate-200 rounded-lg shadow-xl p-3 space-y-2 text-xs">
                    <input 
                      className="w-full border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500" 
                      value={editForm.label} 
                      placeholder="Label"
                      onChange={e => setEditForm({...editForm, label: e.target.value})}
                    />
                    <input 
                      className="w-full border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500" 
                      value={editForm.value} 
                      placeholder="Value (e.g. 10k)"
                      onChange={e => setEditForm({...editForm, value: e.target.value})}
                    />
                    <textarea 
                      className="w-full border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500 h-12" 
                      value={editForm.description}
                      placeholder="Description"
                      onChange={e => setEditForm({...editForm, description: e.target.value})}
                    />
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="bg-blue-600 text-white p-1 rounded flex-1 flex justify-center"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditingId(null)} className="bg-slate-200 text-slate-600 p-1 rounded flex-1 flex justify-center"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}
      </svg>
      
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-lg border border-slate-200 text-[9px] text-slate-500 space-y-1 shadow-sm">
        <p className="font-bold text-slate-700">Canvas Controls:</p>
        <p>• Drag components to reposition</p>
        <p>• Drag from right dot (○) to connect</p>
        <p>• Double-click component to edit details</p>
        <p>• Hover line + trash to delete link</p>
        <p>• Select node to trace current path</p>
      </div>
    </div>
  );
};

export default SchematicRenderer;
