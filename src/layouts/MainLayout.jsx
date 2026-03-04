import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Users, Wrench, FileText, PlusCircle, Menu, X, BarChart3 } from 'lucide-react';
import '../styles/Layout.css';

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="dashboard-layout">

            {/* Overlay para cerrar sidebar en movil */}
            <div
                className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''} print:hidden`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>

            {/* Sidebar Lateral */}
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''} print:hidden`}>

                {/* Botón de Cierre (Solo en Móvil) */}
                <button
                    onClick={toggleSidebar}
                    className="mobile-close-btn"
                >
                    <X size={24} />
                </button>

                <div className="sidebar-header">
                    <h2>Taller MG 🔧</h2>
                </div>

                {/* Botón de Acción Principal */}
                <NavLink
                    to="/new-maintenance"
                    className="new-maintenance-btn"
                    onClick={() => setIsSidebarOpen(false)}
                >
                    <PlusCircle size={20} />
                    Nuevo Servicio
                </NavLink>

                {/* Menú de Navegación */}
                <nav className="sidebar-nav">
                    <NavLink
                        to="/"
                        className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                        end
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <Home size={20} />
                        Inicio
                    </NavLink>

                    <NavLink
                        to="/clients"
                        className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <Users size={20} />
                        Clientes
                    </NavLink>

                    <NavLink
                        to="/maintenances"
                        className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <FileText size={20} />
                        Historial
                    </NavLink>

                    <NavLink
                        to="/inventory"
                        className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <Wrench size={20} />
                        Inventario
                    </NavLink>

                    <NavLink
                        to="/labors"
                        className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <Wrench size={20} />
                        Servicios
                    </NavLink>

                    <NavLink
                        to="/reports"
                        className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <BarChart3 size={20} />
                        Reportes
                    </NavLink>
                </nav>

                <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
                    v1.0.0
                </div>
            </aside>

            {/* Contenido Dinámico de la Página */}
            <main className="main-content">

                {/* Header Móvil (Solo visible en pantallas pequeñas) */}
                <div className="mobile-header print:hidden">
                    <h1>Taller <span>MG</span></h1>
                    <button onClick={toggleSidebar} className="hamburger-btn">
                        <Menu size={24} />
                    </button>
                </div>

                <div className="main-content-inner">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
