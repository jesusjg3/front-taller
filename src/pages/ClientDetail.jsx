import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, UserCheck, Car, Calendar, Wrench, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import axios from '../api/axios';

const ClientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClient = async () => {
            try {
                const response = await axios.get(`/clients/${id}`);
                setClient(response.data);
            } catch (err) {
                console.error("Error fetching client details:", err);
                setError("No se pudo cargar la información del cliente.");
            } finally {
                setLoading(false);
            }
        };

        fetchClient();
    }, [id]);

    const [isEditing, setIsEditing] = useState(false);
    const [isSavingClient, setIsSavingClient] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        phone: '',
        ci: ''
    });

    const handleEditClick = () => {
        setEditForm({
            name: client.name || '',
            phone: client.phone || '',
            ci: client.ci || ''
        });
        setIsEditing(true);
    };

    const handleSaveClient = async (e) => {
        e.preventDefault();
        setIsSavingClient(true);
        try {
            await axios.put(`/clients/${id}`, editForm);
            setClient({ ...client, ...editForm });
            setIsEditing(false);
            alert("Cliente actualizado correctamente.");
        } catch (error) {
            console.error("Error updating client:", error);
            let msg = "Error al actualizar el cliente.";
            if (error.response?.data?.errors) {
                msg = Object.values(error.response.data.errors).flat().join('\n');
            } else if (error.response?.data?.message) {
                msg = error.response.data.message;
            }
            alert(msg);
        } finally {
            setIsSavingClient(false);
        }
    };

    const [isEditingVehicle, setIsEditingVehicle] = useState(false);
    const [isSavingVehicle, setIsSavingVehicle] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [vehicleForm, setVehicleForm] = useState({
        brand: '',
        model: '',
        year: '',
        plate: '',
        kilometraje: ''
    });

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando detalles del cliente...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!client) return <div className="p-8 text-center text-gray-500">Cliente no encontrado.</div>;

    const handleEditVehicleClick = (vehicle) => {
        setSelectedVehicle(vehicle);
        setVehicleForm({
            brand: vehicle.brand || '',
            model: vehicle.model || '',
            year: vehicle.year || '',
            plate: vehicle.plate || '',
            kilometraje: vehicle.kilometraje || ''
        });
        setIsEditingVehicle(true);
    };

    const handleSaveVehicle = async (e) => {
        e.preventDefault();
        setIsSavingVehicle(true);
        try {
            await axios.put(`/vehicles/${selectedVehicle.id}`, { ...vehicleForm, client_id: client.id });
            const updatedVehicles = client.vehicles.map(v => v.id === selectedVehicle.id ? { ...v, ...vehicleForm } : v);
            setClient({ ...client, vehicles: updatedVehicles });
            setIsEditingVehicle(false);
            alert("Vehículo actualizado correctamente.");
        } catch (error) {
            console.error("Error updating vehicle:", error);
            let msg = "Error al actualizar el vehículo.";
            if (error.response?.data?.errors) {
                msg = Object.values(error.response.data.errors).flat().join('\n');
            } else if (error.response?.data?.message) {
                msg = error.response.data.message;
            }
            alert(msg);
        } finally {
            setIsSavingVehicle(false);
        }
    };

    const handleDeleteVehicle = async (vehicleId) => {
        if (!window.confirm("¿Seguro que desea eliminar este vehículo? Los registros de mantenimiento se preservarán.")) return;
        try {
            await axios.delete(`/vehicles/${vehicleId}`);
            const updatedClientVehicles = client.vehicles.map(v => v.id === vehicleId ? { ...v, deleted_at: new Date().toISOString() } : v);
            setClient({ ...client, vehicles: updatedClientVehicles });
        } catch (error) {
            console.error("Error deleting vehicle:", error);
            let msg = "Error al eliminar el vehículo.";
            if (error.response?.data?.errors) {
                msg = Object.values(error.response.data.errors).flat().join('\n');
            } else if (error.response?.data?.message) {
                msg = error.response.data.message;
            }
            alert(msg);
        }
    };

    const allMaintenances = client.vehicles ? client.vehicles.flatMap(v =>
        v.maintenances ? v.maintenances.map(m => ({
            ...m,
            vehicle_plate: v.plate,
            vehicle_model: `${v.brand} ${v.model}`,
            vehicle_id: v.id
        })) : []
    ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : [];

    // For the main display, we can show the first vehicle or a list.
    // Let's stick to the current design but iterate if multiple vehicles exist.
    // We filter out soft-deleted vehicles from the active display list.
    const vehicles = client.vehicles ? client.vehicles.filter(v => !v.deleted_at) : [];

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }} className="relative">
            {/* Header: Volver y Título */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex' }}
                    className="hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft size={24} color="#666" />
                </button>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2b2828' }}>Detalles del Cliente</h1>
            </div>

            {/* Tarjeta Principal: Info Cliente */}
            <div className="bg-white rounded-2xl shadow-sm mb-8 grid grid-cols-1 md:grid-cols-2 gap-8 border border-gray-100" style={{ padding: '2.5rem' }}>
                {/* Columna Cliente */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={20} className="text-orange-600" />
                            Información Personal
                        </h2>
                        <button
                            onClick={handleEditClick}
                            className="text-orange-600 hover:bg-orange-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 font-medium text-sm"
                        >
                            <Edit size={16} /> Editar
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '1.5rem' }}>
                        <div>
                            <p style={{ color: '#888', fontSize: '0.9rem' }}>Nombre Completo</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{client.name}</p>
                        </div>
                        <div>
                            <p style={{ color: '#888', fontSize: '0.9rem' }}>Teléfono</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Phone size={16} color="#666" />
                                <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{client.phone || 'N/A'}</p>
                            </div>
                        </div>
                        <div>
                            <p style={{ color: '#888', fontSize: '0.9rem' }}>Cédula (CI)</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <UserCheck size={16} color="#666" />
                                <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{client.ci || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Vehículos */}
                <div style={{ borderLeft: '1px solid #eee', paddingLeft: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Car size={20} className="text-orange-600" />
                            Vehículos ({vehicles.length})
                        </h2>
                        {/* TODO: Add button to add vehicle */}
                    </div>

                    <div className="flex flex-col gap-4">
                        {vehicles.length === 0 ? (
                            <p className="text-gray-500 italic">No hay vehículos registrados.</p>
                        ) : (
                            vehicles.map(vehicle => {
                                const latestMaintenance = allMaintenances.find(m => m.vehicle_id === vehicle.id);
                                const proxKms = latestMaintenance?.prox_kilometraje;
                                return (
                                    <div key={vehicle.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 client-vehicle-card">
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2b2828', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {vehicle.brand} {vehicle.model}
                                            <button onClick={() => handleEditVehicleClick(vehicle)} className="p-1 text-gray-400 hover:text-orange-600 transition-colors ml-2" title="Editar">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteVehicle(vehicle.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
                                                <Trash2 size={16} />
                                            </button>
                                        </h3>
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                            <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-sm font-bold">
                                                {vehicle.plate}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666', fontSize: '0.9rem' }}>
                                                <Calendar size={14} /> {vehicle.year}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666', fontSize: '0.9rem' }}>
                                                <Wrench size={14} /> {vehicle.kilometraje ? `${vehicle.kilometraje} km` : 'N/A'}
                                            </span>
                                            {proxKms && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ea580c', fontSize: '0.9rem', fontWeight: '600' }}>
                                                    Próx: {proxKms} km
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Sección Historial */}
            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1.5rem', marginTop: '3rem' }}>Historial de Servicios</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {allMaintenances.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay mantenimientos registrados.</p>
                ) : (
                    allMaintenances.map(item => (
                        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500 flex justify-between items-center transition-transform hover:translate-x-1">
                            <div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#2b2828' }}>
                                    Mantenimiento General {/* Placeholder if service name isn't directly on maintenance */}
                                </h4>
                                <p className="text-sm text-gray-500 font-medium mb-1">
                                    Vehículo: {item.vehicle_model} ({item.vehicle_plate})
                                </p>
                                <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span><Calendar size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />{new Date(item.created_at).toLocaleDateString()}</span>
                                    <span className="font-medium text-gray-500">• {item.kilometraje} km</span>
                                    {item.prox_kilometraje && (
                                        <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs ml-2">Próx: {item.prox_kilometraje} km</span>
                                    )}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 'bold', color: '#2b2828' }}>
                                    ${parseFloat(item.total_cost || 0).toFixed(2)}
                                </span>
                                <button
                                    onClick={() => navigate(`/maintenances/${item.id}`)}
                                    className="text-sm text-orange-600 hover:text-orange-700 font-medium mt-2 block ml-auto"
                                >
                                    Ver Detalle
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal de Edición */}
            {isEditing && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="bg-white rounded-xl shadow-xl w-full p-6 overflow-y-auto" style={{ maxWidth: '500px', maxHeight: '90vh' }}>
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Editar Cliente</h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={editForm.phone}
                                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cédula (CI)</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={editForm.ci}
                                    onChange={e => setEditForm({ ...editForm, ci: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    disabled={isSavingClient}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveClient}
                                    disabled={isSavingClient}
                                    className={`px-4 py-2 rounded-lg font-medium text-white ${isSavingClient ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}
                                >
                                    {isSavingClient ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Editar Vehículo */}
            {isEditingVehicle && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="bg-white rounded-xl shadow-xl w-full p-6 overflow-y-auto" style={{ maxWidth: '500px', maxHeight: '90vh' }}>
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Editar Vehículo</h2>
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={vehicleForm.brand}
                                        onChange={e => setVehicleForm({ ...vehicleForm, brand: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={vehicleForm.model}
                                        onChange={e => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={vehicleForm.year}
                                        onChange={e => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Placa *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none uppercase"
                                        value={vehicleForm.plate}
                                        onChange={e => setVehicleForm({ ...vehicleForm, plate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kilometraje Actual</label>
                                <input
                                    type="number"
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={vehicleForm.kilometraje}
                                    onChange={e => setVehicleForm({ ...vehicleForm, kilometraje: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsEditingVehicle(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    disabled={isSavingVehicle}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveVehicle}
                                    disabled={isSavingVehicle}
                                    className={`px-4 py-2 rounded-lg font-medium text-white ${isSavingVehicle ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}
                                >
                                    {isSavingVehicle ? 'Guardando...' : 'Guardar Auto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};


export default ClientDetail;
