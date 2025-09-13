import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Sidebar = () => {
  const { isAdmin } = useAuth();
  
  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/customers", label: "Customers", icon: "👥" },
    { path: "/segments", label: "Segments", icon: "🎯" },
    { path: "/interactions", label: "Interactions", icon: "💬" },
    { path: "/support", label: "Support", icon: "🎧" },
    { path: "/reports", label: "Reports", icon: "📈" },
    { path: "/settings", label: "Settings", icon: "⚙️" }
  ];

  const adminItems = [
    { path: "/admin", label: "Admin Panel", icon: "🔧" }
  ];

  return (
    <div className="sidebar" style={{ width: "250px" }}>
      <div className="p-3">
        <h4 className="navbar-brand text-primary mb-4">
          🥜 NutMeg CRM
        </h4>
        <nav className="nav flex-column">
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
              }
            >
              <span className="me-2">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          
          {isAdmin() && (
            <>
              <hr className="my-3" />
              <div className="text-muted small mb-2 px-3">Admin</div>
              {adminItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="me-2">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;