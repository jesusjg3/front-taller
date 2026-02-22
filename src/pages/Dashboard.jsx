import React, { useEffect, useState } from 'react';
import { AlertCircle, Package } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
    // Estado para los datos (mockeado por ahora, luego conectaremos API)
    const [stats, setStats] = useState({
        totalParts: 0,
        lowStock: 0,
        outOfStock: 0
    });

    // Simulamos carga de datos al montar (luego reemplazaremos con axios.get('/api/v1/parts'))
    useEffect(() => {
        // Aquí iría la lógica real. Por ahora dejamos valores en 0.
    }, []);

    return (
        <div>
            <h1 style={{ marginBottom: '1rem', color: '#2b2828' }}>Panel de Inventario</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>Resumen del estado actual de repuestos.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

                {/* Tarjeta 1: Total de Repuestos */}
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    borderLeft: '5px solid #2b2828'
                }}>
                    <div style={{ background: '#f4f4f4', padding: '12px', borderRadius: '50%' }}>
                        <Package size={32} color="#2b2828" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '0.9rem', color: '#888', marginBottom: '4px' }}>Total Repuestos</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2b2828' }}>{stats.totalParts}</p>
                    </div>
                </div>

                {/* Tarjeta 2: Stock Crítico */}
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    borderLeft: '5px solid #e74c3c'
                }}>
                    <div style={{ background: '#fadbd8', padding: '12px', borderRadius: '50%' }}>
                        <AlertCircle size={32} color="#e74c3c" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '0.9rem', color: '#888', marginBottom: '4px' }}>Stock Bajo/Agotado</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c' }}>{stats.lowStock}</p>
                    </div>
                </div>

            </div>

            {/* Aquí podríamos poner una tabla simple de "Últimos Movimientos" más adelante */}
        </div>
    );
};

export default Dashboard;
