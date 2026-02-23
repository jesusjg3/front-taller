import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Search, Plus, Check } from 'lucide-react';

// --- PASO 1: CLIENTE ---
const StepClient = ({ onNext, formData, setFormData }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [clients, setClients] = useState([]); // Lista cargada de la API
    const [isCreating, setIsCreating] = useState(false);
    const [newClient, setNewClient] = useState({ name: '', ci: '', phone: '' });
    const [loading, setLoading] = useState(false);

    // Cargar clientes al montar (o al buscar si implementas debounce)
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axios.get('/clients');
                setClients(response.data);
            } catch (error) {
                console.error("Error cargando clientes:", error);
            }
        };
        fetchClients();
    }, []);

    const filteredClients = searchTerm.length > 2
        ? clients.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.ci.includes(searchTerm)
        )
        : [];

    const handleSelectClient = (client) => {
        setFormData({ ...formData, client });
        onNext();
    };

    const handleCreateClient = async () => {
        if (!newClient.name || !newClient.ci) return alert("Nombre y CI son obligatorios");

        setLoading(true);
        try {
            const response = await axios.post('/clients', newClient);
            const createdClient = response.data.data; // Ajustar según respuesta del Back
            setFormData({ ...formData, client: createdClient });
            // Actualizar lista local por si acaso
            setClients([...clients, createdClient]);
            setIsCreating(false);
            onNext();
        } catch (error) {
            console.error("Error creando cliente:", error);
            let msg = "Error al crear cliente. Verifique los datos.";
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

    if (isCreating) {
        return (
            <div>
                <h3>Registrar Nuevo Cliente</h3>
                <div className="form-group">
                    <label className="form-label">Nombre Completo</label>
                    <input className="form-input" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Cédula (CI)</label>
                    <input className="form-input" value={newClient.ci} onChange={e => setNewClient({ ...newClient, ci: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input className="form-input" value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })} />
                </div>

                <div className="wizard-footer">
                    <button className="btn btn-secondary" onClick={() => setIsCreating(false)} disabled={loading}>Cancelar</button>
                    <button className="btn btn-primary" onClick={handleCreateClient} disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar y Continuar'}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div>
            <h3>Paso 1: Identificar Cliente</h3>
            <p style={{ marginBottom: '1rem', color: '#666' }}>Busque un cliente existente por nombre o CI, o registre uno nuevo.</p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '10px', top: '10px', color: '#999' }} />
                    <input
                        className="form-input"
                        style={{ paddingLeft: '35px' }}
                        placeholder="Buscar cliente (mínimo 3 letras)..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn btn-secondary" onClick={() => setIsCreating(true)}>
                    <Plus size={18} style={{ verticalAlign: 'middle' }} /> Nuevo
                </button>
            </div>

            {searchTerm.length > 2 && (
                <div style={{ border: '1px solid #eee', borderRadius: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                    {filteredClients.map(client => (
                        <div
                            key={client.id}
                            className="selection-card"
                            onClick={() => handleSelectClient(client)}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}
                        >
                            <div>
                                <strong>{client.name}</strong>
                                <br />
                                <small style={{ color: '#666' }}>CI: {client.ci} • Tel: {client.phone}</small>
                            </div>
                            <Check size={18} color="var(--accent-color)" />
                        </div>
                    ))}
                    {filteredClients.length === 0 && (
                        <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                            No se encontraron resultados.
                        </div>
                    )}
                </div>
            )}

            {/* Si ya hay un cliente seleccionado previamente, mostrarlo */}
            {formData.client && !isCreating && !searchTerm && (
                <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                    <p style={{ color: '#166534', fontWeight: 'bold' }}>Cliente Seleccionado:</p>
                    <p>{formData.client.name} (CI: {formData.client.ci})</p>
                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={onNext}>Continuar con este cliente</button>
                </div>
            )}
        </div>
    );
};

export default StepClient;
