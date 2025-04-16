# 🖖 Kaviron

**Kaviron** is a modular, LCARS-inspired text-based adventure game engine set in a Star Trek universe. Built with cutting-edge web technologies and a heavy emphasis on customization, extensibility, and immersive storytelling, Kaviron enables players and creators to script dynamic episodes, navigate galactic missions, and interact with complex systems — all from a sleek, Starfleet-style interface.

## 🚀 Features

### 🧠 Core Engine
- Modular command parser and processor
- Pluggable mission and system modules
- Real-time state management
- In-game terminal with LCARS UI
- Full player and ship system architecture

### 📦 Persistence & Data
- IndexedDB local storage for full offline support
- Save/load game states
- Episode import/export system (JSON-based)
- Dynamic registry system for characters, locations, and objects

### 🧭 Navigation & Missions
- Sector-based star map navigation
- Custom episode scripting with choices and consequences
- Mission objectives, tracking, and outcomes
- Red/Yellow/Blue alert systems

### 💡 Creator Tools
- In-browser episode editor (coming soon)
- JSON structure transformer (turn written stories into game format)
- Developer-first modular layout
- Live preview for custom logic/scripts

### 🛠️ Tech Stack
- **Framework**: Next.js + TypeScript
- **Styling**: Tailwind CSS + LCARS UI design
- **Storage**: IndexedDB
- **Future**: WebAssembly module support, audio command system

## 🧩 Planned Features
- Visual script editor (drag & drop choices + logic)
- AI-free assistant to help format episodes
- Map editor for custom star systems
- Procedural event generator
- Player logs, mission journals, and ranking system
- Optional multiplayer bridge mode

## 📁 File Structure (WIP)

## 📜 Writing Format (Episodes)
Episodes are written in structured JSON, describing:
- Narrative passages
- Branching choices
- Conditions and triggers
- Character dialogue
- Environmental interactions

*More documentation available soon via the Kaviron Docs site.*

## 🧪 Local Development

```bash
git clone https://github.com/WM-DarkLight/Kaviron.git
cd Kaviron
npm install
npm run dev
