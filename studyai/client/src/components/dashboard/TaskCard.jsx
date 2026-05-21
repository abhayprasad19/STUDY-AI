// src/components/dashboard/TaskCard.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { MdEdit, MdDelete, MdCheckCircle, MdRadioButtonUnchecked, MdSchedule } from "react-icons/md";
import { PRIORITY_COLORS, CATEGORY_ICONS } from "../../utils/constants";
import { formatDate, timeAgo } from "../../utils/formatDate";
import { clsx } from "../../utils/helperFunctions";

const TaskCard = ({ task, onToggle, onEdit, onDelete }) => {
  const [deleting, setDeleting] = useState(false);
  const isCompleted = task.status === "completed";

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(task._id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={clsx(
        "glass-card p-4 group hover:border-white/15 transition-all duration-200",
        isCompleted && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task)}
          className="mt-0.5 flex-shrink-0 text-slate-500 hover:text-brand-400 transition-colors"
        >
          {isCompleted ? (
            <MdCheckCircle size={20} className="text-emerald-400" />
          ) : (
            <MdRadioButtonUnchecked size={20} />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={clsx(
              "text-sm font-medium leading-5",
              isCompleted ? "line-through text-slate-500" : "text-slate-200"
            )}>
              {task.title}
            </p>
            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={() => onEdit(task)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <MdEdit size={14} />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-1 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
              >
                <MdDelete size={14} />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={clsx(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              PRIORITY_COLORS[task.priority]
            )}>
              {task.priority}
            </span>
            <span className="text-xs text-slate-600">
              {CATEGORY_ICONS[task.category]} {task.category}
            </span>
            {task.dueDate && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <MdSchedule size={11} />
                {formatDate(task.dueDate)}
              </span>
            )}
            <span className="text-xs text-slate-600 ml-auto">{timeAgo(task.createdAt)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
