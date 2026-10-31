import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';

export default function KanbanColumn({
  column,
  tasks,
  onAddTaskToColumn,
  onEditTask,
  onDeleteTask,
  onMoveColumn,
  onDragStart,
  onDragEnd,
  onDropTask,
}) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = (e) => {
    // Only turn off if leaving column container
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onDropTask(taskId, column.id);
    }
  };

  const getStatusIcon = (id) => {
    switch (id) {
      case 'todo':
        return (
          <span className="w-2.5 h-2.5 rounded-full border border-neutral-400 dark:border-neutral-500 inline-block" />
        );
      case 'in-progress':
        return (
          <span className="w-2.5 h-2.5 rounded-full border border-neutral-800 dark:border-neutral-200 bg-neutral-800/40 dark:bg-neutral-200/40 inline-block" />
        );
      case 'completed':
        return (
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 dark:bg-neutral-100 inline-block" />
        );
      default:
        return null;
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col flex-1 min-w-[300px] max-w-full rounded-xl bg-neutral-100/70 dark:bg-neutral-900/40 border transition-all duration-150 p-3.5 ${
        isOver
          ? 'border-neutral-900 dark:border-neutral-200 bg-neutral-200/60 dark:bg-neutral-800/60 ring-2 ring-neutral-900/10 dark:ring-white/10'
          : 'border-neutral-200/80 dark:border-neutral-800'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200/70 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          {getStatusIcon(column.id)}
          <h3 className="text-xs uppercase tracking-wider font-bold text-neutral-800 dark:text-neutral-200">
            {column.title}
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddTaskToColumn(column.id)}
          title={`Add task to ${column.title}`}
          className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-colors"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Task Cards Area */}
      <div className="flex-1 flex flex-col gap-2.5 min-h-[380px] overflow-y-auto pr-0.5">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onMoveColumn={onMoveColumn}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}

        {tasks.length === 0 && (
          <div
            className={`flex-1 flex flex-col items-center justify-center p-6 border border-dashed rounded-lg text-center transition-colors ${
              isOver
                ? 'border-neutral-900 dark:border-white bg-white/40 dark:bg-neutral-800/40 text-neutral-900 dark:text-white'
                : 'border-neutral-300 dark:border-neutral-800/80 text-neutral-400 dark:text-neutral-600'
            }`}
          >
            <p className="text-xs font-mono">
              {isOver ? 'Drop here to move' : 'No tasks in this column'}
            </p>
            <button
              type="button"
              onClick={() => onAddTaskToColumn(column.id)}
              className="mt-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:underline"
            >
              + Create one
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
