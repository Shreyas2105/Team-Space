import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { getMyTeams } from "../api/teamApi.js";
import { getTeamDashboard } from "../api/dashboardApi.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { getErrorMessage } from "../utils/getErrorMessage.js";
import "../styles/dashboard.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const SELECTED_TEAM_KEY = "teamspace_selected_team_id";

const Dashboard = () => {
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (selectedTeamId) {
      loadDashboard(selectedTeamId);
      localStorage.setItem(SELECTED_TEAM_KEY, selectedTeamId);
    }
  }, [selectedTeamId]);

  const loadTeams = async () => {
    try {
      const response = await getMyTeams();
      const myTeams = response.data.data;
      setTeams(myTeams);

      const storedTeamId = localStorage.getItem(SELECTED_TEAM_KEY);
      const storedTeamIsValid = myTeams.some((entry) => entry.team._id === storedTeamId);

      if (storedTeamIsValid) {
        setSelectedTeamId(storedTeamId);
      } else if (myTeams.length > 0) {
        setSelectedTeamId(myTeams[0].team._id);
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoadingTeams(false);
    }
  };

  const loadDashboard = async (teamId) => {
    setLoadingDashboard(true);
    setError("");

    try {
      const response = await getTeamDashboard(teamId);
      setDashboard(response.data.data);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoadingDashboard(false);
    }
  };

  if (loadingTeams) {
    return <LoadingSpinner />;
  }

  if (teams.length === 0) {
    return (
      <EmptyState
        title="You're not part of any team yet"
        description="Create a team or join one with an invite code to see your dashboard."
        actionLabel="Go to Teams"
        onAction={() => navigate("/teams")}
      />
    );
  }

  const chartData = dashboard
    ? {
        labels: ["To Do", "In Progress", "In Review", "Done"],
        datasets: [
          {
            data: [
              dashboard.taskStatusDistribution.todo,
              dashboard.taskStatusDistribution["in-progress"],
              dashboard.taskStatusDistribution.review,
              dashboard.taskStatusDistribution.done,
            ],
            backgroundColor: ["#c4c8d1", "#4f5df3", "#f5a524", "#22a06b"],
            borderWidth: 0,
          },
        ],
      }
    : null;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>

        <select
          className="team-selector"
          value={selectedTeamId}
          onChange={(event) => setSelectedTeamId(event.target.value)}
        >
          {teams.map((entry) => (
            <option key={entry.team._id} value={entry.team._id}>
              {entry.team.name}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loadingDashboard && <LoadingSpinner />}

      {!loadingDashboard && dashboard && (
        <>
          <div className="grid-cards dashboard-cards">
            <div className="card stat-card">
              <div className="stat-value">{dashboard.cards.totalProjects}</div>
              <div className="stat-label">Total Projects</div>
            </div>
            <div className="card stat-card">
              <div className="stat-value">{dashboard.cards.activeProjects}</div>
              <div className="stat-label">Active Projects</div>
            </div>
            <div className="card stat-card">
              <div className="stat-value">{dashboard.cards.completedProjects}</div>
              <div className="stat-label">Completed Projects</div>
            </div>
            <div className="card stat-card">
              <div className="stat-value">{dashboard.cards.totalTasks}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
            <div className="card stat-card">
              <div className="stat-value">{dashboard.cards.completedTasks}</div>
              <div className="stat-label">Completed Tasks</div>
            </div>
            <div className="card stat-card">
              <div className="stat-value">{dashboard.cards.pendingTasks}</div>
              <div className="stat-label">Pending Tasks</div>
            </div>
            <div className="card stat-card">
              <div className="stat-value">{dashboard.cards.teamMembers}</div>
              <div className="stat-label">Team Members</div>
            </div>
          </div>

          <div className="card chart-card">
            <h3 className="section-title">Task Status Distribution</h3>
            <div className="chart-wrapper">
              <Doughnut data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
