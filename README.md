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

## 📁 File Structure (WIP)

## 📜 Writing Format (Episodes)
Episodes are written in structured JSON, describing:
- Narrative passages
- Branching choices
- Conditions and triggers
- Character dialogue
- Environmental interactions

![Screenshot 2025-04-16 184117](https://github.com/user-attachments/assets/d67d6e1a-a2ac-454b-bc72-0e918b950986)



![Screenshot 2025-04-16 184254](https://github.com/user-attachments/assets/d2e9264e-ad0f-4dba-a05f-df4a6c0b86d5)



![Screenshot 2025-04-16 184122](https://github.com/user-attachments/assets/44ccc7b9-8e53-47e6-ab5d-9f555b9691c1)



![Screenshot 2025-04-16 184234](https://github.com/user-attachments/assets/69e80bee-125d-4261-812e-f3c0c9ba1155)



![Screenshot 2025-04-16 184221](https://github.com/user-attachments/assets/f8815a88-3dfb-401e-b274-aabf5701ddba)



![Screenshot 2025-04-16 184210](https://github.com/user-attachments/assets/629d232c-07b0-4cab-acfb-d9ee6c192418)



![Screenshot 2025-04-16 184126](https://github.com/user-attachments/assets/62613647-c1b8-4077-983e-f6755b2fd08b)



![Screenshot 2025-04-16 133139](https://github.com/user-attachments/assets/9c42da28-acfd-4d80-97c0-beb36973d669)


*More documentation available soon via the Kaviron Docs site.*

## 🧪 Local Development

```bash
git clone https://github.com/WM-DarkLight/Kaviron.git
cd Kaviron
npm install
npm run dev
