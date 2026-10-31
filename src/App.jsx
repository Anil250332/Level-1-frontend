import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MetricsBar from './components/MetricsBar';
import KanbanColumn from './components/KanbanColumn';
import TaskModal from './components/TaskModal';
import { api } from './services/api';
import { CheckCircle2, AlertCircle, Info, RefreshCw } from 'lucide-react';

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

  // Sync dark mode class on html tag
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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
      {/* Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenCreateModal={() => handleOpenCreateModal('todo')}
        storageSource={storageSource}
      />

      {/* Main Board Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {/* Sprint Overview Metrics */}
        <MetricsBar tasks={tasks} />

        {/* Board Header & Live status */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Sprint Board
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Drag cards to re-prioritize or move between sprint stages. Changes persist across refresh.
            </p>
          </div>

          <button
            type="button"
            onClick={loadTasks}
            title="Refresh tasks from server"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
        </div>

        {/* 3 Kanban Columns */}
        {loading && tasks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20 text-xs font-mono text-neutral-500">
            <RefreshCw size={16} className="animate-spin mr-2" />
            Loading Kanban board...
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={filteredTasks.filter((t) => t.status === column.id)}
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
        )}
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
