import React, { useState } from 'react';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { User, FileText, Check } from 'lucide-react';

// --- PASO 4: RESUMEN Y CONFIRMACIÓN ---
const StepSummary = ({ onPrev, formData }) => {
    // Calcular Totales
    const totalParts = formData.service.parts.reduce((acc, p) => acc + (p.price_at_time * p.quantity), 0);
    const totalLabor = formData.service.labor.reduce((acc, l) => acc + l.cost_at_time, 0);
    const total = totalParts + totalLabor;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        // Preparar Payload para el Backend
        const payload = {
            vehicle_id: formData.vehicle.id,
            kilometraje: parseInt(formData.vehicle.kilometraje) || 0, // El actual antes del servicio
            prox_kilometraje: parseInt(formData.service.kilometraje), // El nuevo ingresado
            fecha: new Date().toISOString().split('T')[0], // Hoy
            observaciones: formData.service.description,
            parts: (formData.service.parts || []).map(p => ({
                id: p.id,
                quantity: p.quantity,
                price_at_time: parseFloat(p.price_at_time)
            })),
            labors: (formData.service.labor || []).map(l => ({
                id: l.id,
                cost_at_time: parseFloat(l.cost_at_time)
            }))
        };

        console.log("Enviando Payload:", payload); // Debugging para el usuario

        try {
            await axios.post('/maintenances', payload);
            alert("¡Mantenimiento registrado con éxito!");
            navigate('/'); // O a la vista de detalles del mantenimiento creado si el back devuelve ID
        } catch (error) {
            console.error("Error guardando mantenimiento:", error);
            alert("Error al guardar mantenimiento. Revise la consola.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h3>Paso 4: Confirmar Servicio</h3>
            <p style={{ marginBottom: '2rem', color: '#666' }}>Por favor revise los detalles antes de guardar.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Detalles Izquierda */}
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                    <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                        <User size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                        Cliente y Vehículo
                    </h4>
                    <p><strong>Cliente:</strong> {formData.client.name} (CI: {formData.client.ci})</p>
                    <p><strong>Vehículo:</strong> {formData.vehicle.brand} {formData.vehicle.model} ({formData.vehicle.year})</p>
                    <p><strong>Placa:</strong> {formData.vehicle.plate}</p>
                    <p><strong>Kilometraje Nuevo:</strong> {formData.service.kilometraje} km</p>

                    <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '2rem' }}>
                        <FileText size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                        Observaciones
                    </h4>
                    <p style={{ fontStyle: 'italic', color: '#555' }}>{formData.service.description || "Ninguna."}</p>
                </div>

                {/* Totales Derecha */}
                {/* Totales Derecha */}
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden', height: 'fit-content' }}>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: 0, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={18} /> Resumen Financiero
                        </h4>
                    </div>

                    <div style={{ padding: '1.5rem' }}>
                        {/* Lista Mano de Obra */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 'bold', marginBottom: '0.5rem' }}>Mano de Obra</p>
                            {formData.service.labor && formData.service.labor.length > 0 ? (
                                formData.service.labor.map(l => (
                                    <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.95rem' }}>
                                        <span style={{ color: '#475569' }}>{l.name}</span>
                                        <span style={{ fontWeight: '500' }}>${parseFloat(l.cost_at_time).toFixed(2)}</span>
                                    </div>
                                ))
                            ) : (
                                <p style={{ fontStyle: 'italic', color: '#cbd5e1', fontSize: '0.9rem' }}>No seleccionada</p>
                            )}
                        </div>

                        {/* Lista Repuestos */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 'bold', marginBottom: '0.5rem' }}>Repuestos</p>
                            {formData.service.parts && formData.service.parts.length > 0 ? (
                                formData.service.parts.map(p => (
                                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.95rem' }}>
                                        <span style={{ color: '#475569' }}>{p.name} <span style={{ fontSize: '0.8em', color: '#94a3b8' }}>x{p.quantity}</span></span>
                                        <span style={{ fontWeight: '500' }}>${(parseFloat(p.price_at_time) * p.quantity).toFixed(2)}</span>
                                    </div>
                                ))
                            ) : (
                                <p style={{ fontStyle: 'italic', color: '#cbd5e1', fontSize: '0.9rem' }}>No seleccionados</p>
                            )}
                        </div>

                        <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b' }}>Total a Pagar:</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="wizard-footer">
                <button className="btn btn-secondary" onClick={onPrev}>Atrás</button>
                <button
                    className="btn btn-primary"
                    style={{ backgroundColor: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={handleConfirm}
                    disabled={loading}
                >
                    <Check size={20} /> {loading ? 'Guardando...' : 'Confirmar y Guardar'}
                </button>
            </div>
        </div>
    );
};

export default StepSummary;
