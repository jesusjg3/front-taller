import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { ArrowLeft, Car, User, Wrench, Package, FileText } from 'lucide-react';

const MaintenanceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [maintenance, setMaintenance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMaintenance = async () => {
            try {
                const response = await axios.get(`/maintenances/${id}`);
                setMaintenance(response.data);
            } catch (error) {
                console.error("Error fetching maintenance details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchMaintenance();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando detalles del servicio...</div>;
    if (!maintenance) return <div className="p-8 text-center text-red-500">Mantenimiento no encontrado.</div>;

    const { vehicle, parts, labors, total_cost, created_at, observaciones } = maintenance;
    const client = vehicle?.client;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">

            {/* HEADER */}
            <header className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors bg-gray-50 flex-shrink-0"
                    >
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <span className="bg-orange-100 p-2 rounded-lg">
                                <FileText className="text-orange-600" size={24} />
                            </span>
                            Servicio #{id}
                        </h1>

                        <p className="text-gray-500 text-sm mt-1">
                            Emitido el {new Date(created_at).toLocaleDateString()} a las {new Date(created_at).toLocaleTimeString()}
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                        Total Facturado
                    </p>
                    <p className="text-2xl font-black text-gray-800">
                        ${parseFloat(total_cost || 0).toFixed(2)}
                    </p>
                </div>
            </header>

            {/* CLIENTE + VEHICULO */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row overflow-hidden">

                {/* CLIENTE */}
                <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-gray-100 flex gap-4 items-start">
                    <User size={24} className="text-orange-600 flex-shrink-0" />
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                            Datos del Cliente
                        </h3>

                        {client ? (
                            <div className="space-y-2">
                                <p className="text-lg font-bold text-gray-800">{client.name}</p>
                                <p className="text-sm text-gray-600"><span className="text-gray-400 font-medium">CI/RUC:</span> {client.ci || 'N/A'}</p>
                                <p className="text-sm text-gray-600"><span className="text-gray-400 font-medium">Tel:</span> {client.phone || 'N/A'}</p>
                            </div>
                        ) : (
                            <p className="text-red-400 italic">Cliente no disponible</p>
                        )}
                    </div>
                </div>

                {/* VEHICULO */}
                <div className="flex-1 p-6 flex gap-4 items-start">
                    <Car size={24} className="text-orange-600 flex-shrink-0" />
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                            Datos del Vehículo
                        </h3>

                        {vehicle ? (
                            <div className="space-y-2">
                                <p className="text-lg font-bold text-gray-800">
                                    {vehicle.brand} {vehicle.model} ({vehicle.year})
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="text-gray-400 font-medium">Placa:</span> {vehicle.plate}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="text-gray-400 font-medium">Kilometraje:</span> {maintenance.kilometraje || vehicle.kilometraje} km
                                </p>
                                {maintenance.prox_kilometraje && (
                                    <p className="text-sm text-gray-600">
                                        <span className="text-gray-400 font-medium">Próx. Servicio:</span> <span className="text-orange-600 font-bold">{maintenance.prox_kilometraje} km</span>
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-red-400 italic">Vehículo no disponible</p>
                        )}
                    </div>
                </div>
            </div>

            {/* OBSERVACIONES */}
            {observaciones && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start">
                    <FileText size={24} className="text-orange-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-wider mb-2">
                            Observaciones / Notas
                        </h3>
                        <p className="text-yellow-900 whitespace-pre-wrap break-words" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                            {observaciones}
                        </p>
                    </div>
                </div>
            )}

            {/* REPUESTOS */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-orange-50 px-3 py-4 border-b border-orange-100 flex justify-between items-center">
                    <h3 className="font-bold text-orange-900 flex items-center gap-2 text-lg">
                        <Package size={20} className="text-orange-600" />
                        Repuestos Utilizados
                    </h3>
                    <span className="text-gray-500 text-sm">{parts?.length || 0} items</span>
                </div>

                <div className="p-6 overflow-x-auto">
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-gray-100">
                            {parts.map(part => (
                                <tr key={part.id}>
                                    <td className="py-4">
                                        <p className="font-bold text-gray-800">{part.name}</p>
                                        <p className="text-xs text-gray-400">SKU: {part.code}</p>
                                    </td>
                                    <td className="text-center">${part.pivot.quantity}</td>
                                    <td className="text-right">${part.pivot.price_at_time}</td>
                                    <td className="text-right font-bold">
                                        ${(part.pivot.quantity * part.pivot.price_at_time).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MANO DE OBRA */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-blue-50 px-3 py-2 border-b border-blue-100 flex justify-between items-center">
                    <h3 className="font-bold text-blue-900 flex items-center gap-2 text-lg">
                        <Wrench size={20} className="text-orange-600" />
                        Servicios / Mano de Obra
                    </h3>
                    <span className="text-gray-500 text-sm">{labors?.length || 0} items</span>
                </div>

                <div className="p-6">
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-gray-100">
                            {labors.map(labor => (
                                <tr key={labor.id} className="hover:bg-gray-50/50 transition">
                                    <td className="py-5 pr-4 align-top">
                                        <p className="font-semibold text-gray-800">{labor.name}</p>
                                        {labor.description && (
                                            <p className="text-sm text-gray-400 mt-1">
                                                {labor.description}
                                            </p>
                                        )}
                                    </td>
                                    <td className="py-5 pl-4 text-right font-bold text-gray-800 align-top">
                                        ${parseFloat(labor.pivot.cost_at_time).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default MaintenanceDetail;