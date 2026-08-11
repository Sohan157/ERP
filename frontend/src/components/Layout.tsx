import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Package, Warehouse, FileText, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const items = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"] },
    { to: "/customers", label: "Customers", icon: Users, roles: ["ADMIN", "SALES", "ACCOUNTS"] },
    { to: "/products", label: "Products", icon: Package, roles: ["ADMIN", "WAREHOUSE", "SALES", "ACCOUNTS"] },
    { to: "/inventory", label: "Inventory", icon: Warehouse, roles: ["ADMIN", "WAREHOUSE", "SALES", "ACCOUNTS"] },
    { to: "/challans", label: "Challans", icon: FileText, roles: ["ADMIN", "SALES", "ACCOUNTS"] }
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Mini ERP <span>CRM</span></div>
        <nav>
          {items.filter(i => i.roles.includes(user?.role || "")).map(item => {
            const Icon = item.icon;
            return (
              <Link className={location.pathname === item.to ? "nav active" : "nav"} to={item.to} key={item.to}>
                <Icon size={18} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <button className="logout" onClick={logout}><LogOut size={18}/> Logout</button>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <h1>Operations Portal</h1>
            <small>Wholesale & distribution ERP/CRM</small>
          </div>
          <div className="user-pill">{user?.name} · {user?.role}</div>
        </header>
        <section className="content"><Outlet /></section>
      </main>
    </div>
  );
}
