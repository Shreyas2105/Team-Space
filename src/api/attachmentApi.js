import api from "./axios.js";

const getProjectAttachments = (teamId, projectId) => {
  return api.get(`/teams/${teamId}/projects/${projectId}/attachments`);
};

const uploadProjectAttachment = (teamId, projectId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post(`/teams/${teamId}/projects/${projectId}/attachments`, formData);
};

const deleteProjectAttachment = (teamId, projectId, attachmentId) => {
  return api.delete(`/teams/${teamId}/projects/${projectId}/attachments/${attachmentId}`);
};

const getTaskAttachments = (teamId, projectId, taskId) => {
  return api.get(`/teams/${teamId}/projects/${projectId}/tasks/${taskId}/attachments`);
};

const uploadTaskAttachment = (teamId, projectId, taskId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post(
    `/teams/${teamId}/projects/${projectId}/tasks/${taskId}/attachments`,
    formData
  );
};

const deleteTaskAttachment = (teamId, projectId, taskId, attachmentId) => {
  return api.delete(
    `/teams/${teamId}/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`
  );
};

export {
  getProjectAttachments,
  uploadProjectAttachment,
  deleteProjectAttachment,
  getTaskAttachments,
  uploadTaskAttachment,
  deleteTaskAttachment,
};
