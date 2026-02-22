import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import ClientList from './pages/ClientList';
import ClientDetail from './pages/ClientDetail';
import MaintenanceHistory from './pages/MaintenanceHistory';
import Inventory from './pages/Inventory';
import NewMaintenanceWizard from './pages/NewMaintenanceWizard';
import LaborList from './pages/LaborList';
import MaintenanceDetail from './pages/MaintenanceDetail';

function App() {
    return (
        <Router>
            <Routes>
                {/* Layout Principal que envuelve todo */}
                <Route path="/" element={<MainLayout />}>
                    {/* Rutas Hijas (se renderizan en el Outlet) */}
                    <Route index element={<Dashboard />} />
                    <Route path="clients" element={<ClientList />} />
                    <Route path="clients/:id" element={<ClientDetail />} />
                    <Route path="vehicles" element={<h2>Gestión de Vehículos</h2>} />
                    <Route path="maintenances" element={<MaintenanceHistory />} />
                    <Route path="maintenances/:id" element={<MaintenanceDetail />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="labors" element={<LaborList />} />
                    <Route path="new-maintenance" element={<NewMaintenanceWizard />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
