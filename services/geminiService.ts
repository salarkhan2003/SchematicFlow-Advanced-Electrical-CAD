
import { GoogleGenAI, Type } from "@google/genai";
import { SchematicData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const circuitSchema = {
  type: Type.OBJECT,
  properties: {
    components: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { 
            type: Type.STRING, 
            enum: ['SOURCE', 'PROTECTION', 'CONTROL', 'LOAD', 'GROUND', 'CONNECTOR'] 
          },
          subType: { type: Type.STRING, description: 'Specific part like Battery, Fuse, Switch, LED, Resistor' },
          label: { type: Type.STRING },
          value: { type: Type.STRING, description: 'Electrical value like 12V, 330 ohm, 10A' },
          description: { type: Type.STRING, description: 'Short educational explanation of the component' }
        },
        required: ['id', 'type', 'subType', 'label', 'description']
      }
    },
    connections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          fromId: { type: Type.STRING },
          toId: { type: Type.STRING }
        },
        required: ['id', 'fromId', 'toId']
      }
    }
  },
  required: ['components', 'connections']
};

export const parseNaturalLanguageToCircuit = async (text: string): Promise<SchematicData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Parse this electrical circuit description into a structured JSON format. 
    Description: "${text}"
    
    IMPORTANT: 
    1. Support PARALLEL CONFIGURATIONS. If the user says "two LEDs in parallel", create two separate parallel paths from the previous node to the next.
    2. Ensure every connection has a unique 'id'.
    3. Ensure standard component classifications (SOURCE, PROTECTION, CONTROL, LOAD, GROUND).`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: circuitSchema,
      systemInstruction: "You are an expert electrical engineer. Convert natural language into a directed graph schematic. Explicitly identify series and parallel nodes. Assign unique IDs to everything."
    }
  });

  return JSON.parse(response.text || '{}') as SchematicData;
};
