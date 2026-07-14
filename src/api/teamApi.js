import api from "./axios.js";

const createTeam = ({ name, description }) => {
  return api.post("/teams", { name, description });
};

const getMyTeams = () => {
  return api.get("/teams");
};

const getTeamById = (teamId) => {
  return api.get(`/teams/${teamId}`);
};

const joinTeam = (inviteCode) => {
  return api.post("/teams/join", { inviteCode });
};

const getTeamMembers = (teamId) => {
  return api.get(`/teams/${teamId}/members`);
};

const leaveTeam = (teamId) => {
  return api.post(`/teams/${teamId}/leave`);
};

const promoteMember = (teamId, memberId) => {
  return api.patch(`/teams/${teamId}/members/${memberId}/promote`);
};

const demoteMember = (teamId, memberId) => {
  return api.patch(`/teams/${teamId}/members/${memberId}/demote`);
};

const removeMember = (teamId, memberId) => {
  return api.delete(`/teams/${teamId}/members/${memberId}`);
};

export {
  createTeam,
  getMyTeams,
  getTeamById,
  joinTeam,
  getTeamMembers,
  leaveTeam,
  promoteMember,
  demoteMember,
  removeMember,
};
