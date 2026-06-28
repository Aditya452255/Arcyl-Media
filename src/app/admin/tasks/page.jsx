"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Plus,
  X,
  Trash2,
  Paperclip,
  MessageSquare,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ListTodo,
  KanbanSquare,
  Clock,
  User,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function AdminTasksPage() {
  // Tabs & Views
  const [activeTab, setActiveTab] = useState("overview"); // overview, list, kanban
  const [tasks, setTasks] = useState([]);
  const [kanbanData, setKanbanData] = useState([]);
  const [myTasksData, setMyTasksData] = useState({ today: [], overdue: [], thisWeek: [], recentlyCompleted: [] });
  const [dashboardStats, setDashboardStats] = useState(null);

  // Catalogs
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [milestones, setMilestones] = useState([]);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [milestoneFilter, setMilestoneFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Selection
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form States
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formProject, setFormProject] = useState("");
  const [formMilestone, setFormMilestone] = useState("");
  const [formAssignee, setFormAssignee] = useState("");
  const [formPriority, setFormPriority] = useState("MEDIUM");
  const [formStatus, setFormStatus] = useState("TODO");
  const [formDueDate, setFormDueDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch projects & employees on mount
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [projRes, empRes] = await Promise.all([
          fetch("/api/admin/projects?limit=100"),
          fetch("/api/admin/employees?limit=100"),
        ]);
        if (projRes.ok) {
          const payload = await projRes.json();
          setProjects(payload.data || []);
        }
        if (empRes.ok) {
          const payload = await empRes.json();
          setEmployees(payload.data || []);
        }
      } catch (err) {
        console.error("Failed to load catalog data", err);
      }
    };
    fetchCatalogs();
  }, []);

  // Fetch milestones when project changes in Create/Edit Form
  useEffect(() => {
    if (!formProject) {
      setMilestones([]);
      return;
    }
    const fetchMilestones = async () => {
      try {
        const res = await fetch(`/api/admin/projects/${formProject}/milestones`);
        if (res.ok) {
          const payload = await res.json();
          setMilestones(payload.data || []);
        }
      } catch (err) {
        console.error("Failed to load milestones", err);
      }
    };
    fetchMilestones();
  }, [formProject]);

  // Fetch task lists & statistics
  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const [myRes, dashRes] = await Promise.all([
        fetch("/api/admin/tasks/my"),
        fetch("/api/admin/tasks/dashboard"),
      ]);
      if (myRes.ok) {
        const payload = await myRes.json();
        setMyTasksData(payload.data || { today: [], overdue: [], thisWeek: [], recentlyCompleted: [] });
      }
      if (dashRes.ok) {
        const payload = await dashRes.json();
        setDashboardStats(payload.data || null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTasksList = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (search) query.append("search", search);
      if (statusFilter) query.append("status", statusFilter);
      if (priorityFilter) query.append("priority", priorityFilter);
      if (assigneeFilter) query.append("assigneeId", assigneeFilter);
      if (projectFilter) query.append("projectId", projectFilter);
      if (milestoneFilter) query.append("milestoneId", milestoneFilter);

      const res = await fetch(`/api/admin/tasks?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to load tasks");
      const payload = await res.json();
      setTasks(payload.data || []);
      setPagination(payload.pagination || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, priorityFilter, assigneeFilter, projectFilter, milestoneFilter]);

  const fetchKanban = useCallback(async () => {
    if (!projectFilter) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tasks/board?projectId=${projectFilter}`);
      if (!res.ok) throw new Error("Failed to load Kanban board");
      const payload = await res.json();
      setKanbanData(payload.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectFilter]);

  // Load appropriate data based on active tab
  useEffect(() => {
    if (activeTab === "overview") {
      fetchOverview();
    } else if (activeTab === "list") {
      fetchTasksList();
    } else if (activeTab === "kanban") {
      fetchKanban();
    }
  }, [activeTab, fetchOverview, fetchTasksList, fetchKanban]);

  // Fetch comments & attachments when task drawer opens
  const fetchTaskDetails = async (task) => {
    setSelectedTask(task);
    try {
      const [commRes, attRes] = await Promise.all([
        fetch(`/api/admin/tasks/${task.id}/comments`),
        fetch(`/api/admin/tasks/${task.id}/attachments`),
      ]);
      if (commRes.ok) {
        const payload = await commRes.json();
        setComments(payload.data || []);
      }
      if (attRes.ok) {
        const payload = await attRes.json();
        setAttachments(payload.data || []);
      }
    } catch (err) {
      console.error("Failed to load task details", err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formProject) return;

    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription || null,
          projectId: formProject,
          milestoneId: formMilestone || null,
          assigneeId: formAssignee || null,
          priority: formPriority,
          status: formStatus,
          dueDate: formDueDate || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to create task");

      resetForm();
      setIsCreateModalOpen(false);
      refreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateTaskStatus = async (task, newStatus) => {
    try {
      const res = await fetch(`/api/admin/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update task status");
      
      const payload = await res.json();
      
      // Update local states
      if (selectedTask?.id === task.id) {
        setSelectedTask(payload.data);
      }
      refreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formProject || !editingTask) return;

    try {
      const res = await fetch(`/api/admin/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription || null,
          projectId: formProject,
          milestoneId: formMilestone || null,
          assigneeId: formAssignee || null,
          priority: formPriority,
          status: formStatus,
          dueDate: formDueDate || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to update task");

      resetForm();
      setEditingTask(null);
      refreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");

      setSelectedTask(null);
      refreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Comments Actions
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTask) return;

    try {
      const res = await fetch(`/api/admin/tasks/${selectedTask.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newComment }),
      });
      if (!res.ok) throw new Error("Failed to add comment");

      const payload = await res.json();
      setComments((prev) => [payload.data, ...prev]);
      setNewComment("");
    } catch (err) {
      alert(err.message);
    }
  };

  // Attachments Actions
  const handleUploadAttachment = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTask) return;

    setUploadingAttachment(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/admin/tasks/${selectedTask.id}/attachments`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errPayload = await res.json().catch(() => ({}));
        throw new Error(errPayload.message || "Failed to upload attachment");
      }

      const payload = await res.json();
      setAttachments((prev) => [...prev, payload.data]);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!confirm("Remove this attachment?")) return;
    try {
      const res = await fetch(`/api/admin/tasks/${selectedTask.id}/attachments/${attachmentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete attachment");
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch (err) {
      alert(err.message);
    }
  };

  // Helper actions
  const openEditModal = (task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || "");
    setFormProject(task.projectId);
    setFormMilestone(task.milestoneId || "");
    setFormAssignee(task.assigneeId || "");
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
  };

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormProject("");
    setFormMilestone("");
    setFormAssignee("");
    setFormPriority("MEDIUM");
    setFormStatus("TODO");
    setFormDueDate("");
  };

  const refreshData = () => {
    if (activeTab === "overview") fetchOverview();
    if (activeTab === "list") fetchTasksList();
    if (activeTab === "kanban") fetchKanban();
  };

  return (
    <div className="flex flex-col gap-8 min-h-screen text-slate-100">
      {/* Title & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks Operations</h1>
          <p className="text-sm text-slate-400 mt-1">Lightweight workflow logs and project task allocation</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-md shadow-violet-900/20"
          >
            <Plus size={16} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 flex gap-6">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 text-sm font-medium border-b-2 transition ${
            activeTab === "overview" ? "border-violet-500 text-violet-400" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          My Overview
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={`pb-3 text-sm font-medium border-b-2 transition ${
            activeTab === "list" ? "border-violet-500 text-violet-400" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          All Tasks List
        </button>
        <button
          onClick={() => {
            setActiveTab("kanban");
            if (!projectFilter && projects.length > 0) {
              setProjectFilter(projects[0].id);
            }
          }}
          className={`pb-3 text-sm font-medium border-b-2 transition ${
            activeTab === "kanban" ? "border-violet-500 text-violet-400" : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Kanban Columns
        </button>
      </div>

      {/* ────────────────── 1. MY OVERVIEW TAB ────────────────── */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-8">
          {/* Stats Widgets grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">My Pending Tasks</span>
                <h3 className="text-2xl font-bold mt-1">{dashboardStats?.myTasksCount ?? 0}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-violet-600/10 flex items-center justify-center text-violet-400">
                <ListTodo size={20} />
              </div>
            </div>

            <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Due Today</span>
                <h3 className="text-2xl font-bold mt-1 text-sky-400">{dashboardStats?.dueTodayCount ?? 0}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-sky-600/10 flex items-center justify-center text-sky-400">
                <Clock size={20} />
              </div>
            </div>

            <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Overdue Tasks</span>
                <h3 className="text-2xl font-bold mt-1 text-red-400">{dashboardStats?.overdueCount ?? 0}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-600/10 flex items-center justify-center text-red-400">
                <AlertCircle size={20} />
              </div>
            </div>

            <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Completed This Week</span>
                <h3 className="text-2xl font-bold mt-1 text-emerald-400">{dashboardStats?.completedThisWeekCount ?? 0}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-600/10 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={20} />
              </div>
            </div>
          </div>

          {/* Today, Overdue, Week Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Overdue Section */}
            <div className="p-6 bg-slate-900/20 border border-slate-850 rounded-xl flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <AlertCircle size={18} className="text-red-400" />
                <h3 className="font-semibold text-red-400">Overdue Tasks</h3>
              </div>
              {myTasksData.overdue.length === 0 ? (
                <p className="text-slate-500 text-xs py-4 text-center">No overdue tasks. Clean ledger!</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {myTasksData.overdue.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => fetchTaskDetails(task)}
                      className="p-3 bg-slate-900/60 hover:bg-slate-800/40 border border-slate-800 hover:border-red-900/20 rounded-lg cursor-pointer transition flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-sm font-medium text-slate-200">{task.title}</h4>
                        <span className="text-[10px] text-slate-400 mt-1 block">Project: {task.project?.name}</span>
                      </div>
                      <span className="text-[10px] text-red-400 bg-red-950/40 border border-red-900/20 px-2 py-0.5 rounded-full font-mono">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Date"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Today Tasks Section */}
            <div className="p-6 bg-slate-900/20 border border-slate-850 rounded-xl flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Clock size={18} className="text-sky-450" />
                <h3 className="font-semibold text-slate-200">Due Today</h3>
              </div>
              {myTasksData.today.length === 0 ? (
                <p className="text-slate-500 text-xs py-4 text-center">Nothing due today.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {myTasksData.today.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => fetchTaskDetails(task)}
                      className="p-3 bg-slate-900/60 hover:bg-slate-800/40 border border-slate-800 rounded-lg cursor-pointer transition flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-sm font-medium text-slate-200">{task.title}</h4>
                        <span className="text-[10px] text-slate-400 mt-1 block">Project: {task.project?.name}</span>
                      </div>
                      <span className="text-[10px] text-sky-400 bg-sky-950/40 border border-sky-900/20 px-2 py-0.5 rounded-full font-mono">
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Due this week Section */}
            <div className="p-6 bg-slate-900/20 border border-slate-850 rounded-xl flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Calendar size={18} className="text-violet-405" />
                <h3 className="font-semibold text-slate-200">Due This Week</h3>
              </div>
              {myTasksData.thisWeek.length === 0 ? (
                <p className="text-slate-500 text-xs py-4 text-center">No other tasks due this week.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {myTasksData.thisWeek.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => fetchTaskDetails(task)}
                      className="p-3 bg-slate-900/60 hover:bg-slate-800/40 border border-slate-800 rounded-lg cursor-pointer transition flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-sm font-medium text-slate-200">{task.title}</h4>
                        <span className="text-[10px] text-slate-400 mt-1 block">Project: {task.project?.name}</span>
                      </div>
                      <span className="text-[10px] text-violet-400 bg-violet-950/40 border border-violet-900/20 px-2 py-0.5 rounded-full font-mono">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Date"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recently Completed Section */}
            <div className="p-6 bg-slate-900/20 border border-slate-850 rounded-xl flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <CheckCircle2 size={18} className="text-emerald-450" />
                <h3 className="font-semibold text-slate-200">Recently Completed (Last 7 Days)</h3>
              </div>
              {myTasksData.recentlyCompleted.length === 0 ? (
                <p className="text-slate-500 text-xs py-4 text-center">No tasks completed recently.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {myTasksData.recentlyCompleted.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => fetchTaskDetails(task)}
                      className="p-3 bg-slate-900/60 hover:bg-slate-800/40 border border-slate-800 rounded-lg cursor-pointer transition flex items-center justify-between opacity-80"
                    >
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 line-through">{task.title}</h4>
                        <span className="text-[10px] text-slate-500 mt-1 block">Project: {task.project?.name}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-900/20 px-2 py-0.5 rounded-full font-mono">
                        {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : "Done"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── 2. ALL TASKS LIST TAB ────────────────── */}
      {activeTab === "list" && (
        <div className="flex flex-col gap-6">
          {/* Filters Area */}
          <div className="p-5 bg-slate-900/20 border border-slate-850 rounded-xl grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
              />
            </div>

            <select
              value={projectFilter}
              onChange={(e) => { setProjectFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-violet-500 transition"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <select
              value={assigneeFilter}
              onChange={(e) => { setAssigneeFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-violet-500 transition"
            >
              <option value="">All Assignees</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-violet-500 transition"
            >
              <option value="">All Statuses</option>
              <option value="TODO">TODO</option>
              <option value="DOING">DOING</option>
              <option value="REVIEW">REVIEW</option>
              <option value="DONE">DONE</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-violet-500 transition"
            >
              <option value="">All Priorities</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </div>

          {/* List Table */}
          <div className="bg-slate-900/10 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Task Title</th>
                  <th className="py-4 px-6">Project</th>
                  <th className="py-4 px-6">Assignee</th>
                  <th className="py-4 px-6">Priority</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-sm text-slate-300">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                      No tasks found matching current filters.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => fetchTaskDetails(task)}
                      className="hover:bg-slate-900/30 cursor-pointer transition group"
                    >
                      <td className="py-4 px-6 font-medium text-slate-200 group-hover:text-violet-400 transition">
                        {task.title}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-450">{task.project?.name || "N/A"}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300 font-bold uppercase">
                            {task.assignee?.name ? task.assignee.name[0] : <User size={10} />}
                          </div>
                          <span>{task.assignee?.name || "Unassigned"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          task.priority === "URGENT" ? "text-red-400 bg-red-950/40 border-red-900/25" :
                          task.priority === "HIGH" ? "text-amber-400 bg-amber-950/40 border-amber-900/25" :
                          task.priority === "MEDIUM" ? "text-sky-400 bg-sky-950/40 border-sky-900/25" :
                          "text-slate-400 bg-slate-950/40 border-slate-900/25"
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs font-mono">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Date"}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border ${
                          task.status === "DONE" ? "text-emerald-400 bg-emerald-950/30 border-emerald-900/30" :
                          task.status === "REVIEW" ? "text-amber-400 bg-amber-950/30 border-amber-900/30" :
                          task.status === "DOING" ? "text-sky-450 bg-sky-950/30 border-sky-900/30" :
                          "text-slate-400 bg-slate-950/30 border-slate-900/30"
                        }`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="p-4 bg-slate-900/20 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Page {pagination.page} of {pagination.pages} ({pagination.total} tasks)</span>
                <div className="flex gap-2">
                  <button
                    disabled={!pagination.hasPrevious}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-1.5 bg-slate-950/60 border border-slate-800 rounded hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-slate-950/60 transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={!pagination.hasNext}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 bg-slate-950/60 border border-slate-800 rounded hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-slate-950/60 transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────── 3. KANBAN BOARD TAB ────────────────── */}
      {activeTab === "kanban" && (
        <div className="flex flex-col gap-6">
          {/* Project Switcher for Board columns */}
          <div className="p-4 bg-slate-900/20 border border-slate-850 rounded-xl flex items-center gap-4">
            <span className="text-xs text-slate-400 uppercase font-semibold">Active Project:</span>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {!projectFilter ? (
            <div className="p-12 text-center text-slate-500 text-sm bg-slate-900/10 border border-slate-800 rounded-xl">
              Please select a project to load columns board
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              {kanbanData.map((column) => (
                <div key={column.status} className="p-4 bg-slate-900/35 border border-slate-850 rounded-xl flex flex-col gap-4 min-h-[500px]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">{column.status}</span>
                    <span className="text-xs bg-slate-950 px-2 py-0.5 rounded text-slate-500 font-mono">{column.tasks.length}</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {column.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => fetchTaskDetails(task)}
                        className="p-4 bg-slate-950/80 hover:bg-slate-900/50 border border-slate-800 hover:border-violet-600/35 rounded-lg cursor-pointer transition flex flex-col gap-3"
                      >
                        <h4 className="text-sm font-medium text-slate-200">{task.title}</h4>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className={`px-2 py-0.5 rounded border ${
                            task.priority === "URGENT" ? "text-red-400 bg-red-950/40 border-red-900/25" :
                            task.priority === "HIGH" ? "text-amber-400 bg-amber-950/40 border-amber-900/25" :
                            task.priority === "MEDIUM" ? "text-sky-400 bg-sky-950/40 border-sky-900/25" :
                            "text-slate-400 bg-slate-950/40 border-slate-900/25"
                          }`}>{task.priority}</span>

                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[9px] uppercase">
                              {task.assignee?.name ? task.assignee.name[0] : <User size={8} />}
                            </div>
                            <span className="truncate max-w-[80px]">{task.assignee?.name || "Unassigned"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ────────────────── CREATE TASK MODAL ────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="h-14 flex items-center justify-between px-6 border-b border-slate-800">
              <h3 className="font-semibold text-slate-200">Create Task Record</h3>
              <button onClick={() => { setIsCreateModalOpen(false); resetForm(); }} className="text-slate-550 hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Task title..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="px-3 py-2 bg-slate-950/60 border border-slate-850 rounded-lg text-sm focus:outline-none focus:border-violet-500 text-slate-200"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase">Description</label>
                <textarea
                  placeholder="Write a brief description..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="px-3 py-2 bg-slate-950/60 border border-slate-850 rounded-lg text-sm focus:outline-none focus:border-violet-500 text-slate-200 h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Project</label>
                  <select
                    required
                    value={formProject}
                    onChange={(e) => setFormProject(e.target.value)}
                    className="px-3 py-2 bg-slate-950/60 border border-slate-855 rounded-lg text-sm text-slate-300"
                  >
                    <option value="">Select Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Milestone</label>
                  <select
                    value={formMilestone}
                    onChange={(e) => setFormMilestone(e.target.value)}
                    className="px-3 py-2 bg-slate-950/60 border border-slate-855 rounded-lg text-sm text-slate-300"
                  >
                    <option value="">No Milestone</option>
                    {milestones.map((m) => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Assignee</label>
                  <select
                    value={formAssignee}
                    onChange={(e) => setFormAssignee(e.target.value)}
                    className="px-3 py-2 bg-slate-950/60 border border-slate-855 rounded-lg text-sm text-slate-300"
                  >
                    <option value="">Unassigned</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Due Date</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="px-3 py-2 bg-slate-950/60 border border-slate-855 rounded-lg text-sm text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="px-3 py-2 bg-slate-950/60 border border-slate-855 rounded-lg text-sm text-slate-300"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="px-3 py-2 bg-slate-950/60 border border-slate-855 rounded-lg text-sm text-slate-300"
                  >
                    <option value="TODO">TODO</option>
                    <option value="DOING">DOING</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700 py-2.5 rounded-lg text-sm font-medium mt-4 transition"
              >
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────── EDIT TASK MODAL ────────────────── */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="h-14 flex items-center justify-between px-6 border-b border-slate-800">
              <h3 className="font-semibold text-slate-200">Modify Task Record</h3>
              <button onClick={() => { setEditingTask(null); resetForm(); }} className="text-slate-550 hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Task title..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="px-3 py-2 bg-slate-950/60 border border-slate-850 rounded-lg text-sm focus:outline-none focus:border-violet-500 text-slate-200"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase">Description</label>
                <textarea
                  placeholder="Write a brief description..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="px-3 py-2 bg-slate-950/60 border border-slate-850 rounded-lg text-sm focus:outline-none focus:border-violet-500 text-slate-200 h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Project</label>
                  <select
                    required
                    value={formProject}
                    onChange={(e) => setFormProject(e.target.value)}
                    className="px-3 py-2 bg-slate-950/60 border border-slate-855 rounded-lg text-sm text-slate-300"
                  >
                    <option value="">Select Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Milestone</label>
                  <select
                    value={formMilestone}
                    onChange={(e) => setFormMilestone(e.target.value)}
                    className="px-3 py-2 bg-slate-950/60 border border-slate-855 rounded-lg text-sm text-slate-300"
                  >
                    <option value="">No Milestone</option>
                    {milestones.map((m) => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Assignee</label>
                  <select
                    value={formAssignee}
                    onChange={(e) => setFormAssignee(e.target.value)}
                    className="px-3 py-2 bg-slate-950/60 border border-slate-855 rounded-lg text-sm text-slate-300"
                  >
                    <option value="">Unassigned</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Due Date</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="px-3 py-2 bg-slate-950/60 border border-slate-855 rounded-lg text-sm text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="px-3 py-2 bg-slate-950/60 border border-slate-855 rounded-lg text-sm text-slate-300"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="px-3 py-2 bg-slate-950/60 border border-slate-855 rounded-lg text-sm text-slate-300"
                  >
                    <option value="TODO">TODO</option>
                    <option value="DOING">DOING</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700 py-2.5 rounded-lg text-sm font-medium mt-4 transition"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────── TASK DETAILS DRAWER ────────────────── */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden">
            {/* Header info */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/30">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Details</span>
                <span className="text-slate-700">/</span>
                <span className="text-xs text-slate-300 font-mono truncate max-w-[250px]">{selectedTask.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { openEditModal(selectedTask); setSelectedTask(null); }}
                  className="text-slate-400 hover:text-slate-200 text-xs font-semibold px-2 py-1 border border-slate-800 rounded hover:bg-slate-900 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTask(selectedTask.id)}
                  className="text-red-400 hover:text-red-300 p-1 border border-slate-800 rounded hover:bg-red-950/20 transition"
                >
                  <Trash2 size={16} />
                </button>
                <button onClick={() => setSelectedTask(null)} className="text-slate-450 hover:text-slate-200 p-1">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {/* Properties Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-900/30 border border-slate-900 p-4 rounded-xl text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-500 uppercase tracking-wider font-semibold">Project</span>
                  <span className="text-slate-200 font-medium">{selectedTask.project?.name || "N/A"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-500 uppercase tracking-wider font-semibold">Milestone</span>
                  <span className="text-slate-200 font-medium">{selectedTask.milestone?.title || "None"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-500 uppercase tracking-wider font-semibold">Assignee</span>
                  <span className="text-slate-200 font-medium">{selectedTask.assignee?.name || "Unassigned"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-500 uppercase tracking-wider font-semibold">Due Date</span>
                  <span className="text-slate-200 font-medium">
                    {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : "No date"}
                  </span>
                </div>
              </div>

              {/* Status & Priority Selection updates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Status</label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => handleUpdateTaskStatus(selectedTask, e.target.value)}
                    className="px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300"
                  >
                    <option value="TODO">TODO</option>
                    <option value="DOING">DOING</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="DONE">DONE</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Priority</label>
                  <span className="text-sm font-semibold mt-1 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg block text-center max-w-[120px] text-slate-200">
                    {selectedTask.priority}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs text-slate-450 uppercase tracking-wider font-bold">Description</h4>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/10 border border-slate-850 p-4 rounded-xl min-h-[80px]">
                  {selectedTask.description || "No description provided."}
                </p>
              </div>

              {/* Attachments Section (Module 5) */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs text-slate-450 uppercase tracking-wider font-bold">Attachments</h4>
                  <div className="relative">
                    <input
                      type="file"
                      id="drawer-file-upload"
                      onChange={handleUploadAttachment}
                      className="hidden"
                      disabled={uploadingAttachment}
                    />
                    <label
                      htmlFor="drawer-file-upload"
                      className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 cursor-pointer font-medium"
                    >
                      <Paperclip size={14} />
                      <span>{uploadingAttachment ? "Uploading..." : "Attach File"}</span>
                    </label>
                  </div>
                </div>

                {attachments.length === 0 ? (
                  <p className="text-slate-500 text-xs py-2">No attachments.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="p-3 bg-slate-900/40 border border-slate-850 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Paperclip size={16} className="text-slate-500 shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs text-slate-200 truncate max-w-[280px]">
                              {att.mediaAsset?.altText || "Attached File"}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {(att.mediaAsset?.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={att.mediaAsset?.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 hover:bg-slate-800 text-slate-450 hover:text-slate-200 rounded"
                          >
                            <ExternalLink size={14} />
                          </a>
                          <button
                            onClick={() => handleDeleteAttachment(att.id)}
                            className="p-1 hover:bg-red-950/20 text-slate-450 hover:text-red-400 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Comments Section (Module 4) */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs text-slate-455 uppercase tracking-wider font-bold border-b border-slate-800 pb-2 flex items-center gap-2">
                  <MessageSquare size={14} />
                  <span>Discussion Logs</span>
                </h4>

                <form onSubmit={handlePostComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
                  />
                  <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                    Post
                  </button>
                </form>

                {comments.length === 0 ? (
                  <p className="text-slate-500 text-xs py-4 text-center">No comments posted yet.</p>
                ) : (
                  <div className="flex flex-col gap-3 mt-2">
                    {comments.map((comm) => (
                      <div key={comm.id} className="p-3 bg-slate-900/20 border border-slate-850 rounded-lg flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className="font-semibold text-slate-350">{comm.user?.name || "Member"}</span>
                          <span>{new Date(comm.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-normal">{comm.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
