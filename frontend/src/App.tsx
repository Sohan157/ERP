import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Challans from "./pages/Challans";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Protected Application */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Customers */}
            <Route path="/customers" element={<Customers />} />

            {/* Products */}
            <Route path="/products" element={<Products />} />

            {/* Inventory */}
            <Route path="/inventory" element={<Inventory />} />

            {/* Sales Challans */}
            <Route path="/challans" element={<Challans />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}