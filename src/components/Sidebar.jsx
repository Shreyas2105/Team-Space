import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, User, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const Sidebar = ({ isOpen }) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-logo">TeamSpace</div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/teams"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <Users size={18} />
          <span>Teams</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <User size={18} />
          <span>Profile</span>
        </NavLink>
      </nav>

      <button type="button" className="sidebar-logout" onClick={handleLogout}>
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;
