import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, Trash2, Pencil } from "lucide-react";
import { getTeamById, getTeamMembers } from "../api/teamApi.js";
import {
  getTaskById,
  updateTask,
  assignTask,
  changeTaskStatus,
  deleteTask,
} from "../api/taskApi.js";
import { getComments, addComment, updateComment, deleteComment } from "../api/commentApi.js";
import {
  getTaskAttachments,
  uploadTaskAttachment,
  deleteTaskAttachment,
} from "../api/attachmentApi.js";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { formatDate, formatDateTime } from "../utils/formatDate.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";
import "../styles/projects.css";

const STATUS_OPTIONS = ["todo", "in-progress", "review", "done"];

const TaskDetails = () => {
  const { teamId, projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [members, setMembers] = useState([]);
  const [role, setRole] = useState("member");
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editDueDate, setEditDueDate] = useState("");

  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const isAdmin = role === "admin";
  const isAssignee = task?.assignedTo && task.assignedTo._id === user?._id;
  const canChangeStatus = isAdmin || isAssignee;

  useEffect(() => {
    loadAll();
  }, [teamId, projectId, taskId]);

  const loadAll = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [teamRes, taskRes, membersRes, commentsRes, attachmentsRes] = await Promise.all([
        getTeamById(teamId),
        getTaskById(teamId, projectId, taskId),
        getTeamMembers(teamId),
        getComments(teamId, projectId, taskId),
        getTaskAttachments(teamId, projectId, taskId),
      ]);

      setRole(teamRes.data.data.role);
      setTask(taskRes.data.data);
      setMembers(membersRes.data.data);
      setComments(commentsRes.data.data);
      setAttachments(attachmentsRes.data.data);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
    setIsEditing(true);
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();

    try {
      await updateTask(teamId, projectId, taskId, {
        title: editTitle,
        description: editDescription,
        priority: editPriority,
        dueDate: editDueDate || undefined,
      });
      const refreshed = await getTaskById(teamId, projectId, taskId);
      setTask(refreshed.data.data);
      setIsEditing(false);
    } catch (updateError) {
      setError(getErrorMessage(updateError));
    }
  };

  const handleStatusChange = async (event) => {
    try {
      await changeTaskStatus(teamId, projectId, taskId, event.target.value);
      const refreshed = await getTaskById(teamId, projectId, taskId);
      setTask(refreshed.data.data);
    } catch (statusError) {
      setError(getErrorMessage(statusError));
    }
  };

  const handleAssign = async (event) => {
    const assignedTo = event.target.value;

    if (!assignedTo) {
      return;
    }

    try {
      await assignTask(teamId, projectId, taskId, assignedTo);
      const refreshed = await getTaskById(teamId, projectId, taskId);
      setTask(refreshed.data.data);
    } catch (assignError) {
      setError(getErrorMessage(assignError));
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm("Delete this task along with its comments and attachments?")) {
      return;
    }

    try {
      await deleteTask(teamId, projectId, taskId);
      navigate(`/teams/${teamId}/projects/${projectId}`);
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  };

  const handleAddComment = async (event) => {
    event.preventDefault();

    if (!newComment.trim()) {
      return;
    }

    try {
      await addComment(teamId, projectId, taskId, newComment);
      setNewComment("");
      const response = await getComments(teamId, projectId, taskId);
      setComments(response.data.data);
    } catch (commentError) {
      setError(getErrorMessage(commentError));
    }
  };

  const startEditingComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditingCommentText(comment.content);
  };

  const handleSaveComment = async (commentId) => {
    try {
      await updateComment(teamId, projectId, taskId, commentId, editingCommentText);
      setEditingCommentId(null);
      const response = await getComments(teamId, projectId, taskId);
      setComments(response.data.data);
    } catch (commentError) {
      setError(getErrorMessage(commentError));
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) {
      return;
    }

    try {
      await deleteComment(teamId, projectId, taskId, commentId);
      setComments((prev) => prev.filter((comment) => comment._id !== commentId));
    } catch (commentError) {
      setError(getErrorMessage(commentError));
    }
  };

  const handleUploadAttachment = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setIsUploading(true);

    try {
      await uploadTaskAttachment(teamId, projectId, taskId, file);
      const response = await getTaskAttachments(teamId, projectId, taskId);
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
      await deleteTaskAttachment(teamId, projectId, taskId, attachmentId);
      setAttachments((prev) => prev.filter((item) => item._id !== attachmentId));
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!task) {
    return <div className="form-error">{error || "Task not found"}</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{task.title}</h1>
          <StatusBadge status={task.priority} />
        </div>

        {isAdmin && (
          <div className="page-header-actions">
            <button type="button" className="btn btn-secondary" onClick={startEditing}>
              <Pencil size={16} />
              Edit
            </button>
            <button type="button" className="btn btn-danger" onClick={handleDeleteTask}>
              Delete
            </button>
          </div>
        )}
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="task-detail-grid">
        <div>
          {isEditing ? (
            <div className="card">
              <form onSubmit={handleSaveEdit}>
                <div className="form-group">
                  <label htmlFor="editTitle">Title</label>
                  <input
                    id="editTitle"
                    type="text"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editDescription">Description</label>
                  <textarea
                    id="editDescription"
                    rows={3}
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editPriority">Priority</label>
                  <select
                    id="editPriority"
                    value={editPriority}
                    onChange={(event) => setEditPriority(event.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="editDueDate">Due Date</label>
                  <input
                    id="editDueDate"
                    type="date"
                    value={editDueDate}
                    onChange={(event) => setEditDueDate(event.target.value)}
                  />
                </div>

                <div className="page-header-actions">
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card">
              <p>{task.description || "No description"}</p>
            </div>
          )}

          <h3 className="section-title" style={{ marginTop: 24 }}>
            Comments
          </h3>

          <div className="card">
            {comments.length === 0 ? (
              <EmptyState title="No comments yet" />
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">{comment.user.fullName}</span>
                    <span>{formatDateTime(comment.createdAt)}</span>
                  </div>

                  {editingCommentId === comment._id ? (
                    <div>
                      <textarea
                        rows={2}
                        value={editingCommentText}
                        onChange={(event) => setEditingCommentText(event.target.value)}
                      />
                      <div className="comment-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-small"
                          onClick={() => handleSaveComment(comment._id)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-small"
                          onClick={() => setEditingCommentId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p>{comment.content}</p>
                      {(comment.user._id === user?._id || isAdmin) && (
                        <div className="comment-actions">
                          {comment.user._id === user?._id && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-small"
                              onClick={() => startEditingComment(comment)}
                            >
                              Edit
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-danger btn-small"
                            onClick={() => handleDeleteComment(comment._id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            )}

            <form className="comment-form" onSubmit={handleAddComment}>
              <textarea
                rows={2}
                placeholder="Add a comment..."
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                Post
              </button>
            </form>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="task-meta-row">
              <span className="task-meta-label">Status</span>
              <select value={task.status} onChange={handleStatusChange} disabled={!canChangeStatus}>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="task-meta-row">
              <span className="task-meta-label">Assigned To</span>
              {isAdmin ? (
                <select value={task.assignedTo?._id || ""} onChange={handleAssign}>
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member._id} value={member.user._id}>
                      {member.user.fullName}
                    </option>
                  ))}
                </select>
              ) : (
                <span>{task.assignedTo?.fullName || "Unassigned"}</span>
              )}
            </div>

            <div className="task-meta-row">
              <span className="task-meta-label">Due Date</span>
              <span>{formatDate(task.dueDate)}</span>
            </div>

            <div className="task-meta-row">
              <span className="task-meta-label">Created By</span>
              <span>{task.createdBy?.fullName}</span>
            </div>
          </div>

          <h3 className="section-title" style={{ marginTop: 24 }}>
            Attachments
          </h3>

          <label className="btn btn-secondary upload-label">
            <Upload size={16} />
            {isUploading ? "Uploading..." : "Upload File"}
            <input type="file" hidden onChange={handleUploadAttachment} disabled={isUploading} />
          </label>

          {attachments.length === 0 ? (
            <EmptyState title="No attachments yet" />
          ) : (
            <div className="attachment-list">
              {attachments.map((attachment) => (
                <div key={attachment._id} className="attachment-item">
                  <a href={attachment.fileUrl} target="_blank" rel="noreferrer">
                    {attachment.fileName}
                  </a>
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
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
