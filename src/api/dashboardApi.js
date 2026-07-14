import api from "./axios.js";

const getTeamDashboard = (teamId) => {
  return api.get(`/teams/${teamId}/dashboard`);
};

export { getTeamDashboard };
