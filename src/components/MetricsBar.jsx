import React from 'react';
import { CheckCircle2, Clock, ListTodo, BarChart3 } from 'lucide-react';

export default function MetricsBar({ tasks }) {
  const total = tasks.length;
  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  const metrics = [
    {
      label: 'Total Tasks',
      value: total,
      icon: BarChart3,
      iconStyle: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
    },
    {
      label: 'To Do',
      value: todoCount,
      icon: ListTodo,
      iconStyle: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
    },
    {
      label: 'In Progress',
      value: inProgressCount,
      icon: Clock,
      iconStyle: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
    },
    {
      label: 'Completed',
      value: completedCount,
      icon: CheckCircle2,
      iconStyle: 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100',
    },
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 shadow-xs mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 md:divide-x divide-neutral-100 dark:divide-neutral-800">
        {metrics.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`flex items-center gap-3.5 ${
                idx === 0 ? 'md:pr-6' : idx === metrics.length - 1 ? 'md:pl-6' : 'md:px-6'
              }`}
            >
              <div className={`p-2.5 rounded-lg ${item.iconStyle} shrink-0`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 truncate">
                  {item.label}
                </div>
                <div className="text-xl font-bold text-neutral-900 dark:text-white font-mono leading-none mt-1">
                  {item.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
