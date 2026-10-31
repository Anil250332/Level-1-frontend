# CodeRush Hackathon — Smart Kanban Task Board (Level 1 - Frontend)

A modern, high-contrast **Black & White** Kanban task board built for agile small teams to organize work, priorities, and deadlines. Designed with a clean, human-crafted aesthetic inspired by Linear and Vercel.

## 🚀 Key Features

- **Three Kanban Columns**: `To Do`, `In Progress`, and `Completed`.
- **Task Management (CRUD)**:
  - Create tasks with **Title**, **Description**, **Priority** (`Low`, `Medium`, `High`, `Urgent`), and **Due Date**.
  - Edit existing tasks via modal with keyboard shortcut support (`Ctrl+Enter` to save, `Esc` to close).
  - Delete tasks with instant feedback.
- **Move Tasks**:
  - Native **Drag & Drop** with visual drop-zone feedback.
  - Quick-move buttons (`prev` / `next`) for fast column transitions.
- **Persistence Across Refresh**:
  - Connects to the MERN backend API with MongoDB.
  - Automatic fallback to local storage cache if the server is offline, ensuring zero data loss.
- **Search & Filtering**:
  - Live instant search by title, description, or keyword.
  - Filter tasks by priority chips (`All`, `Urgent`, `High`, `Medium`, `Low`).
- **Sprint Overview Metrics**:
  - Live statistics bar displaying Total Tasks, To Do, In Progress, Completed, Velocity percentage, and Overdue alert counter.
- **Monochrome Dark & Light Mode**:
  - Crisp, high-contrast black & white theme with smooth toggle.

## 🛠️ Tech Stack

- **React 19**
- **Vite 8**
- **Tailwind CSS**
- **Lucide Icons**

## 💻 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```
