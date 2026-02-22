
import React, { useState, useEffect } from 'react';
import { Search, Package, Plus, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import axios from '../api/axios';

const Inventory = () => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newItem, setNewItem] = useState({
        code: '',
        name: '',
        brand: '',
        current_price: '',
        stock: '',
        min_stock: 5,
        manages_stock: true
    });
    const [createLoading, setCreateLoading] = useState(false);

    const [editingPart, setEditingPart] = useState(null);

    useEffect(() => {
        fetchParts();
    }, []);

    const fetchParts = async () => {
        try {
            const response = await axios.get('/parts');
            setParts(response.data);
        } catch (error) {
            console.error("Error cargando inventario:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePart = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            const payload = {
                ...newItem,
                current_price: parseFloat(newItem.current_price),
                stock: newItem.manages_stock ? parseInt(newItem.stock) : 0,
                min_stock: newItem.manages_stock ? parseInt(newItem.min_stock) : 0
            };

            if (editingPart) {
                // Update existing part
                const response = await axios.put(`/parts/${editingPart.id}`, payload);
                setParts(parts.map(p => p.id === editingPart.id ? response.data.data : p));
            } else {
                // Create new part
                const response = await axios.post('/parts', payload);
                setParts([...parts, response.data.data]);
            }

            closeModal();
        } catch (error) {
            console.error("Error saving part:", error);
            alert("Error al guardar repuesto. Verifique los datos.");
        } finally {
            setCreateLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingPart(null);
        setNewItem({
            code: '',
            name: '',
            brand: '',
            current_price: '',
            stock: '',
            min_stock: 5,
            manages_stock: true
        });
        setIsModalOpen(true);
    };

    const openEditModal = (part) => {
        setEditingPart(part);
        setNewItem({
            code: part.code,
            name: part.name,
            brand: part.brand || '',
            current_price: part.current_price,
            stock: part.stock,
            min_stock: part.min_stock || 5,
            manages_stock: part.manage_stock !== undefined ? part.manage_stock : true
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPart(null);
        setNewItem({
            code: '',
            name: '',
            brand: '',
            current_price: '',
            stock: '',
            min_stock: 5,
            manages_stock: true
        });
    };

    const handleDeletePart = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este repuesto?')) {
            try {
                await axios.delete(`/parts/${id}`);
                setParts(parts.filter(p => p.id !== id));
            } catch (error) {
                console.error("Error deleting part:", error);
                alert("Error al eliminar. Puede que tenga mantenimientos asociados.");
            }
        }
    };

    const filteredParts = parts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 relative">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Inventario de Repuestos</h1>
                    <p className="text-gray-500">Gestión de stock y precios</p>
                </div>

                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar refacción..."
                            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none w-64"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <Plus size={18} /> Nuevo Repuesto
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {/* Dashboard Rápido de Inventario */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm">Total Repuestos</p>
                        <p className="text-2xl font-bold text-gray-800">{parts.length}</p>
                    </div>
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <Package className="text-blue-600" size={24} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm">Bajo Stock</p>
                        <p className="text-2xl font-bold text-red-600">
                            {parts.filter(p => p.stock <= 5).length}
                        </p>
                    </div>
                    <div className="bg-red-100 p-2 rounded-lg">
                        <AlertTriangle className="text-red-600" size={24} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 font-semibold text-sm">
                        <tr>
                            <th className="p-4 border-b">Código (SKU)</th>
                            <th className="p-4 border-b">Descripción</th>
                            <th className="p-4 border-b">Marca</th>
                            <th className="p-4 border-b">Precio Venta</th>
                            <th className="p-4 border-b">Stock</th>
                            <th className="p-4 border-b">Estado</th>
                            <th className="p-4 border-b text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="p-8 text-center text-gray-500">Cargando inventario...</td></tr>
                        ) : filteredParts.length === 0 ? (
                            <tr><td colSpan="7" className="p-8 text-center text-gray-500">No se encontraron repuestos.</td></tr>
                        ) : (
                            filteredParts.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors border-b last:border-0 text-gray-700">
                                    <td className="p-4 font-mono text-sm font-bold text-gray-600">
                                        {item.code}
                                    </td>
                                    <td className="p-4 font-medium">
                                        {item.name}
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {item.brand || '-'}
                                    </td>
                                    <td className="p-4 text-green-700 font-bold">
                                        ${parseFloat(item.current_price).toFixed(2)}
                                    </td>
                                    <td className="p-4">
                                        {item.stock} un.
                                    </td>
                                    <td className="p-4">
                                        {item.stock === 0 ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                                Agotado
                                            </span>
                                        ) : item.stock <= (item.min_stock || 5) ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                                                Bajo Stock
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                Disponible
                                            </span>
                                        )}
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
                                            onClick={() => handleDeletePart(item.id)}
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

            {/* Modal Crear/Editar Repuesto */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md m-4">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">
                                {editingPart ? 'Editar Repuesto' : 'Nuevo Repuesto'}
                            </h2>
                            <form onSubmit={handleSavePart} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Código (SKU) *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={newItem.code}
                                        onChange={e => setNewItem({ ...newItem, code: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre / Descripción *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={newItem.name}
                                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                                        <input
                                            type="text"
                                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                            value={newItem.brand}
                                            onChange={e => setNewItem({ ...newItem, brand: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta *</label>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                            value={newItem.current_price}
                                            onChange={e => setNewItem({ ...newItem, current_price: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
                                        <input
                                            type="number"
                                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                            value={newItem.stock}
                                            onChange={e => setNewItem({ ...newItem, stock: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                                        <input
                                            type="number"
                                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                            value={newItem.min_stock}
                                            onChange={e => setNewItem({ ...newItem, min_stock: e.target.value })}
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
                                        {createLoading ? 'Guardando...' : (editingPart ? 'Actualizar Repuesto' : 'Guardar Repuesto')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Inventory;
