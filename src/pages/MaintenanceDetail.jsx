import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { ArrowLeft, Car, User, Calendar, Wrench, Package, FileText } from 'lucide-react';

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

        if (id) {
            fetchMaintenance();
        }
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando detalles del servicio...</div>;
    if (!maintenance) return <div className="p-8 text-center text-red-500">Mantenimiento no encontrado.</div>;

    const { vehicle, parts, labors, total_cost, created_at, kilemetraje, observaciones } = maintenance;
    const client = vehicle?.client;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <header className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="text-orange-600" />
                        Detalle de Servicio #{id}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Registrado el {new Date(created_at).toLocaleDateString()} a las {new Date(created_at).toLocaleTimeString()}
                    </p>
                </div>
                <div className="ml-auto bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                    <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Total Facturado</p>
                    <p className="text-2xl font-bold text-green-700">
                        ${parseFloat(total_cost || 0).toFixed(2)}
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Info Cliente */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <User size={18} className="text-blue-500" /> Cliente
                    </h3>
                    {client ? (
                        <>
                            <p className="text-lg font-medium">{client.name}</p>
                            <p className="text-gray-500 text-sm">{client.phone || 'Sin teléfono'}</p>
                            <p className="text-gray-500 text-sm">{client.ci || 'Sin CI'}</p>
                        </>
                    ) : (
                        <p className="text-red-400 italic">Cliente no disponible</p>
                    )}
                </div>

                {/* Info Vehículo */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Car size={18} className="text-orange-500" /> Vehículo
                    </h3>
                    {vehicle ? (
                        <>
                            <p className="text-lg font-medium">{vehicle.brand} {vehicle.model}</p>
                            <p className="text-gray-500 text-sm font-mono bg-gray-100 inline-block px-2 rounded mb-2">{vehicle.plate}</p>
                            <p className="text-gray-600 text-sm flex items-center gap-1">
                                <Calendar size={14} /> Año {vehicle.year}
                            </p>
                            <p className="text-gray-600 text-sm flex items-center gap-1">
                                <Wrench size={14} /> {maintenance.kilometraje || vehicle.kilometraje} km
                            </p>
                        </>
                    ) : (
                        <p className="text-red-400 italic">Vehículo no disponible</p>
                    )}
                </div>

                {/* Observaciones */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-gray-500" /> Observaciones
                    </h3>
                    <p className="text-gray-600 text-sm italic">
                        "{observaciones || 'Sin observaciones registradas para este servicio.'}"
                    </p>
                </div>
            </div>

            {/* Detalles: Repuestos y Mano de Obra */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Repuestos */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex justify-between items-center">
                        <h3 className="font-bold text-orange-800 flex items-center gap-2">
                            <Package size={18} /> Repuestos Utilizados
                        </h3>
                        <span className="text-orange-600 font-bold bg-white px-2 py-1 rounded text-sm">
                            {parts?.length || 0} items
                        </span>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="p-4">Descripción</th>
                                <th className="p-4 text-center">Cant.</th>
                                <th className="p-4 text-right">P. Unit</th>
                                <th className="p-4 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {parts && parts.length > 0 ? (
                                parts.map(part => (
                                    <tr key={part.id}>
                                        <td className="p-4">
                                            <p className="font-medium text-gray-800">{part.name}</p>
                                            <p className="text-xs text-gray-400">{part.code}</p>
                                        </td>
                                        <td className="p-4 text-center">{part.pivot.quantity}</td>
                                        <td className="p-4 text-right">${parseFloat(part.pivot.price_at_time).toFixed(2)}</td>
                                        <td className="p-4 text-right font-medium">
                                            ${(part.pivot.quantity * part.pivot.price_at_time).toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-400 italic">No se usaron repuestos.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mano de Obra */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                        <h3 className="font-bold text-blue-800 flex items-center gap-2">
                            <Wrench size={18} /> Servicios / Mano de Obra
                        </h3>
                        <span className="text-blue-600 font-bold bg-white px-2 py-1 rounded text-sm">
                            {labors?.length || 0} items
                        </span>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="p-4">Servicio</th>
                                <th className="p-4 text-right">Costo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {labors && labors.length > 0 ? (
                                labors.map(labor => (
                                    <tr key={labor.id}>
                                        <td className="p-4">
                                            <p className="font-medium text-gray-800">{labor.name}</p>
                                            <p className="text-xs text-gray-400">{labor.description || 'Sin descripción'}</p>
                                        </td>
                                        <td className="p-4 text-right font-medium text-gray-800">
                                            ${parseFloat(labor.pivot.cost_at_time).toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2" className="p-8 text-center text-gray-400 italic">No se registró mano de obra.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default MaintenanceDetail;
