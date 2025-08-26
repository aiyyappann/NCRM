import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Toast from "./Toast";

const Layout = () => {
  const location = useLocation();
  
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 main-content">
        <Header />
        <main className="container-fluid p-4">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  );
};

export default Layout;