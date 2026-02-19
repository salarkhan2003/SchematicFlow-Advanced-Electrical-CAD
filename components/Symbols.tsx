
import React from 'react';
import { ResistorStyle } from '../types';

export const BatterySymbol = () => (
  <g stroke="currentColor" strokeWidth="2" fill="none">
    <line x1="10" y1="20" x2="10" y2="40" />
    <line x1="20" y1="10" x2="20" y2="50" />
    <line x1="30" y1="20" x2="30" y2="40" />
    <line x1="40" y1="10" x2="40" y2="50" />
    <text x="45" y="20" fontSize="10" fill="currentColor">+</text>
  </g>
);

export const ResistorSymbol = ({ style = 'IEEE_ZIGZAG' }: { style?: ResistorStyle }) => {
  if (style === 'IEC_BOX') {
    return (
      <g stroke="currentColor" strokeWidth="2" fill="none">
        <line x1="0" y1="30" x2="15" y2="30" />
        <rect x="15" y="20" width="45" height="20" />
        <line x1="60" y1="30" x2="75" y2="30" />
      </g>
    );
  }
  return (
    <polyline
      points="0,30 10,30 15,15 25,45 35,15 45,45 55,15 65,30 75,30"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
  );
};

export const LEDSymbol = () => (
  <g stroke="currentColor" strokeWidth="2" fill="none">
    <line x1="0" y1="30" x2="15" y2="30" />
    <polygon points="15,15 45,30 15,45" fill="none" />
    <line x1="45" y1="15" x2="45" y2="45" />
    <line x1="60" y1="30" x2="75" y2="30" />
    <line x1="35" y1="10" x2="45" y2="0" strokeWidth="1" />
    <line x1="45" y1="10" x2="55" y2="0" strokeWidth="1" />
    <polyline points="40,0 45,0 45,5" strokeWidth="1" />
    <polyline points="50,0 55,0 55,5" strokeWidth="1" />
  </g>
);

export const SwitchSymbol = ({ isOpen = true }: { isOpen?: boolean }) => (
  <g stroke="currentColor" strokeWidth="2" fill="none">
    <line x1="0" y1="30" x2="20" y2="30" />
    <circle cx="20" cy="30" r="2" fill="currentColor" />
    <line x1="20" y1="30" x2="55" y2={isOpen ? "10" : "30"} />
    <circle cx="55" cy="30" r="2" fill="currentColor" />
    <line x1="55" y1="30" x2="75" y2="30" />
  </g>
);

export const FuseSymbol = () => (
  <g stroke="currentColor" strokeWidth="2" fill="none">
    <line x1="0" y1="30" x2="15" y2="30" />
    <rect x="15" y="20" width="45" height="20" />
    <path d="M15,30 Q30,10 37,30 T60,30" />
    <line x1="60" y1="30" x2="75" y2="30" />
  </g>
);

export const GroundSymbol = () => (
  <g stroke="currentColor" strokeWidth="2" fill="none">
    <line x1="20" y1="0" x2="20" y2="30" />
    <line x1="0" y1="30" x2="40" y2="30" />
    <line x1="10" y1="38" x2="30" y2="38" />
    <line x1="15" y1="46" x2="25" y2="46" />
  </g>
);

export const renderComponentSymbol = (subType: string, resistorStyle: ResistorStyle = 'IEEE_ZIGZAG') => {
  const type = subType.toLowerCase();
  if (type.includes('battery') || type.includes('source')) return <BatterySymbol />;
  if (type.includes('resistor')) return <ResistorSymbol style={resistorStyle} />;
  if (type.includes('led') || type.includes('light')) return <LEDSymbol />;
  if (type.includes('switch') || type.includes('relay')) return <SwitchSymbol />;
  if (type.includes('fuse') || type.includes('breaker')) return <FuseSymbol />;
  if (type.includes('ground')) return <GroundSymbol />;
  return <circle cx="37" cy="30" r="10" fill="gray" />;
};
