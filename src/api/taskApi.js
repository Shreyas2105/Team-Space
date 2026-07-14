import api from "./axios.js";

const createTask = (teamId, projectId, { title, description, priority, dueDate, assignedTo }) => {
  return api.post(`/teams/${teamId}/projects/${projectId}/tasks`, {
    title,
    description,
    priority,
    dueDate,
    assignedTo,
  });
};

const getTasks = (teamId, projectId) => {
  return api.get(`/teams/${teamId}/projects/${projectId}/tasks`);
};

const getTaskById = (teamId, projectId, taskId) => {
  return api.get(`/teams/${teamId}/projects/${projectId}/tasks/${taskId}`);
};

const updateTask = (teamId, projectId, taskId, updates) => {
  return api.patch(`/teams/${teamId}/projects/${projectId}/tasks/${taskId}`, updates);
};

const assignTask = (teamId, projectId, taskId, assignedTo) => {
  return api.patch(`/teams/${teamId}/projects/${projectId}/tasks/${taskId}/assign`, {
    assignedTo,
  });
};

const changeTaskStatus = (teamId, projectId, taskId, status) => {
  return api.patch(`/teams/${teamId}/projects/${projectId}/tasks/${taskId}/status`, {
    status,
  });
};

const deleteTask = (teamId, projectId, taskId) => {
  return api.delete(`/teams/${teamId}/projects/${projectId}/tasks/${taskId}`);
};

export {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  assignTask,
  changeTaskStatus,
  deleteTask,
};
