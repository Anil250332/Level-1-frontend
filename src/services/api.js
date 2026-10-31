const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://level-2-backend.onrender.com';
const STORAGE_KEY = 'coderush_kanban_local_tasks_v1';

// Starter demo data used if backend is completely unavailable
const fallbackInitialTasks = [
  {
    id: 'demo-1',
    title: 'Research user feedback for V2 redesign',
    description: 'Analyze session recordings and user interview notes to identify UX friction points in task filtering.',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    status: 'todo',
    order: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    title: 'Implement drag-and-drop Kanban columns',
    description: 'Support native HTML5 Drag and Drop with visual drop-zone indicators and smooth card animations.',
    priority: 'Urgent',
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    status: 'in-progress',
    order: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    title: 'Design clean monochrome design system',
    description: 'Create high-contrast Black & White theme inspired by Linear and Vercel typography standards.',
    priority: 'High',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'completed',
    order: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    title: 'Build RESTful API with validation and MERN fallback',
    description: 'Provide endpoints for CRUD operations, status updates, and graceful in-memory file fallback.',
    priority: 'High',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'completed',
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-5',
    title: 'Add priority filtering and search bar',
    description: 'Allow instant live search by keyword and filtering by Low, Medium, High, and Urgent badges.',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    status: 'todo',
    order: 1,
    createdAt: new Date().toISOString(),
  },
];

function getLocalTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('LocalStorage read error:', e);
  }
  return fallbackInitialTasks;
}

function saveLocalTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
}

export const api = {
  async fetchTasks() {
    try {
      const res = await fetch(API_BASE, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        saveLocalTasks(json.data);
        return { tasks: json.data, source: json.storage || 'server' };
      }
    } catch (err) {
      console.warn('Backend unavailable, using cached local storage:', err.message);
    }
    return { tasks: getLocalTasks(), source: 'local_cache' };
  },

  async createTask(taskData) {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        const local = getLocalTasks();
        saveLocalTasks([json.data, ...local]);
        return json.data;
      }
    } catch (err) {
      console.warn('Backend post failed, saving locally:', err.message);
    }

    // Fallback local creation
    const newTask = {
      ...taskData,
      id: `local-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const local = getLocalTasks();
    saveLocalTasks([newTask, ...local]);
    return newTask;
  },

  async updateTask(id, updates) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const local = getLocalTasks().map((t) => (t.id === id ? json.data : t));
          saveLocalTasks(local);
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Backend update failed, updating locally:', err.message);
    }

    const local = getLocalTasks().map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
    saveLocalTasks(local);
    return local.find((t) => t.id === id);
  },

  async updateTaskStatus(id, status, order = 0) {
    try {
      const res = await fetch(`${API_BASE}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, order }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const local = getLocalTasks().map((t) => (t.id === id ? json.data : t));
          saveLocalTasks(local);
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Backend patch status failed, updating locally:', err.message);
    }

    const local = getLocalTasks().map((t) => (t.id === id ? { ...t, status, order } : t));
    saveLocalTasks(local);
    return local.find((t) => t.id === id);
  },

  async deleteTask(id) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const local = getLocalTasks().filter((t) => t.id !== id);
        saveLocalTasks(local);
        return true;
      }
    } catch (err) {
      console.warn('Backend delete failed, removing locally:', err.message);
    }

    const local = getLocalTasks().filter((t) => t.id !== id);
    saveLocalTasks(local);
    return true;
  },
};
