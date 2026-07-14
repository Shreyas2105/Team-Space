import { Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const Header = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="app-header">
      <button type="button" className="menu-toggle" onClick={onToggleSidebar}>
        <Menu size={20} />
      </button>

      <div className="header-user">{user?.fullName}</div>
    </header>
  );
};

export default Header;
