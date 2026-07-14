import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { updateProfile, changePassword } from "../api/authApi.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";
import "../styles/profile.css";

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!fullName.trim() && !username.trim()) {
      setProfileError("At least one field is required");
      return;
    }

    setIsSavingProfile(true);

    try {
      const response = await updateProfile({ fullName, username });
      setUser(response.data.data);
      setProfileSuccess("Profile updated successfully");
    } catch (submitError) {
      setProfileError(getErrorMessage(submitError));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError("");

    if (!oldPassword || !newPassword) {
      setPasswordError("Both old and new password are required");
      return;
    }

    setIsSavingPassword(true);

    try {
      await changePassword({ oldPassword, newPassword });
      setUser(null);
      navigate("/login", { state: { passwordChanged: true } });
    } catch (submitError) {
      setPasswordError(getErrorMessage(submitError));
      setIsSavingPassword(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Profile</h1>
      </div>

      <div className="profile-grid">
        <div className="card">
          <div className="profile-header">
            <div className="profile-avatar">{user?.fullName?.[0]?.toUpperCase()}</div>
            <div>
              <div className="profile-name">{user?.fullName}</div>
              <div className="profile-email">{user?.email}</div>
            </div>
          </div>

          <h3 className="section-title" style={{ marginTop: 20 }}>
            Edit Profile
          </h3>

          {profileError && <div className="form-error">{profileError}</div>}
          {profileSuccess && <div className="form-success">{profileSuccess}</div>}

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSavingProfile}>
              {isSavingProfile ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 className="section-title">Change Password</h3>

          {passwordError && <div className="form-error">{passwordError}</div>}

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="oldPassword">Current Password</label>
              <input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSavingPassword}>
              {isSavingPassword ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
