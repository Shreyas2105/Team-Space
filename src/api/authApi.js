import api from "./axios.js";

const login = (identifier, password) => {
  const isEmail = identifier.includes("@");

  const body = isEmail
    ? { email: identifier, password }
    : { username: identifier, password };

  return api.post("/users/login", body);
};

const register = ({ fullName, username, email, password }) => {
  return api.post("/users/register", { fullName, username, email, password });
};

const logout = () => {
  return api.post("/users/logout");
};

const getCurrentUser = () => {
  return api.get("/users/current-user");
};

const updateProfile = ({ fullName, username }) => {
  return api.patch("/users/profile", { fullName, username });
};

const changePassword = ({ oldPassword, newPassword }) => {
  return api.patch("/users/change-password", { oldPassword, newPassword });
};

export { login, register, logout, getCurrentUser, updateProfile, changePassword };
