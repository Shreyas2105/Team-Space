import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Upload, Trash2 } from "lucide-react";
import { getTeamById, getTeamMembers } from "../api/teamApi.js";
import {
  getProjectById,
  updateProject,
  completeProject,
  deleteProject,
} from "../api/projectApi.js";
import { getTasks, createTask } from "../api/taskApi.js";
import {
  getProjectAttachments,
  uploadProjectAttachment,
  deleteProjectAttachment,
} from "../api/attachmentApi.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Modal from "../components/Modal.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { formatDate } from "../utils/formatDate.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";
import "../styles/projects.css";

const ProjectDetails = () => {
  const { teamId, projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [members, setMembers] = useState([]);
  const [role, setRole] = useState("member");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskAssignedTo, setTaskAssignedTo] = useState("");
  const [modalError, setModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const isAdmin = role === "admin";

  useEffect(() => {
    loadAll();
  }, [teamId, projectId]);

  const loadAll = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [teamRes, projectRes, tasksRes, attachmentsRes, membersRes] = await Promise.all([
        getTeamById(teamId),
        getProjectById(teamId, projectId),
        getTasks(teamId, projectId),
        getProjectAttachments(teamId, projectId),
        getTeamMembers(teamId),
      ]);

      setRole(teamRes.data.data.role);
      setProject(projectRes.data.data);
      setTasks(tasksRes.data.data);
      setAttachments(attachmentsRes.data.data);
      setMembers(membersRes.data.data);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    setModalError("");

    if (!taskTitle.trim()) {
      setModalError("Task title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await createTask(teamId, projectId, {
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority,
        dueDate: taskDueDate || undefined,
        assignedTo: taskAssignedTo || undefined,
      });
      setShowCreateTask(false);
      setTaskTitle("");
      setTaskDescription("");
      setTaskPriority("medium");
      setTaskDueDate("");
      setTaskAssignedTo("");
      const response = await getTasks(teamId, projectId);
      setTasks(response.data.data);
    } catch (submitError) {
      setModalError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteProject = async () => {
    try {
      const response = await completeProject(teamId, projectId);
      setProject(response.data.data);
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm("Delete this project along with its tasks, comments, and attachments?")) {
      return;
    }

    try {
      await deleteProject(teamId, projectId);
      navigate(`/teams/${teamId}`);
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    }
  };

  const handleUploadAttachment = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setIsUploading(true);

    try {
      await uploadProjectAttachment(teamId, projectId, file);
      const response = await getProjectAttachments(teamId, projectId);
      setAttachments(response.data.data);
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm("Delete this attachment?")) {
      return;
    }

    try {
      await deleteProjectAttachment(teamId, projectId, attachmentId);
      setAttachments((prev) => prev.filter((item) => item._id !== attachmentId));
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!project) {
    return <div className="form-error">{error || "Project not found"}</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{project.title}</h1>
          <StatusBadge status={project.status} />
        </div>

        {isAdmin && (
          <div className="page-header-actions">
            {project.status !== "completed" && (
              <button type="button" className="btn btn-secondary" onClick={handleCompleteProject}>
                Mark Complete
              </button>
            )}
            <button type="button" className="btn btn-danger" onClick={handleDeleteProject}>
              Delete Project
            </button>
          </div>
        )}
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="card" style={{ marginBottom: 20 }}>
        <p>{project.description || "No description"}</p>
        <div className="project-dates">
          <span>Start: {formatDate(project.startDate)}</span>
          <span>Due: {formatDate(project.dueDate)}</span>
        </div>
      </div>

      <div className="page-header">
        <h3 className="section-title">Tasks</h3>
        <button
          type="button"
          className="btn btn-primary btn-small"
          onClick={() => setShowCreateTask(true)}
        >
          <Plus size={16} />
          New Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState title="No tasks yet" description="Create the first task for this project." />
      ) : (
        <div className="grid-cards">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="card team-card"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/teams/${teamId}/projects/${projectId}/tasks/${task._id}`)}
            >
              <div className="team-card-header">
                <h3>{task.title}</h3>
                <StatusBadge status={task.status} />
              </div>
              <div className="task-card-meta">
                <StatusBadge status={task.priority} />
                <span className="team-card-date">
                  {task.assignedTo ? task.assignedTo.fullName : "Unassigned"}
                </span>
              </div>
              <div className="team-card-footer">
                <span className="team-card-date">Due {formatDate(task.dueDate)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 className="section-title" style={{ marginTop: 28 }}>
        Project Attachments
      </h3>

      {isAdmin && (
        <label className="btn btn-secondary upload-label">
          <Upload size={16} />
          {isUploading ? "Uploading..." : "Upload File"}
          <input type="file" hidden onChange={handleUploadAttachment} disabled={isUploading} />
        </label>
      )}

      {attachments.length === 0 ? (
        <EmptyState title="No attachments yet" />
      ) : (
        <div className="attachment-list">
          {attachments.map((attachment) => (
            <div key={attachment._id} className="attachment-item">
              <a href={attachment.fileUrl} target="_blank" rel="noreferrer">
                {attachment.fileName}
              </a>
              <span className="team-card-date">
                {attachment.uploadedBy?.fullName} • {formatDate(attachment.createdAt)}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={() => handleDeleteAttachment(attachment._id)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showCreateTask && (
        <Modal title="Create Task" onClose={() => setShowCreateTask(false)}>
          {modalError && <div className="form-error">{modalError}</div>}

          <form onSubmit={handleCreateTask}>
            <div className="form-group">
              <label htmlFor="taskTitle">Title</label>
              <input
                id="taskTitle"
                type="text"
                value={taskTitle}
                onChange={(event) => setTaskTitle(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="taskDescription">Description</label>
              <textarea
                id="taskDescription"
                rows={3}
                value={taskDescription}
                onChange={(event) => setTaskDescription(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="taskPriority">Priority</label>
              <select
                id="taskPriority"
                value={taskPriority}
                onChange={(event) => setTaskPriority(event.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="taskDueDate">Due Date</label>
              <input
                id="taskDueDate"
                type="date"
                value={taskDueDate}
                onChange={(event) => setTaskDueDate(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="taskAssignedTo">Assign To (optional)</label>
              <select
                id="taskAssignedTo"
                value={taskAssignedTo}
                onChange={(event) => setTaskAssignedTo(event.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member._id} value={member.user._id}>
                    {member.user.fullName}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ProjectDetails;
