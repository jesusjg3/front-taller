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

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.ci?.includes(searchTerm) ||
        client.phone?.includes(searchTerm)
    );

    return (
        <div className="p-6">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
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
                                <th className="p-4 border-b">Ubicación</th>
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
                                                <div className="flex items-center gap-2">
                                                    <FileText size={14} className="text-gray-400" />
                                                    {client.email || 'Sin email'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {client.address || 'Sin dirección'}
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
        </div>
    );
};

export default ClientList;
