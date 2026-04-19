import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { BarChart3, TrendingUp, Wrench, Settings, Search, Loader } from 'lucide-react';
import '../styles/Reports.css';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
};

const Reports = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [viewMode, setViewMode] = useState('weekly');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');

    const [totals, setTotals] = useState({ labor: 0, parts: 0, total: 0 });
    const [maxRevenue, setMaxRevenue] = useState(0);

    useEffect(() => {
        if (isAuthenticated) {
            fetchReport();
        }
        // eslint-disable-next-line
    }, [year, month, viewMode, isAuthenticated]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/reports/revenue?year=${year}&month=${month}&mode=${viewMode}`);
            const reportData = response.data.data;
            setData(reportData);

            // Calculate totals and max value for chart scaling
            let tLabor = 0;
            let tParts = 0;
            let mRev = 0;

            reportData.forEach(week => {
                tLabor += Number(week.total_labor);
                tParts += Number(week.total_parts);
                if (Number(week.total_revenue) > mRev) {
                    mRev = Number(week.total_revenue);
                }
            });

            setTotals({
                labor: tLabor,
                parts: tParts,
                total: tLabor + tParts
            });
            setMaxRevenue(mRev > 0 ? mRev : 1); // Avoid division by zero

        } catch (error) {
            console.error("Error fetching report:", error);
            // Optionally add toast notification here
        } finally {
            setLoading(false);
        }
    };

    const months = [
        { value: 1, label: 'Enero' },
        { value: 2, label: 'Febrero' },
        { value: 3, label: 'Marzo' },
        { value: 4, label: 'Abril' },
        { value: 5, label: 'Mayo' },
        { value: 6, label: 'Junio' },
        { value: 7, label: 'Julio' },
        { value: 8, label: 'Agosto' },
        { value: 9, label: 'Septiembre' },
        { value: 10, label: 'Octubre' },
        { value: 11, label: 'Noviembre' },
        { value: 12, label: 'Diciembre' },
    ];

    const handleLogin = (e) => {
        e.preventDefault();
        // Use environment variable for better security, fallback to simple password if missing
        const validPassword = process.env.REACT_APP_REPORTS_PASSWORD;
        if (password === validPassword) {
            setIsAuthenticated(true);
        } else {
            alert('Contraseña incorrecta');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="reports-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                        <BarChart3 size={48} color="#3b82f6" />
                    </div>
                    <h2 style={{ textAlign: 'center', margin: 0, paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>Acceso a Reportes</h2>
                    <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>Ingrese la contraseña de administrador para ver esta sección.</p>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}
                        autoFocus
                    />
                    <button type="submit" className="primary-btn" style={{ padding: '0.75rem', fontSize: '1rem' }}>Ingresar</button>
                </form>
            </div>
        );
    }

    return (
        <div className="reports-container">
            <header className="reports-header">
                <h1><BarChart3 size={32} color="#3b82f6" /> Reportes de Ingresos</h1>

                <div className="month-selector">
                    <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                        <option value="weekly">Semanal</option>
                        <option value="daily">Diario</option>
                    </select>
                    <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                        {months.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        min="2020"
                        step="1"
                    />
                    <button className="primary-btn" onClick={fetchReport} style={{ padding: '0.5rem', display: 'flex' }}>
                        <Search size={20} />
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="loading-state">
                    <Loader size={48} className="animate-spin" color="#3b82f6" />
                    <p>Calculando ingresos del mes...</p>
                </div>
            ) : (
                <>
                    <div className="summary-cards">
                        <div className="summary-card">
                            <h3><TrendingUp size={18} /> Total Ingresos</h3>
                            <p className="amount">{formatCurrency(totals.total)}</p>
                        </div>
                        <div className="summary-card labor">
                            <h3><Settings size={18} /> Mano de Obra</h3>
                            <p className="amount">{formatCurrency(totals.labor)}</p>
                        </div>
                        <div className="summary-card parts">
                            <h3><Wrench size={18} /> Repuestos</h3>
                            <p className="amount">{formatCurrency(totals.parts)}</p>
                        </div>
                    </div>

                    <div className="chart-section">
                        <h2>Ingresos por {viewMode === 'weekly' ? 'Semana' : 'Día'}</h2>

                        {data.length === 0 ? (
                            <div className="empty-state">
                                No se encontraron ingresos registrados en este mes.
                            </div>
                        ) : (
                            <div className="bar-chart">
                                {data.map((item, index) => {
                                    const laborPct = (Number(item.total_labor) / maxRevenue) * 100;
                                    const partsPct = (Number(item.total_parts) / maxRevenue) * 100;

                                    return (
                                        <div key={index} className="bar-row">
                                            <div className="bar-label" style={{ fontSize: viewMode === 'daily' ? '0.85rem' : '1rem' }}>{item.label}</div>
                                            <div className="bar-track">
                                                {laborPct > 0 && (
                                                    <div className="bar-fill labor" style={{ width: `${laborPct}%` }} title={`Mano de Obra: ${formatCurrency(item.total_labor)}`}>
                                                        {laborPct > 10 && 'M.O.'}
                                                    </div>
                                                )}
                                                {partsPct > 0 && (
                                                    <div className="bar-fill parts" style={{ width: `${partsPct}%` }} title={`Repuestos: ${formatCurrency(item.total_parts)}`}>
                                                        {partsPct > 10 && 'Rep.'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="bar-value">
                                                {formatCurrency(item.total_revenue)}
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="legend">
                                    <div className="legend-item">
                                        <div className="legend-color labor"></div>
                                        <span>Mano de Obra</span>
                                    </div>
                                    <div className="legend-item">
                                        <div className="legend-color parts"></div>
                                        <span>Repuestos</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Reports;
