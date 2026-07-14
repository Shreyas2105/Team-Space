import api from "./axios.js";

const createProject = (teamId, { title, description, startDate, dueDate }) => {
  return api.post(`/teams/${teamId}/projects`, { title, description, startDate, dueDate });
};

const getProjects = (teamId) => {
  return api.get(`/teams/${teamId}/projects`);
};

const getProjectById = (teamId, projectId) => {
  return api.get(`/teams/${teamId}/projects/${projectId}`);
};

const updateProject = (teamId, projectId, updates) => {
  return api.patch(`/teams/${teamId}/projects/${projectId}`, updates);
};

const completeProject = (teamId, projectId) => {
  return api.patch(`/teams/${teamId}/projects/${projectId}/complete`);
};

const deleteProject = (teamId, projectId) => {
  return api.delete(`/teams/${teamId}/projects/${projectId}`);
};

export {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  completeProject,
  deleteProject,
};
