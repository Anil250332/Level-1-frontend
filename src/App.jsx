import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MetricsBar from './components/MetricsBar';
import KanbanColumn from './components/KanbanColumn';
import TaskModal from './components/TaskModal';
import { api } from './services/api';
import { Search, Plus, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'completed', title: 'Completed' },
];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageSource, setStorageSource] = useState('server');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('coderush_theme');
      if (saved) return saved === 'dark';
    } catch (e) {}
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [targetColumnForNewTask, setTargetColumnForNewTask] = useState('todo');

  // Dragging state
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // Sync dark mode class on html tag and persist to localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      try {
        localStorage.setItem('coderush_theme', 'dark');
      } catch (e) {}
    } else {
      root.classList.remove('dark');
      try {
        localStorage.setItem('coderush_theme', 'light');
      } catch (e) {}
    }
  }, [darkMode]);

  // Load tasks on mount
  const loadTasks = async () => {
    setLoading(true);
    try {
      const { tasks: fetched, source } = await api.fetchTasks();
      setTasks(fetched);
      setStorageSource(source);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      showToast('Could not sync with backend, loaded cached data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Drag and Drop handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  const handleDropTask = async (taskId, targetColumnId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === targetColumnId) return;

    // Optimistic UI update
    const previousStatus = task.status;
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: targetColumnId } : t
    );
    setTasks(updatedTasks);

    const colTitle = COLUMNS.find((c) => c.id === targetColumnId)?.title || targetColumnId;
    showToast(`Moved "${task.title}" to ${colTitle}`, 'info');

    try {
      await api.updateTaskStatus(taskId, targetColumnId);
    } catch (err) {
      // Revert if sync failed
      setTasks(tasks);
      showToast('Failed to update task position on server', 'error');
    }
  };

  // Quick move between columns (Next / Prev buttons)
  const handleMoveColumn = async (taskId, newStatus) => {
    await handleDropTask(taskId, newStatus);
  };

  // Create or Update task
  const handleSaveTask = async (taskData) => {
    if (taskData.id) {
      // Edit existing
      const previous = [...tasks];
      setTasks((prev) => prev.map((t) => (t.id === taskData.id ? { ...t, ...taskData } : t)));
      showToast('Task updated successfully', 'success');

      try {
        await api.updateTask(taskData.id, taskData);
      } catch (err) {
        setTasks(previous);
        showToast('Failed to save update', 'error');
      }
    } else {
      // Create new
      try {
        const created = await api.createTask(taskData);
        setTasks((prev) => [created, ...prev]);
        showToast('New task added to board', 'success');
      } catch (err) {
        showToast('Failed to create task', 'error');
      }
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const previous = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast(`Deleted "${task.title}"`, 'info');

    try {
      await api.deleteTask(taskId);
    } catch (err) {
      setTasks(previous);
      showToast('Failed to delete task', 'error');
    }
  };

  // Open modals
  const handleOpenCreateModal = (columnId = 'todo') => {
    setEditingTask(null);
    setTargetColumnForNewTask(columnId);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Filter tasks based on search and priority
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      !searchQuery.trim() ||
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === 'All' || task.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Clean Navbar */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        storageSource={storageSource}
      />

      {/* Main Board Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {/* Sprint Overview Metrics */}
        <MetricsBar tasks={tasks} />

        {/* Task Board Header & Integrated Action Toolbar (Moved right above tasks) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 mb-5 pb-4 border-b border-neutral-200/80 dark:border-neutral-800">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Sprint Board
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Drag cards between columns or use quick-move to re-prioritize.
            </p>
          </div>

          {/* Controls: Search, Priority Pills, Sync & + New Task */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Bar */}
            <div className="relative min-w-[200px] sm:min-w-[240px] flex-1 sm:flex-initial">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-9 pr-7 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Priority Filter Pills */}
            <div className="flex items-center gap-0.5 bg-white dark:bg-neutral-900 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-xs">
              {['All', 'Urgent', 'High', 'Medium', 'Low'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriorityFilter(p)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                    priorityFilter === p
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Sync Button */}
            <button
              type="button"
              onClick={loadTasks}
              title="Refresh tasks from server"
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* New Task Button */}
            <button
              type="button"
              onClick={() => handleOpenCreateModal('todo')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
            >
              <Plus size={14} />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* 3 Kanban Columns with Skeleton Loading */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={filteredTasks.filter((t) => t.status === column.id)}
              loading={loading}
              onAddTaskToColumn={handleOpenCreateModal}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onMoveColumn={handleMoveColumn}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDropTask={handleDropTask}
            />
          ))}
        </div>
      </main>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        editingTask={editingTask}
        initialStatus={targetColumnForNewTask}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-medium shadow-xl border border-neutral-800 dark:border-neutral-200 animate-in slide-in-from-bottom-2 duration-150">
          {toast.type === 'error' ? (
            <AlertCircle size={15} className="text-red-400 dark:text-red-600" />
          ) : (
            <CheckCircle2 size={15} className="text-emerald-400 dark:text-emerald-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
