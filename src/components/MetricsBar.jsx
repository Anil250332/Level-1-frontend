import React from 'react';
import { CheckCircle2, Clock, ListTodo, AlertTriangle, BarChart3 } from 'lucide-react';

export default function MetricsBar({ tasks }) {
  const total = tasks.length;
  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueCount = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < today && t.status !== 'completed'
  ).length;

  const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 items-center">
        {/* Total */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
            <BarChart3 size={16} />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Total Tasks
            </div>
            <div className="text-lg font-bold text-neutral-900 dark:text-white font-mono">
              {total}
            </div>
          </div>
        </div>

        {/* To Do */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            <ListTodo size={16} />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              To Do
            </div>
            <div className="text-lg font-bold text-neutral-900 dark:text-white font-mono">
              {todoCount}
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
            <Clock size={16} />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              In Progress
            </div>
            <div className="text-lg font-bold text-neutral-900 dark:text-white font-mono">
              {inProgressCount}
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Completed
            </div>
            <div className="text-lg font-bold text-neutral-900 dark:text-white font-mono">
              {completedCount}
            </div>
          </div>
        </div>

        {/* Progress & Overdue */}
        <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-neutral-100 dark:border-neutral-800 sm:pl-4 pt-2 sm:pt-0">
          <div className="flex items-center justify-between text-[11px] font-mono mb-1">
            <span className="text-neutral-500 dark:text-neutral-400">Velocity</span>
            <span className="font-bold text-neutral-900 dark:text-white">{completionRate}%</span>
          </div>
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-neutral-900 dark:bg-white h-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          {overdueCount > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-red-500 font-mono mt-1.5">
              <AlertTriangle size={11} />
              <span>{overdueCount} overdue</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
