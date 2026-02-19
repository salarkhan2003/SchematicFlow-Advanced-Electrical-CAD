# ⚡ SchematicFlow

> **Natural Language to Electrical Engineering Engine**

SchematicFlow is an AI-architected workspace designed for automotive, electrical, and installation engineers. It transforms raw text descriptions into standardized, professional-grade wiring diagrams using Gemini-3 Flash intelligence and a high-performance interactive SVG canvas.

---

## 🚀 Core Features

### 🧠 Interpretive AI Layer
Converts complex "human-speak" into structured electrical graphs. 
- *Input:* "12V Battery to a 10A fuse, then a switch controlling two LEDs in parallel."
- *Output:* A fully mapped schematic with standardized symbols and logical connections.

### 📐 Interactive CAD Workspace
A high-fidelity SVG canvas built for professional engineering requirements.
- **Parallel Circuit Support:** Automatically identifies and renders branching logic.
- **Path Tracing:** Select any component to highlight all electrically connected neighbors.
- **Live Editing:** Double-click any component to refine labels, values, or specifications.
- **Manual Routing:** Drag-and-drop ports to create, reroute, or destroy connections.

### 🛡️ Rules of Continuity (Diagnostics)
The system performs real-time logic checks based on engineering standards:
- **Safety Flags:** Detects missing protection devices (fuses/breakers).
- **Loop Validation:** Warns if a circuit lacks a return path to ground.
- **Source Detection:** Ensures a valid $V_{source}$ is defined.

### 📋 Bill of Materials (BOM)
One-click export for Project Managers. Generates a clean CSV containing part names, categories, specifications, and educational descriptions.

---

## 🛠️ Tech Stack

- **Frontend:** React.js + Tailwind CSS (Engineer-focused UI)
- **Logic/AI:** @google/genai (Gemini-3-Flash-Preview)
- **Visuals:** Custom SVG Core (IEC 60617 & ANSI standards)
- **Icons:** Lucide-React
- **Export:** Native Browser Print (PDF) & Data URI (CSV)

---

## 📖 Component Library

SchematicFlow utilizes a dynamic symbol library supporting multiple regional standards:
- **Resistors:** Switchable between **IEEE ZigZag** (Standard 315) and **IEC Box** (Standard 60617).
- **LEDs/Loads:** High-resolution directional symbols with photon emission markers.
- **Protection:** Interactive Fuse/Breaker symbols with arc-path logic.
- **Sources:** Multipolar battery symbols with polarity markers.

---

## ⚡ Quick Start Prompt Examples

- `12V Battery to LED with 330 ohm resistor`
- `24V Source through a 5A breaker, branching to three parallel motors controlled by individual toggle switches`
- `Main bus 48V, protection fuse 50A, into a relay controlling a heavy load grounded to chassis`

---

## 📄 Licensing & Standards
- **Standardization:** Adheres to IEC 60617 & ANSI Y32.2.
- **Safety:** Always verify AI-generated schematics with a certified Professional Engineer (PE) before physical installation.

---
*Built for the next generation of Electrical Systems Architects.*
