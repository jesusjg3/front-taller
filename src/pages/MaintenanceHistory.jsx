import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, Car, Eye } from 'lucide-react';
import axios from '../api/axios';

const MaintenanceHistory = () => {
    const navigate = useNavigate();
    const [maintenances, setMaintenances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        fetchMaintenances();
    }, []);

    const fetchMaintenances = async () => {
        try {
            const response = await axios.get('/maintenances');
            setMaintenances(response.data);
        } catch (error) {
            console.error("Error fetching maintenances:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filtrado
    const filteredMaintenances = maintenances.filter(m => {
        const matchSearch =
            m.vehicle?.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.vehicle?.plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.id.toString().includes(searchTerm);

        const matchDate = filterDate ? m.fecha.startsWith(filterDate) : true;

        return matchSearch && matchDate;
    });

    return (
        <div className="p-6">
            <header className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6">
                <div className="w-full md:w-auto">
                    <h1 className="text-2xl font-bold text-gray-800 break-words md:truncate">Historial de Servicios</h1>
                    <p className="text-gray-500 text-sm md:text-base mt-1">Registro completo de mantenimientos realizados</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar cliente, placa o ID..."
                            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none w-64"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <input
                            type="date"
                            className="pl-4 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            value={filterDate}
                            onChange={e => setFilterDate(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-gray-50 text-gray-600 font-semibold text-sm">
                        <tr>
                            <th className="p-4 border-b whitespace-nowrap">#Recibo</th>
                            <th className="p-4 border-b whitespace-nowrap">Fecha</th>
                            <th className="p-4 border-b whitespace-nowrap">Cliente</th>
                            <th className="p-4 border-b whitespace-nowrap">Vehículo</th>
                            <th className="p-4 border-b min-w-[200px]">Observaciones</th>
                            <th className="p-4 border-b text-right whitespace-nowrap">Total</th>
                            <th className="p-4 border-b text-center whitespace-nowrap">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="p-8 text-center text-gray-500">Cargando historial...</td></tr>
                        ) : filteredMaintenances.length === 0 ? (
                            <tr><td colSpan="7" className="p-8 text-center text-gray-500">No se encontraron registros.</td></tr>
                        ) : (
                            filteredMaintenances.map(item => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-50 transition-colors border-b last:border-0 text-sm cursor-pointer"
                                    onClick={() => navigate(`/maintenances/${item.id}`)}
                                >
                                    <td className="p-4 font-mono font-medium text-gray-700 whitespace-nowrap">
                                        #{item.id.toString().padStart(5, '0')}
                                    </td>
                                    <td className="p-4 text-gray-600 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400" />
                                            {item.fecha ? item.fecha.substring(0, 10) : ''}
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-gray-800 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-gray-400" />
                                            {item.vehicle?.client?.name || 'Cliente Eliminado'}
                                        </div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Car size={14} className="text-gray-400" />
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-bold text-gray-700">
                                                {item.vehicle?.plate}
                                            </span>
                                            <span className="text-gray-500 text-xs">
                                                {item.vehicle?.brand} {item.vehicle?.model}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500 min-w-[200px]">
                                        <div className="max-w-xs break-words overflow-wrap-anywhere whitespace-pre-wrap" style={{ wordBreak: 'break-word' }}>
                                            {item.observaciones || 'Sin observaciones'}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right font-bold text-gray-800 whitespace-nowrap">
                                        ${item.total_cost ? parseFloat(item.total_cost).toFixed(2) : '0.00'}
                                    </td>
                                    <td className="p-4 text-center whitespace-nowrap">
                                        <Link
                                            to={`/maintenances/${item.id}`}
                                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors inline-flex"
                                            onClick={(e) => e.stopPropagation()}
                                            title="Ver Detalles"
                                        >
                                            <Eye size={18} />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MaintenanceHistory;
