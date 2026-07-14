import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LogIn } from "lucide-react";
import { getMyTeams, createTeam, joinTeam } from "../api/teamApi.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Modal from "../components/Modal.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { formatDate } from "../utils/formatDate.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";
import "../styles/teams.css";

const Teams = () => {
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [modalError, setModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    setIsLoading(true);

    try {
      const response = await getMyTeams();
      setTeams(response.data.data);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async (event) => {
    event.preventDefault();
    setModalError("");

    if (!teamName.trim()) {
      setModalError("Team name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await createTeam({ name: teamName, description: teamDescription });
      setShowCreateModal(false);
      setTeamName("");
      setTeamDescription("");
      loadTeams();
    } catch (submitError) {
      setModalError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinTeam = async (event) => {
    event.preventDefault();
    setModalError("");

    if (!inviteCode.trim()) {
      setModalError("Invite code is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await joinTeam(inviteCode.trim());
      setShowJoinModal(false);
      setInviteCode("");
      loadTeams();
    } catch (submitError) {
      setModalError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Teams</h1>

        <div className="page-header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowJoinModal(true)}
          >
            <LogIn size={16} />
            Join Team
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} />
            Create Team
          </button>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      {teams.length === 0 ? (
        <EmptyState
          title="No teams yet"
          description="Create a new team or join one using an invite code."
        />
      ) : (
        <div className="grid-cards">
          {teams.map((entry) => (
            <div key={entry.team._id} className="card team-card">
              <div className="team-card-header">
                <h3>{entry.team.name}</h3>
                <StatusBadge status={entry.role} />
              </div>

              <p className="team-card-description">
                {entry.team.description || "No description"}
              </p>

              <div className="team-card-footer">
                <span className="team-card-date">Joined {formatDate(entry.joinedAt)}</span>
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={() => navigate(`/teams/${entry.team._id}`)}
                >
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <Modal title="Create Team" onClose={() => setShowCreateModal(false)}>
          {modalError && <div className="form-error">{modalError}</div>}

          <form onSubmit={handleCreateTeam}>
            <div className="form-group">
              <label htmlFor="teamName">Team Name</label>
              <input
                id="teamName"
                type="text"
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="teamDescription">Description</label>
              <textarea
                id="teamDescription"
                rows={3}
                value={teamDescription}
                onChange={(event) => setTeamDescription(event.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Team"}
            </button>
          </form>
        </Modal>
      )}

      {showJoinModal && (
        <Modal title="Join Team" onClose={() => setShowJoinModal(false)}>
          {modalError && <div className="form-error">{modalError}</div>}

          <form onSubmit={handleJoinTeam}>
            <div className="form-group">
              <label htmlFor="inviteCode">Invite Code</label>
              <input
                id="inviteCode"
                type="text"
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value)}
                placeholder="e.g. A1B2C3D4"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Joining..." : "Join Team"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Teams;
