// src/pages/dashboard/Tasks.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdAdd, MdFilterList, MdAutoAwesome } from "react-icons/md";
import { taskService } from "../../services/taskService";
import TaskCard from "../../components/dashboard/TaskCard";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { PageLoader } from "../../components/ui/Loader";
import { PRIORITY_COLORS } from "../../utils/constants";
import { clsx } from "../../utils/helperFunctions";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  title: "", description: "", priority: "medium",
  category: "study", dueDate: "", estimatedTime: 30,
};

const TaskForm = ({ initial = EMPTY_FORM, onSubmit, loading, onClose }) => {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const inputCls = "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500/60 transition-all";
  const selectCls = inputCls + " cursor-pointer";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Title *</label>
        <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Task title" required className={inputCls} />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Description</label>
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Optional description..." rows={3} className={inputCls + " resize-none"} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Priority</label>
          <select value={form.priority} onChange={(e) => set("priority", e.target.value)} className={selectCls}>
            {["low", "medium", "high", "urgent"].map((p) => <option key={p} value={p} className="bg-surface-800 capitalize">{p}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Category</label>
          <select value={form.category} onChange={(e) => set("category", e.target.value)} className={selectCls}>
            {["study", "assignment", "project", "revision", "other"].map((c) => <option key={c} value={c} className="bg-surface-800 capitalize">{c}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Due Date</label>
          <input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} className={inputCls + " [color-scheme:dark]"} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Est. Time (min)</label>
          <input type="number" min={5} max={480} value={form.estimatedTime} onChange={(e) => set("estimatedTime", parseInt(e.target.value))} className={inputCls} />
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={loading} fullWidth variant="gradient">Save Task</Button>
      </div>
    </form>
  );
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchTasks = useCallback(async () => {
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const { data } = await taskService.getTasks({ ...params, sort: "-createdAt", limit: 100 });
      setTasks(data?.tasks || []);
    } catch { toast.error("Failed to load tasks"); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      const { data } = await taskService.createTask(form);
      setTasks((p) => [data.task, ...p]);
      setModalOpen(false);
      toast.success("Task created!");
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      const { data } = await taskService.updateTask(editTask._id, form);
      setTasks((p) => p.map((t) => t._id === editTask._id ? data.task : t));
      setEditTask(null);
      toast.success("Task updated!");
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleToggle = async (task) => {
    const newStatus = task.status === "completed" ? "todo" : "completed";
    try {
      await taskService.updateTask(task._id, { status: newStatus });
      setTasks((p) => p.map((t) => t._id === task._id ? { ...t, status: newStatus } : t));
    } catch { toast.error("Failed to update task"); }
  };

  const handleDelete = async (id) => {
    try {
      await taskService.deleteTask(id);
      setTasks((p) => p.filter((t) => t._id !== id));
      toast.success("Task deleted");
    } catch { toast.error("Failed to delete task"); }
  };

  const tabs = ["all", "todo", "in-progress", "completed"];
  const counts = tabs.reduce((acc, s) => {
    acc[s] = s === "all" ? tasks.length : tasks.filter((t) => t.status === s).length;
    return acc;
  }, {});

  if (loading) return <PageLoader />;

  return (
    <div className="p-5 lg:p-7 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-white">Task Manager</h2>
          <p className="text-sm text-slate-500 mt-0.5">{counts.all} tasks · {counts.completed} completed</p>
        </div>
        <Button onClick={() => setModalOpen(true)} icon={<MdAdd size={18} />} variant="gradient">New Task</Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-white/3 rounded-xl border border-white/8 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={clsx(
              "px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize",
              filter === tab ? "bg-brand-600 text-white shadow" : "text-slate-500 hover:text-slate-300"
            )}
          >
            {tab} {counts[tab] > 0 && <span className="ml-1 opacity-70">({counts[tab]})</span>}
          </button>
        ))}
      </div>

      {/* Task list */}
      {tasks.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <MdAutoAwesome size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No tasks yet</p>
          <p className="text-slate-600 text-sm mt-1">Create your first task to get started</p>
          <Button onClick={() => setModalOpen(true)} variant="gradient" className="mt-4" icon={<MdAdd size={16} />}>
            Add Task
          </Button>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2.5">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onToggle={handleToggle}
                onEdit={(t) => setEditTask(t)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Create modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Task" size="md">
        <TaskForm onSubmit={handleCreate} loading={saving} onClose={() => setModalOpen(false)} />
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task" size="md">
        {editTask && (
          <TaskForm
            initial={{ ...editTask, dueDate: editTask.dueDate ? editTask.dueDate.split("T")[0] : "" }}
            onSubmit={handleEdit}
            loading={saving}
            onClose={() => setEditTask(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Tasks;
