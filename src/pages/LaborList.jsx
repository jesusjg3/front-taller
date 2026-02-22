
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import axios from '../api/axios';

const LaborList = () => {
    const [labors, setLabors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newLabor, setNewLabor] = useState({
        name: '',
        description: '',
        standard_price: ''
    });
    const [createLoading, setCreateLoading] = useState(false);

    const [editingLabor, setEditingLabor] = useState(null);

    useEffect(() => {
        fetchLabors();
    }, []);

    const fetchLabors = async () => {
        try {
            const response = await axios.get('/labors');
            setLabors(response.data);
        } catch (error) {
            console.error("Error loading labors:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveLabor = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            const payload = {
                ...newLabor,
                standard_price: parseFloat(newLabor.standard_price)
            };

            if (editingLabor) {
                // Update
                const response = await axios.put(`/labors/${editingLabor.id}`, payload);
                setLabors(labors.map(l => l.id === editingLabor.id ? response.data.data : l));
            } else {
                // Create
                const response = await axios.post('/labors', payload);
                setLabors([...labors, response.data.data]);
            }

            closeModal();
        } catch (error) {
            console.error("Error saving labor:", error);
            alert("Error al guardar servicio.");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeleteLabor = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
            try {
                await axios.delete(`/labors/${id}`);
                setLabors(labors.filter(l => l.id !== id));
            } catch (error) {
                console.error("Error deleting labor:", error);
                alert("Error al eliminar servicio.");
            }
        }
    };

    const openCreateModal = () => {
        setEditingLabor(null);
        setNewLabor({ name: '', description: '', standard_price: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (labor) => {
        setEditingLabor(labor);
        setNewLabor({
            name: labor.name,
            description: labor.description || '',
            standard_price: labor.standard_price
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingLabor(null);
        setNewLabor({ name: '', description: '', standard_price: '' });
    };

    const filteredLabors = labors.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 relative">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Servicios / Mano de Obra</h1>
                    <p className="text-gray-500">Catálogo de servicios y precios estándar</p>
                </div>

                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar servicio..."
                            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none w-64"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <Plus size={18} /> Nuevo Servicio
                    </button>
                </div>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 font-semibold text-sm">
                        <tr>
                            <th className="p-4 border-b">Nombre Servicio</th>
                            <th className="p-4 border-b">Descripción</th>
                            <th className="p-4 border-b text-right">Precio Estándar</th>
                            <th className="p-4 border-b text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500">Cargando servicios...</td></tr>
                        ) : filteredLabors.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500">No se encontraron servicios.</td></tr>
                        ) : (
                            filteredLabors.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors border-b last:border-0 text-gray-700">
                                    <td className="p-4 font-bold text-gray-800">
                                        {item.name}
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {item.description || '-'}
                                    </td>
                                    <td className="p-4 text-right font-mono font-bold text-green-700">
                                        ${parseFloat(item.standard_price).toFixed(2)}
                                    </td>
                                    <td className="p-4 flex gap-2 justify-center">
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="text-gray-500 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors"
                                            title="Editar"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteLabor(item.id)}
                                            className="text-gray-500 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Crear/Editar Servicio */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md m-4">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">
                            {editingLabor ? 'Editar Servicio' : 'Nuevo Servicio'}
                        </h2>
                        <form onSubmit={handleSaveLabor} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Servicio *</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={newLabor.name}
                                    onChange={e => setNewLabor({ ...newLabor, name: e.target.value })}
                                    placeholder="Ej: Cambio de Aceite"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                <textarea
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={newLabor.description}
                                    onChange={e => setNewLabor({ ...newLabor, description: e.target.value })}
                                    placeholder="Detalles del servicio..."
                                    rows="3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Estándar *</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        className="w-full border rounded-lg pl-8 p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={newLabor.standard_price}
                                        onChange={e => setNewLabor({ ...newLabor, standard_price: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium"
                                >
                                    {createLoading ? 'Guardando...' : (editingLabor ? 'Actualizar Servicio' : 'Guardar Servicio')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LaborList;
