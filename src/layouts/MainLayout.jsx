import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Users, Wrench, FileText, PlusCircle } from 'lucide-react';
import '../styles/Layout.css';

const MainLayout = () => {
    return (
        <div className="dashboard-layout">
            {/* Sidebar Lateral */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>Taller MG 🔧</h2>
                </div>

                {/* Botón de Acción Principal */}
                <NavLink to="/new-maintenance" className="new-maintenance-btn">
                    <PlusCircle size={20} />
                    Nuevo Servicio
                </NavLink>

                {/* Menú de Navegación */}
                <nav className="sidebar-nav">
                    <NavLink
                        to="/"
                        className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                        end
                    >
                        <Home size={20} />
                        Inicio
                    </NavLink>

                    <NavLink
                        to="/clients"
                        className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                    >
                        <Users size={20} />
                        Clientes
                    </NavLink>



                    <NavLink
                        to="/maintenances"
                        className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                    >
                        <FileText size={20} />
                        Historial
                    </NavLink>

                    <NavLink
                        to="/inventory"
                        className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                    >
                        <Wrench size={20} />
                        Inventario
                    </NavLink>

                    <NavLink
                        to="/labors"
                        className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                    >
                        <Wrench size={20} /> {/* Reusing Wrench for now, could be Hammer */}
                        Servicios
                    </NavLink>
                </nav>

                <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
                    v1.0.0
                </div>
            </aside>

            {/* Contenido Dinámico de la Página */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
