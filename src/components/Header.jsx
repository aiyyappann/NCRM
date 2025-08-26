import { useLocation } from "react-router-dom";
import { useAppContext } from "../App";

const Header = () => {
  const location = useLocation();
  const { mockMode } = useAppContext();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "Dashboard";
    if (path.startsWith("/customers")) return "Customers";
    if (path.startsWith("/segments")) return "Segments";
    if (path.startsWith("/interactions")) return "Interactions";
    if (path.startsWith("/support")) return "Support";
    if (path.startsWith("/reports")) return "Reports";
    if (path.startsWith("/settings")) return "Settings";
    return "Page";
  };

  return (
    <header className="bg-white border-bottom p-3">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h2 className="h4 mb-0">{getPageTitle()}</h2>
          <small className="text-muted">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </small>
        </div>
        <div className="d-flex align-items-center">
          {mockMode && (
            <span className="badge bg-warning text-dark me-3">
              Mock Mode
            </span>
          )}
          <div className="dropdown">
            <button 
              className="btn btn-outline-secondary dropdown-toggle" 
              type="button" 
              data-bs-toggle="dropdown"
            >
              👤 Admin
            </button>
            <ul className="dropdown-menu">
              <li><a className="dropdown-item" href="#profile">Profile</a></li>
              <li><a className="dropdown-item" href="#preferences">Preferences</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li><a className="dropdown-item" href="#logout">Logout</a></li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;