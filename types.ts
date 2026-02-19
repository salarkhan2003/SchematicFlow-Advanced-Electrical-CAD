
export enum ComponentType {
  SOURCE = 'SOURCE',
  PROTECTION = 'PROTECTION',
  CONTROL = 'CONTROL',
  LOAD = 'LOAD',
  GROUND = 'GROUND',
  CONNECTOR = 'CONNECTOR'
}

export type ResistorStyle = 'IEEE_ZIGZAG' | 'IEC_BOX';

export interface Position {
  x: number;
  y: number;
}

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  subType: string;
  label: string;
  value?: string;
  description: string;
  position?: Position;
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
}

export interface SchematicData {
  components: CircuitComponent[];
  connections: Connection[];
}

export interface DiagnosticResult {
  status: 'SAFE' | 'WARNING' | 'ERROR';
  message: string;
  code: string;
}

export interface BOMItem {
  partName: string;
  category: string;
  specification: string;
  quantity: number;
}
