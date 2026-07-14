import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import {
  getTeamById,
  getTeamMembers,
  leaveTeam,
  promoteMember,
  demoteMember,
  removeMember,
} from "../api/teamApi.js";
import { getProjects, createProject } from "../api/projectApi.js";
import { getTeamActivity } from "../api/activityApi.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Modal from "../components/Modal.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { formatDate, formatDateTime } from "../utils/formatDate.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";
import "../styles/teams.css";

const TABS = ["Overview", "Projects", "Members", "Activity"];

const TeamDetails = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Overview");
  const [teamInfo, setTeamInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectStartDate, setProjectStartDate] = useState("");
  const [projectDueDate, setProjectDueDate] = useState("");
  const [modalError, setModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAll();
  }, [teamId]);

  const loadAll = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [teamRes, membersRes, projectsRes, activityRes] = await Promise.all([
        getTeamById(teamId),
        getTeamMembers(teamId),
        getProjects(teamId),
        getTeamActivity(teamId),
      ]);

      setTeamInfo(teamRes.data.data);
      setMembers(membersRes.data.data);
      setProjects(projectsRes.data.data);
      setActivity(activityRes.data.data);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshMembers = async () => {
    const response = await getTeamMembers(teamId);
    setMembers(response.data.data);
  };

  const handleCreateProject = async (event) => {
    event.preventDefault();
    setModalError("");

    if (!projectTitle.trim()) {
      setModalError("Project title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await createProject(teamId, {
        title: projectTitle,
        description: projectDescription,
        startDate: projectStartDate || undefined,
        dueDate: projectDueDate || undefined,
      });
      setShowCreateProject(false);
      setProjectTitle("");
      setProjectDescription("");
      setProjectStartDate("");
      setProjectDueDate("");
      const response = await getProjects(teamId);
      setProjects(response.data.data);
    } catch (submitError) {
      setModalError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePromote = async (memberId) => {
    try {
      await promoteMember(teamId, memberId);
      refreshMembers();
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    }
  };

  const handleDemote = async (memberId) => {
    try {
      await demoteMember(teamId, memberId);
      refreshMembers();
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm("Remove this member from the team?")) {
      return;
    }

    try {
      await removeMember(teamId, memberId);
      refreshMembers();
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm("Are you sure you want to leave this team?")) {
      return;
    }

    try {
      await leaveTeam(teamId);
      navigate("/teams");
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!teamInfo) {
    return <div className="form-error">{error || "Team not found"}</div>;
  }

  const isAdmin = teamInfo.role === "admin";

  return (
    <div>
      <div className="page-header">
        <h1>{teamInfo.team.name}</h1>
        <button type="button" className="btn btn-secondary" onClick={handleLeaveTeam}>
          Leave Team
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="card">
          <p>{teamInfo.team.description || "No description"}</p>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Invite Code</label>
            <div className="invite-code-box">{teamInfo.team.inviteCode}</div>
          </div>

          <div className="team-overview-grid">
            <div className="overview-stat">
              <div className="overview-stat-value">{members.length}</div>
              <div className="overview-stat-label">Members</div>
            </div>
            <div className="overview-stat">
              <div className="overview-stat-value">{projects.length}</div>
              <div className="overview-stat-label">Projects</div>
            </div>
            <div className="overview-stat">
              <div className="overview-stat-value">
                <StatusBadge status={teamInfo.role} />
              </div>
              <div className="overview-stat-label">Your Role</div>
            </div>
            <div className="overview-stat">
              <div className="overview-stat-value">{formatDate(teamInfo.team.createdAt)}</div>
              <div className="overview-stat-label">Created</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Projects" && (
        <div>
          <div className="page-header">
            <h3 className="section-title">Projects</h3>
            {isAdmin && (
              <button
                type="button"
                className="btn btn-primary btn-small"
                onClick={() => setShowCreateProject(true)}
              >
                <Plus size={16} />
                New Project
              </button>
            )}
          </div>

          {projects.length === 0 ? (
            <EmptyState title="No projects yet" description="Projects created for this team will show up here." />
          ) : (
            <div className="grid-cards">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="card team-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/teams/${teamId}/projects/${project._id}`)}
                >
                  <div className="team-card-header">
                    <h3>{project.title}</h3>
                    <StatusBadge status={project.status} />
                  </div>
                  <p className="team-card-description">
                    {project.description || "No description"}
                  </p>
                  <div className="team-card-footer">
                    <span className="team-card-date">Due {formatDate(project.dueDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "Members" && (
        <div className="card">
          <table className="member-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Joined</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member._id}>
                  <td>
                    <div className="member-identity">
                      <div className="member-avatar">
                        {member.user.fullName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div>{member.user.fullName}</div>
                        <div className="team-card-date">@{member.user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={member.role} />
                  </td>
                  <td>{formatDate(member.createdAt)}</td>
                  {isAdmin && (
                    <td>
                      <div className="member-actions">
                        {member.role === "member" ? (
                          <button
                            type="button"
                            className="btn btn-secondary btn-small"
                            onClick={() => handlePromote(member._id)}
                          >
                            Promote
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-secondary btn-small"
                            onClick={() => handleDemote(member._id)}
                          >
                            Demote
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-danger btn-small"
                          onClick={() => handleRemove(member._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "Activity" && (
        <div className="card">
          {activity.length === 0 ? (
            <EmptyState title="No activity yet" description="Team actions will show up here." />
          ) : (
            <div className="activity-list">
              {activity.map((entry) => (
                <div key={entry._id} className="activity-item">
                  <div className="activity-dot" />
                  <div>
                    <div className="activity-message">{entry.message}</div>
                    <div className="activity-time">{formatDateTime(entry.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showCreateProject && (
        <Modal title="Create Project" onClose={() => setShowCreateProject(false)}>
          {modalError && <div className="form-error">{modalError}</div>}

          <form onSubmit={handleCreateProject}>
            <div className="form-group">
              <label htmlFor="projectTitle">Title</label>
              <input
                id="projectTitle"
                type="text"
                value={projectTitle}
                onChange={(event) => setProjectTitle(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="projectDescription">Description</label>
              <textarea
                id="projectDescription"
                rows={3}
                value={projectDescription}
                onChange={(event) => setProjectDescription(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="projectStartDate">Start Date</label>
              <input
                id="projectStartDate"
                type="date"
                value={projectStartDate}
                onChange={(event) => setProjectStartDate(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="projectDueDate">Due Date</label>
              <input
                id="projectDueDate"
                type="date"
                value={projectDueDate}
                onChange={(event) => setProjectDueDate(event.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TeamDetails;
