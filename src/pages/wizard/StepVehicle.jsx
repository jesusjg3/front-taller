import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Car, Check, PlusCircle } from 'lucide-react';

const StepVehicle = ({ onNext, onPrev, formData, setFormData }) => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAddingVehicle, setIsAddingVehicle] = useState(false);
    const [newVehicle, setNewVehicle] = useState({ brand: '', model: '', year: '', plate: '', kilometraje: '' });

    // Cargar vehículos del cliente al montar
    useEffect(() => {
        const fetchVehicles = async () => {
            setLoading(true);
            try {
                // Asumiendo que el backend retorna todos y filtramos aquí
                const response = await axios.get('/vehicles');

                // Asegurar que sea array (algunos backends envuelven en { data: [...] })
                const allVehicles = Array.isArray(response.data) ? response.data : (response.data.data || []);

                // Filtrar solo los del cliente seleccionado
                const clientVehicles = allVehicles.filter(v => v.client_id === formData.client.id);
                setVehicles(clientVehicles);
            } catch (error) {
                console.error("Error cargando vehículos:", error);
            } finally {
                setLoading(false);
            }
        };

        if (formData.client) {
            fetchVehicles();
        }
    }, [formData.client]);

    // Si no hay cliente seleccionado, volver
    if (!formData.client) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>⚠️ Por favor, seleccione un cliente primero.</p>
                <button className="btn btn-secondary" onClick={onPrev}>Volver</button>
            </div>
        )
    }

    const handleSelectVehicle = (vehicle) => {
        setFormData({ ...formData, vehicle });
        // No avanzar automáticamente aquí para permitir confirmar selección
    };

    const handleAddVehicle = async () => {
        if (!newVehicle.brand || !newVehicle.plate) return alert("Marca y Placa obligatorias");

        setLoading(true);
        try {
            const payload = {
                ...newVehicle,
                client_id: formData.client.id, // Vincular al cliente seleccionado
                year: parseInt(newVehicle.year),
                kilometraje: parseInt(newVehicle.kilometraje) || 0
            };

            const response = await axios.post('/vehicles', payload);
            const createdVehicle = response.data.data;

            setVehicles([...vehicles, createdVehicle]);
            setFormData({ ...formData, vehicle: createdVehicle });
            setIsAddingVehicle(false);
            onNext();
        } catch (error) {
            console.error("Error creando vehículo:", error);
            let msg = "Error al guardar vehículo.";
            if (error.response?.data?.errors) {
                msg = Object.values(error.response.data.errors).flat().join('\n');
            } else if (error.response?.data?.message) {
                msg = error.response.data.message;
            }
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    if (isAddingVehicle) {
        return (
            <div>
                <h3>Registrar Nuevo Vehículo para {formData.client.name}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                        <label className="form-label">Marca</label>
                        <input className="form-input" value={newVehicle.brand} onChange={e => setNewVehicle({ ...newVehicle, brand: e.target.value })} placeholder="Ej: Chevrolet" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Modelo</label>
                        <input className="form-input" value={newVehicle.model} onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })} placeholder="Ej: Aveo" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Año</label>
                        <input className="form-input no-spin" type="number" value={newVehicle.year} onChange={e => setNewVehicle({ ...newVehicle, year: e.target.value })} placeholder="Ej: 2015" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Placa</label>
                        <input
                            className="form-input"
                            value={newVehicle.plate}
                            onChange={e => setNewVehicle({
                                ...newVehicle,
                                plate: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                            })}
                            placeholder="Ej: ABC1234 (Sin guiones)"
                        />
                        <small style={{ color: '#888' }}>Se guardará sin espacios ni guiones.</small>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Kilometraje Actual</label>
                        <input className="form-input no-spin" type="number" value={newVehicle.kilometraje} onChange={e => setNewVehicle({ ...newVehicle, kilometraje: e.target.value })} placeholder="Ej: 145000" />
                    </div>
                </div>

                <div className="wizard-footer">
                    <button className="btn btn-secondary" onClick={() => setIsAddingVehicle(false)}>Cancelar</button>
                    <button className="btn btn-primary" onClick={handleAddVehicle} disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar y Continuar'}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div>
            <h3>Paso 2: Seleccionar Vehículo</h3>
            <p style={{ marginBottom: '1rem', color: '#666' }}>
                Vehículos registrados de <strong>{formData.client.name}</strong>.
            </p>

            {loading && <p>Cargando vehículos...</p>}

            {!loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {vehicles.map(vehicle => (
                        <div
                            key={vehicle.id}
                            className={`selection-card ${formData.vehicle?.id === vehicle.id ? 'selected' : ''}`}
                            onClick={() => handleSelectVehicle(vehicle)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <Car size={24} color="var(--accent-color)" />
                                {formData.vehicle?.id === vehicle.id && <Check size={20} color="var(--accent-color)" />}
                            </div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0' }}>{vehicle.brand} {vehicle.model}</h4>
                            <p style={{ color: '#666', margin: '4px 0' }}>{vehicle.plate}</p>
                            <small style={{ display: 'block', color: '#888' }}>Año: {vehicle.year} • {vehicle.kilometraje || 0} km</small>
                        </div>
                    ))}

                    <div
                        className="selection-card"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', background: '#f8fafc' }}
                        onClick={() => setIsAddingVehicle(true)}
                    >
                        <PlusCircle size={32} color="#94a3b8" />
                        <p style={{ marginTop: '0.5rem', fontWeight: '500', color: '#64748b' }}>Agregar Vehículo</p>
                    </div>
                </div>
            )}

            <div className="wizard-footer">
                <button className="btn btn-secondary" onClick={onPrev}>Atrás</button>

                {/* Solo habilitar Siguiente si hay un vehículo seleccionado */}
                <button
                    className="btn btn-primary"
                    onClick={onNext}
                    disabled={!formData.vehicle}
                    style={{ opacity: formData.vehicle ? 1 : 0.5, cursor: formData.vehicle ? 'pointer' : 'not-allowed' }}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
};

export default StepVehicle;
