import React, { useEffect, useState } from 'react';
import { AlertCircle, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';

const Dashboard = () => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const partsRes = await axios.get('/parts');
                setParts(partsRes.data);
            } catch (error) {
                console.error("Error cargando datos del dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando panel de control...</div>;

    // --- Cálculos y Métricas ---

    // 1. Inventario
    const totalPartsCount = parts.length;
    const lowStockParts = parts.filter(p => p.manages_stock && p.stock <= (p.min_stock ?? 5));

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Panel de Control</h1>
                <p className="text-gray-500 mt-1">Resumen general de tu taller e inventario en tiempo real.</p>
            </header>

            {/* Tarjetas de Métricas (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Total Inventario */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl">
                        <Package size={28} className="text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Repuestos Activos</h3>
                        <p className="text-2xl font-black text-gray-800">{totalPartsCount}</p>
                    </div>
                </div>

                {/* Stock Bajo */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-red-50 p-4 rounded-xl">
                        <AlertCircle size={28} className="text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Stock Bajo</h3>
                        <p className={`text-2xl font-black ${lowStockParts.length > 0 ? 'text-red-600' : 'text-gray-800'}`}>
                            {lowStockParts.length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Panel Inferior: Listas Detalladas */}
            <div className="grid grid-cols-1 gap-8">

                {/* Lista de Alertas de Stock */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-gray-100 flex items-center bg-red-50/30">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <AlertCircle className="text-red-500" /> Atención Requiere de Compra
                        </h2>
                    </div>
                    <div className="p-0 overflow-y-auto flex-1 max-h-[400px]">
                        {lowStockParts.length > 0 ? (
                            <ul className="divide-y divide-gray-100">
                                {lowStockParts.map(part => (
                                    <li key={part.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div>
                                            <p className="font-bold text-gray-800">{part.name}</p>
                                            <p className="text-xs font-mono text-gray-500">SKU: {part.code}</p>
                                        </div>
                                        <div className="text-right">
                                            {part.stock === 0 ? (
                                                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                    Agotado
                                                </span>
                                            ) : (
                                                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                    Quedan {part.stock}
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-10 text-center text-gray-400 flex flex-col items-center">
                                <Package size={48} className="mb-3 opacity-20" />
                                <p>Todo tu inventario está saludable.</p>
                            </div>
                        )}
                    </div>
                    {/* Botón Ver Inventario reubicado al pie de la tarjeta */}
                    <div className="p-6 pt-6 bg-white flex justify-end rounded-b-2xl">
                        <Link
                            to="/inventory"
                            className="text-sm bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 hover:shadow-md transition-all active:scale-95 shadow-sm"
                        >
                            Ver Inventario
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
