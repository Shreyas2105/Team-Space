import api from "./axios.js";

const addComment = (teamId, projectId, taskId, content) => {
  return api.post(`/teams/${teamId}/projects/${projectId}/tasks/${taskId}/comments`, {
    content,
  });
};

const getComments = (teamId, projectId, taskId) => {
  return api.get(`/teams/${teamId}/projects/${projectId}/tasks/${taskId}/comments`);
};

const updateComment = (teamId, projectId, taskId, commentId, content) => {
  return api.patch(
    `/teams/${teamId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
    { content }
  );
};

const deleteComment = (teamId, projectId, taskId, commentId) => {
  return api.delete(
    `/teams/${teamId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`
  );
};

export { addComment, getComments, updateComment, deleteComment };
