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
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [totals, setTotals] = useState({ labor: 0, parts: 0, total: 0 });
    const [maxRevenue, setMaxRevenue] = useState(0);

    useEffect(() => {
        fetchReport();
        // eslint-disable-next-line
    }, [year, month]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/reports/weekly-revenue?year=${year}&month=${month}`);
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

    return (
        <div className="reports-container">
            <header className="reports-header">
                <h1><BarChart3 size={32} color="#3b82f6" /> Reportes de Ingresos</h1>
                
                <div className="month-selector">
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
                        <h2>Ingresos por Semana</h2>
                        
                        {data.length === 0 ? (
                            <div className="empty-state">
                                No se encontraron ingresos registrados en este mes.
                            </div>
                        ) : (
                            <div className="bar-chart">
                                {data.map((week, index) => {
                                    const laborPct = (Number(week.total_labor) / maxRevenue) * 100;
                                    const partsPct = (Number(week.total_parts) / maxRevenue) * 100;

                                    return (
                                        <div key={index} className="bar-row">
                                            <div className="bar-label">{week.week_label}</div>
                                            <div className="bar-track">
                                                {laborPct > 0 && (
                                                    <div className="bar-fill labor" style={{ width: `${laborPct}%` }} title={`Mano de Obra: ${formatCurrency(week.total_labor)}`}>
                                                        {laborPct > 10 && 'M.O.'}
                                                    </div>
                                                )}
                                                {partsPct > 0 && (
                                                    <div className="bar-fill parts" style={{ width: `${partsPct}%` }} title={`Repuestos: ${formatCurrency(week.total_parts)}`}>
                                                        {partsPct > 10 && 'Rep.'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="bar-value">
                                                {formatCurrency(week.total_revenue)}
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
