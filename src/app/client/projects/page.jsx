"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  FolderKanban,
  CheckCircle,
  FileCheck,
  FolderOpen,
  MessageSquare,
  Download,
  Upload,
  User,
  Clock,
  Send,
  AlertCircle,
  X,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  
  // Tab workspace views: overview, deliverables, files, messages
  const [workspaceTab, setWorkspaceTab] = useState("overview");

  // Sub data states
  const [deliverables, setDeliverables] = useState([]);
  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState([]);

  // Form states
  const [feedbackText, setFeedbackText] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [approvingDelId, setApprovingDelId] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [isApproveMode, setIsApproveMode] = useState(true); // true = Approve, false = Reject

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatBottomRef = useRef(null);

  // Load projects list
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/client/projects");
      if (!res.ok) throw new Error("Failed to load client projects list");
      const payload = await res.json();
      setProjects(payload.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Load project details
  const loadProjectWorkspace = async (project) => {
    setSelectedProject(project);
    setWorkspaceTab("overview");
    setLoading(true);
    try {
      const res = await fetch(`/api/client/projects/${project.id}`);
      if (!res.ok) throw new Error("Failed to load project details");
      const payload = await res.json();
      setProjectDetails(payload.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Lazy-load other tabs data
  const loadDeliverables = useCallback(async () => {
    if (!selectedProject) return;
    try {
      const res = await fetch(`/api/client/projects/${selectedProject.id}/deliverables`);
      if (res.ok) {
        const payload = await res.json();
        setDeliverables(payload.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, [selectedProject]);

  const loadFiles = useCallback(async () => {
    if (!selectedProject) return;
    try {
      const res = await fetch(`/api/client/projects/${selectedProject.id}/files`);
      if (res.ok) {
        const payload = await res.json();
        setFiles(payload.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, [selectedProject]);

  const loadMessages = useCallback(async () => {
    if (!selectedProject) return;
    try {
      const res = await fetch(`/api/client/projects/${selectedProject.id}/messages`);
      if (res.ok) {
        const payload = await res.json();
        setMessages(payload.data || []);
        setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch (err) {
      console.error(err);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (workspaceTab === "deliverables") loadDeliverables();
    if (workspaceTab === "files") loadFiles();
    if (workspaceTab === "messages") loadMessages();
  }, [workspaceTab, loadDeliverables, loadFiles, loadMessages]);

  // Deliverables Approval
  const handleApprovalSubmit = async (e) => {
    e.preventDefault();
    if (!approvingDelId || !selectedProject) return;

    try {
      const res = await fetch(`/api/client/projects/${selectedProject.id}/deliverables/${approvingDelId}/approval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approved: isApproveMode,
          feedback: feedbackText || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to register approval decision");
      
      setFeedbackText("");
      setApprovingDelId(null);
      setShowApprovalModal(false);
      loadDeliverables();
    } catch (err) {
      alert(err.message);
    }
  };

  // Upload Client Files
  const handleClientFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProject) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/client/projects/${selectedProject.id}/files`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errPayload = await res.json().catch(() => ({}));
        throw new Error(errPayload.message || "Failed to upload file");
      }

      loadFiles();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  // Messages Chat
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedProject) return;

    try {
      const res = await fetch(`/api/client/projects/${selectedProject.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: chatMessage }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const payload = await res.json();
      setMessages((prev) => [...prev, payload.data]);
      setChatMessage("");
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col gap-6">
      {/* Back button when project selected */}
      {selectedProject && (
        <div>
          <button
            onClick={() => { setSelectedProject(null); setProjectDetails(null); }}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-xs font-semibold px-3 py-1.5 border border-slate-800 rounded-lg hover:bg-slate-900 transition mb-2"
          >
            <ChevronLeft size={14} />
            <span>Back to Projects list</span>
          </button>
        </div>
      )}

      {/* Main container */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {selectedProject ? selectedProject.name : "Projects Directory"}
          </h1>
          <p className="text-sm text-slate-450 mt-1">
            {selectedProject
              ? "Collaboration workspace, file exchange ledger, and progress milestones"
              : "Ongoing active developments and system deliverables archives"}
          </p>
        </div>

        {/* ────────────────── PROJECTS LIST VIEW ────────────────── */}
        {!selectedProject && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => loadProjectWorkspace(proj)}
                className="p-6 bg-slate-900/25 hover:bg-slate-900/40 border border-slate-850 hover:border-violet-500/20 rounded-2xl cursor-pointer transition flex flex-col gap-4 shadow-lg"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-200">{proj.name}</h3>
                  <p className="text-xs text-slate-450 mt-1.5 line-clamp-2 min-h-[32px]">
                    {proj.description || "No project description provided."}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-semibold uppercase">Development Progress</span>
                    <span className="font-mono font-bold text-violet-400">{proj.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 transition-all duration-300"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                <div className="border-t border-slate-850 pt-4 flex items-center justify-between text-[10px]">
                  <span className={`px-2 py-0.5 rounded font-semibold border ${
                    proj.status === "ACTIVE" ? "text-sky-400 bg-sky-950/40 border-sky-900/20" :
                    proj.status === "COMPLETED" ? "text-emerald-400 bg-emerald-950/40 border-emerald-900/20" :
                    "text-slate-400 bg-slate-950 border-slate-900"
                  }`}>
                    {proj.status}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <User size={12} className="text-slate-500" />
                    <span className="text-slate-400">{proj.manager?.name || "Assigning Manager"}</span>
                  </div>
                </div>
              </div>
            ))}

            {projects.length === 0 && !loading && (
              <div className="col-span-full p-12 text-center text-slate-500 text-sm bg-slate-900/10 border border-slate-800 rounded-xl">
                No projects assigned to your account.
              </div>
            )}
          </div>
        )}

        {/* ────────────────── PROJECT WORKSPACE VIEW ────────────────── */}
        {selectedProject && projectDetails && (
          <div className="flex flex-col gap-6">
            {/* Workspace tabs */}
            <div className="border-b border-slate-850 flex gap-6">
              <button
                onClick={() => setWorkspaceTab("overview")}
                className={`pb-3 text-sm font-medium border-b-2 transition ${
                  workspaceTab === "overview" ? "border-violet-500 text-violet-405" : "border-transparent text-slate-405 hover:text-slate-205"
                }`}
              >
                Progress Overview
              </button>
              <button
                onClick={() => setWorkspaceTab("deliverables")}
                className={`pb-3 text-sm font-medium border-b-2 transition ${
                  workspaceTab === "deliverables" ? "border-violet-500 text-violet-405" : "border-transparent text-slate-405 hover:text-slate-205"
                }`}
              >
                Deliverables & Feedback
              </button>
              <button
                onClick={() => setWorkspaceTab("files")}
                className={`pb-3 text-sm font-medium border-b-2 transition ${
                  workspaceTab === "files" ? "border-violet-500 text-violet-405" : "border-transparent text-slate-405 hover:text-slate-205"
                }`}
              >
                Shared Files
              </button>
              <button
                onClick={() => setWorkspaceTab("messages")}
                className={`pb-3 text-sm font-medium border-b-2 transition ${
                  workspaceTab === "messages" ? "border-violet-500 text-violet-405" : "border-transparent text-slate-405 hover:text-slate-205"
                }`}
              >
                Messages Thread
              </button>
            </div>

            {/* TAB CONTENT: 1. OVERVIEW */}
            {workspaceTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Meta details & Milestones */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  {/* description card */}
                  <div className="p-6 bg-slate-900/15 border border-slate-850 rounded-xl flex flex-col gap-2">
                    <h3 className="text-xs text-slate-450 uppercase tracking-wider font-bold">About Project</h3>
                    <p className="text-sm text-slate-350 leading-relaxed">
                      {projectDetails.description || "No project description available."}
                    </p>
                  </div>

                  {/* Milestones bar timeline */}
                  <div className="p-6 bg-slate-900/15 border border-slate-850 rounded-xl flex flex-col gap-4">
                    <h3 className="text-xs text-slate-450 uppercase tracking-wider font-bold border-b border-slate-800 pb-2">
                      Project Milestones
                    </h3>
                    <div className="flex flex-col gap-4">
                      {projectDetails.milestones?.map((mil) => (
                        <div key={mil.id} className="flex flex-col gap-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-250">{mil.title}</span>
                            <span className="text-violet-400 font-mono">{mil.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500" style={{ width: `${mil.progress}%` }} />
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span>Status: {mil.status}</span>
                            <span>Due: {mil.dueDate ? new Date(mil.dueDate).toLocaleDateString() : "No Date"}</span>
                          </div>
                        </div>
                      ))}
                      {projectDetails.milestones?.length === 0 && (
                        <p className="text-slate-500 text-xs py-2">No milestones defined.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right col: Tasks list (Read Only) */}
                <div className="p-6 bg-slate-900/15 border border-slate-850 rounded-xl flex flex-col gap-4">
                  <h3 className="text-xs text-slate-450 uppercase tracking-wider font-bold border-b border-slate-800 pb-2">
                    Development Tasks Directory
                  </h3>
                  <div className="flex flex-col gap-3">
                    {projectDetails.tasks?.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg flex flex-col gap-1.5"
                      >
                        <h4 className="text-xs font-semibold text-slate-250 leading-tight">{task.title}</h4>
                        <div className="flex justify-between items-center text-[9px] text-slate-500">
                          <span className={`px-1.5 py-0.5 rounded border font-mono ${
                            task.status === "DONE" ? "text-emerald-400 border-emerald-900/25 bg-emerald-950/30" : "text-slate-400 border-slate-800"
                          }`}>{task.status}</span>
                          <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}</span>
                        </div>
                      </div>
                    ))}
                    {projectDetails.tasks?.length === 0 && (
                      <p className="text-slate-500 text-xs py-2 text-center">No tasks assigned to project.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. DELIVERABLES */}
            {workspaceTab === "deliverables" && (
              <div className="p-6 bg-slate-900/15 border border-slate-850 rounded-xl flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Agency Deliverables Log</h3>
                  <p className="text-xs text-slate-500 mt-1">Review version submissions, download assets, and submit approvals.</p>
                </div>

                <div className="flex flex-col gap-4">
                  {deliverables.map((del) => (
                    <div
                      key={del.id}
                      className="p-5 bg-slate-950/50 border border-slate-850 rounded-xl flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-3">
                          <h4 className="text-sm font-semibold text-slate-200">{del.title}</h4>
                          <span className="text-[10px] text-slate-500 font-mono">v{del.version}</span>
                        </div>
                        <p className="text-xs text-slate-450 leading-tight">
                          Status: <span className="font-semibold text-slate-300">{del.status}</span>
                        </p>
                        {del.feedback && (
                          <div className="p-2 bg-slate-900/40 rounded text-[11px] text-slate-450 border border-slate-850">
                            Feedback: {del.feedback}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {del.fileUrl && (
                          <a
                            href={del.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 px-3 py-1.5 border border-slate-800 rounded-lg hover:bg-slate-900 transition font-medium"
                          >
                            <Download size={14} />
                            <span>Download Asset</span>
                          </a>
                        )}

                        {del.status === "SUBMITTED" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setApprovingDelId(del.id);
                                setIsApproveMode(true);
                                setShowApprovalModal(true);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setApprovingDelId(del.id);
                                setIsApproveMode(false);
                                setShowApprovalModal(true);
                              }}
                              className="bg-red-650 hover:bg-red-750 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {deliverables.length === 0 && (
                    <p className="text-slate-500 text-xs py-8 text-center">No deliverables found.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. FILES */}
            {workspaceTab === "files" && (
              <div className="p-6 bg-slate-900/15 border border-slate-850 rounded-xl flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Documents Shared Folder</h3>
                    <p className="text-xs text-slate-500 mt-1">Shared project assets database</p>
                  </div>
                  <div>
                    <input
                      type="file"
                      id="client-file-workspace"
                      onChange={handleClientFileUpload}
                      className="hidden"
                      disabled={uploadingFile}
                    />
                    <label
                      htmlFor="client-file-workspace"
                      className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-750 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition shadow-md shadow-violet-900/20"
                    >
                      <Upload size={14} />
                      <span>{uploadingFile ? "Uploading File..." : "Upload Document"}</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="p-4 bg-slate-950/50 border border-slate-850 rounded-xl flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <FolderOpen className="text-slate-500 shrink-0" size={18} />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs text-slate-200 truncate max-w-[200px]">
                            {file.mediaAsset?.altText || "Workspace Document"}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {(file.mediaAsset?.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={file.mediaAsset?.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded"
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    </div>
                  ))}

                  {files.length === 0 && (
                    <p className="text-slate-500 text-xs py-8 text-center col-span-full">No shared documents shared yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 4. MESSAGES */}
            {workspaceTab === "messages" && (
              <div className="p-6 bg-slate-900/15 border border-slate-850 rounded-xl flex flex-col h-[500px]">
                {/* Chat feed list */}
                <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 pb-4">
                  {messages.map((msg) => {
                    const isSelf = msg.senderId === projectDetails.clientId; // Or check standard context
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[70%] gap-1 ${
                          isSelf ? "self-end items-end" : "self-start items-start"
                        }`}
                      >
                        <span className="text-[9px] text-slate-550">
                          {msg.sender?.name} · {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                        <div className={`p-3 rounded-2xl text-xs leading-normal ${
                          isSelf
                            ? "bg-violet-600 text-white rounded-tr-none shadow-md shadow-violet-900/10"
                            : "bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none"
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatBottomRef} />
                </div>

                {/* Send chat message input form */}
                <form onSubmit={handleSendMessage} className="border-t border-slate-800 pt-4 flex gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Type project message updates here..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-950/60 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-violet-500 placeholder-slate-550 transition"
                  />
                  <button
                    type="submit"
                    className="bg-violet-650 hover:bg-violet-750 text-white p-2.5 rounded-xl transition flex items-center justify-center shadow-lg shadow-violet-900/10 shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ────────────────── APPROVAL DECISION MODAL ────────────────── */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="h-14 flex items-center justify-between px-6 border-b border-slate-800">
              <h3 className="font-semibold text-slate-200">
                {isApproveMode ? "Approve Submission" : "Reject Submission"}
              </h3>
              <button onClick={() => { setShowApprovalModal(false); setFeedbackText(""); }} className="text-slate-550 hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApprovalSubmit} className="p-6 flex flex-col gap-4">
              <p className="text-xs text-slate-400">
                {isApproveMode
                  ? "Are you sure you want to approve this deliverable? Feedback is optional."
                  : "Please provide feedback explaining the changes required for revision."}
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Feedback / Notes</label>
                <textarea
                  required={!isApproveMode}
                  placeholder="Explain your revision requests or feedback..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="px-3 py-2 bg-slate-950/60 border border-slate-850 rounded-lg text-xs focus:outline-none focus:border-violet-500 text-slate-200 h-24"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 rounded-lg text-xs font-semibold transition ${
                  isApproveMode ? "bg-emerald-650 hover:bg-emerald-755 text-white" : "bg-red-650 hover:bg-red-755 text-white"
                }`}
              >
                Submit Decision
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
