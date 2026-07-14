import api from "./axios.js";

const getTeamActivity = (teamId, page = 1) => {
  return api.get(`/teams/${teamId}/activity`, { params: { page, limit: 20 } });
};

export { getTeamActivity };
