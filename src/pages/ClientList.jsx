import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, User, Car, Calendar, Phone, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import '../styles/ClientList.css';

const ClientList = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Estados para crear cliente
    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [isSavingClient, setIsSavingClient] = useState(false);
    const [clientForm, setClientForm] = useState({ name: '', phone: '', ci: '' });

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axios.get('/clients');
                setClients(response.data);
            } catch (error) {
                console.error("Error fetching clients:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    const handleRowClick = (clientId) => {
        navigate(`/clients/${clientId}`);
    };

    const handleCreateClient = async (e) => {
        e.preventDefault();
        setIsSavingClient(true);
        try {
            const response = await axios.post('/clients', clientForm);
            const newClient = response.data.data || response.data;
            setClients([newClient, ...clients]);
            setIsCreatingClient(false);
            setClientForm({ name: '', phone: '', ci: '' });
        } catch (error) {
            console.error("Error creating client:", error);
            let msg = "Error al crear el cliente.";
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

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.ci?.includes(searchTerm) ||
        client.phone?.includes(searchTerm)
    );

    return (
        <div className="p-6">
            <header className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
                    <button
                        onClick={() => {
                            setClientForm({ name: '', phone: '', ci: '' });
                            setIsCreatingClient(true);
                        }}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
                    >
                        + Nuevo Cliente
                    </button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, CI o teléfono..."
                        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Cargando clientes...</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-600 font-semibold text-sm">
                            <tr>
                                <th className="p-4 border-b">Cliente</th>
                                <th className="p-4 border-b">Contacto</th>
                                <th className="p-4 border-b"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.length > 0 ? (
                                filteredClients.map(client => (
                                    <tr
                                        key={client.id}
                                        onClick={() => handleRowClick(client.id)}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors border-b last:border-0"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-orange-100 p-2 rounded-full">
                                                    <User size={18} className="text-orange-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{client.name}</p>
                                                    <p className="text-sm text-gray-500">CI: {client.ci}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} className="text-gray-400" />
                                                    {client.phone || 'Sin teléfono'}
                                                </div>

                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <ChevronRight className="text-gray-400" size={20} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500">
                                        No se encontraron clientes.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL CREAR CLIENTE */}
            {isCreatingClient && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsCreatingClient(false);
                    }}
                >
                    <div className="bg-white rounded-xl shadow-xl w-full p-6 overflow-y-auto" style={{ maxWidth: '500px', maxHeight: '90vh' }}>
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Nuevo Cliente</h2>
                        <form className="space-y-4" onSubmit={handleCreateClient}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={clientForm.name}
                                    onChange={e => setClientForm({ ...clientForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={clientForm.phone}
                                    onChange={e => setClientForm({ ...clientForm, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cédula (CI)</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={clientForm.ci}
                                    onChange={e => setClientForm({ ...clientForm, ci: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingClient(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    disabled={isSavingClient}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingClient}
                                    className={`px-4 py-2 rounded-lg font-medium text-white ${isSavingClient ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}
                                >
                                    {isSavingClient ? 'Guardando...' : 'Crear Cliente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientList;
