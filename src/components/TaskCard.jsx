import React from 'react';
import { Calendar, AlertCircle, Clock, Trash2, Edit3, ArrowRight, ArrowLeft, Check } from 'lucide-react';

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onMoveColumn,
  onDragStart,
  onDragEnd,
}) {
  const isOverdue = () => {
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today && task.status !== 'completed';
  };

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday (Overdue)';
    if (diffDays < -1) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays <= 7) return `in ${diffDays} days`;

    return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-bold';
      case 'High':
        return 'bg-neutral-800 text-neutral-100 dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-700 font-semibold';
      case 'Normal':
      case 'Medium':
        return 'bg-neutral-200 text-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700';
      case 'Low':
      default:
        return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800';
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className="group relative bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200/90 dark:border-neutral-800 p-4 shadow-xs hover:shadow-md transition-all duration-150 cursor-grab active:cursor-grabbing hover:border-neutral-400 dark:hover:border-neutral-700"
    >
      {/* Priority Badge & Actions */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded ${getPriorityStyle(
            task.priority
          )}`}
        >
          {task.priority === 'Medium' ? 'Normal' : task.priority || 'Normal'}
        </span>

        {/* Action icons on hover */}
        <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(task)}
            title="Edit task"
            className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Edit3 size={13} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            title="Delete task"
            className="p-1 rounded text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight leading-snug mb-1.5">
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-3">
          {task.description}
        </p>
      )}

      {/* Footer Info: Due Date & Quick Move */}
      <div className="pt-1.5 flex items-center justify-between text-xs">
        {task.dueDate ? (
          <div
            className={`flex items-center gap-1.5 font-mono text-[11px] ${
              isOverdue()
                ? 'text-red-600 dark:text-red-400 font-semibold'
                : 'text-neutral-500 dark:text-neutral-400'
            }`}
          >
            {isOverdue() ? <AlertCircle size={12} /> : <Calendar size={12} />}
            <span>{formatDueDate(task.dueDate)}</span>
          </div>
        ) : (
          <span className="text-[11px] text-neutral-400 dark:text-neutral-600">No deadline</span>
        )}

        {/* Quick move / Status indicator */}
        <div className="flex items-center gap-1 text-[11px] font-mono">
          {task.status === 'completed' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
              <Check size={11} className="stroke-[2.5]" />
              Completed
            </span>
          ) : (
            <>
              {task.status === 'in-progress' && (
                <button
                  type="button"
                  onClick={() => onMoveColumn(task.id, 'todo')}
                  title="Move backward to To Do"
                  className="px-1.5 py-0.5 rounded text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <ArrowLeft size={11} className="inline mr-0.5" />
                  prev
                </button>
              )}
              <button
                type="button"
                onClick={() => onMoveColumn(task.id, task.status === 'todo' ? 'in-progress' : 'completed')}
                title={task.status === 'in-progress' ? 'Mark Completed' : 'Start Task'}
                className="px-1.5 py-0.5 rounded text-neutral-600 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium"
              >
                {task.status === 'in-progress' ? 'complete' : 'next'}
                <ArrowRight size={11} className="inline ml-0.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
