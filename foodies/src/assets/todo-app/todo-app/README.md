# ✓ My Tasks — Todo App

A production-quality, feature-rich To-Do List built with React + Vite.

## ✨ Features

- **Add, Edit, Delete, Complete** tasks
- **Drag & drop** to reorder tasks (powered by @dnd-kit)
- **Priority labels** — High 🔴, Medium 🟡, Low 🟢
- **Due dates** with overdue detection
- **Filters** — All / Pending / Completed
- **Progress bar** showing completion percentage
- **Dark / Light mode** toggle (respects system preference)
- **localStorage persistence** — survives page refresh
- **Responsive** — works on mobile & desktop
- Double-click any task to edit it inline

## 📁 Project Structure

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Root component — theme, filter state
├── index.css             # Design system, CSS variables, all styles
├── hooks/
│   └── useTodos.js       # Custom hook — todo state + localStorage
└── components/
    ├── AddTask.jsx        # Input form with priority & due date
    ├── TodoList.jsx       # DnD sortable list wrapper
    ├── TodoItem.jsx       # Individual task item
    └── FilterBar.jsx      # Filter tabs + progress bar
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 8+

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

### Production Build

```bash
npm run build
npm run preview   # preview the production build locally
```

## 🛠 Tech Stack

| Tool | Purpose |
|------|---------|
| React 19 | UI framework |
| Vite | Build tool / dev server |
| @dnd-kit | Drag & drop |
| Google Fonts | Playfair Display + DM Sans |
| localStorage | Persistence |

## 🎨 Design

- **Aesthetic**: Warm editorial — amber accents on neutral backgrounds
- **Fonts**: Playfair Display (headings) + DM Sans (body)
- **Theme**: Full dark/light mode via CSS custom properties
- **Animations**: Smooth slide-in for new tasks, hover transitions

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Submit new task / Save edit |
| `Escape` | Cancel edit |
| `Space` | Toggle checkbox (when focused) |
| `Double-click` task | Enter edit mode |
