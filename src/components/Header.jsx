import { useLocation, Link } from "react-router-dom";
import { useAppContext } from "../App";
import { useAuth } from "../hooks/useAuth";

const Header = () => {
  const location = useLocation();
  const { mockMode } = useAppContext();
  const { user, signOut, isAdmin } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "Dashboard";
    if (path.startsWith("/customers")) return "Customers";
    if (path.startsWith("/segments")) return "Segments";
    if (path.startsWith("/interactions")) return "Interactions";
    if (path.startsWith("/support")) return "Support";
    if (path.startsWith("/reports")) return "Reports";
    if (path.startsWith("/settings")) return "Settings";
    if (path.startsWith("/admin")) return "Admin Panel";
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
          
          <div className="dropdown me-3">
            <button 
              className="btn btn-outline-primary btn-sm dropdown-toggle" 
              type="button" 
              data-bs-toggle="dropdown"
            >
              Quick Actions
            </button>
            <ul className="dropdown-menu">
              <li><Link className="dropdown-item" to="/customers/new">Add Customer</Link></li>
              <li><Link className="dropdown-item" to="/interactions">Log Interaction</Link></li>
              <li><Link className="dropdown-item" to="/support">Create Ticket</Link></li>
              <li><hr className="dropdown-divider" /></li>
              <li><Link className="dropdown-item" to="/reports">View Reports</Link></li>
            </ul>
          </div>
          
          <div className="dropdown">
            <button 
              className="btn btn-outline-secondary dropdown-toggle" 
              type="button" 
              data-bs-toggle="dropdown"
            >
              👤 {user?.email?.split('@')[0] || 'User'}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><Link className="dropdown-item" to="/settings">Settings</Link></li>
              {isAdmin() && (
                <>
                  <li><hr className="dropdown-divider" /></li>
                  <li><Link className="dropdown-item" to="/admin">🔧 Admin Panel</Link></li>
                </>
              )}
              <li><hr className="dropdown-divider" /></li>
              <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;