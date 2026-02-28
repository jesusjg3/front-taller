import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Car, Wrench } from 'lucide-react';

const StepService = ({ onNext, onPrev, formData, setFormData }) => {
    // Estado local para los campos del formulario
    const [description, setDescription] = useState(formData.service.description || '');
    const [kilometraje, setKilometraje] = useState(formData.service.kilometraje || formData.vehicle?.kilometraje || '');

    // Estado para Repuestos
    const [parts, setParts] = useState(formData.service.parts || []);
    const [searchPart, setSearchPart] = useState('');

    const [inventory, setInventory] = useState([]);

    // Estado para Mano de Obra
    const [labors, setLabors] = useState(formData.service.labor || []);
    // const [searchLabor, setSearchLabor] = useState(''); // Estado no usado en nueva interfaz

    const [laborCatalog, setLaborCatalog] = useState([]);

    // Cargar Catálogos
    useEffect(() => {
        const fetchCatalogs = async () => {
            try {
                const [partsRes, laborsRes] = await Promise.all([
                    axios.get('/parts'),
                    axios.get('/labors')
                ]);

                // Mapear precios para consistencia en UI
                const mappedParts = partsRes.data.map(p => ({
                    ...p,
                    price: parseFloat(p.current_price) // Backend: current_price -> Frontend: price
                }));

                const mappedLabors = laborsRes.data.map(l => ({
                    ...l,
                    price: parseFloat(l.standard_price) // Backend: standard_price -> Frontend: price
                }));

                setInventory(mappedParts);
                setLaborCatalog(mappedLabors);
            } catch (error) {
                console.error("Error cargando catálogos:", error);
            }
        };
        fetchCatalogs();
    }, []);

    // --- Manejadores de Repuestos ---
    const [searchLabor, setSearchLabor] = useState('');

    const addPart = (part) => {
        const existing = parts.find(p => p.id === part.id);
        if (existing) {
            setParts(parts.map(p => p.id === part.id ? { ...p, quantity: p.quantity + 1 } : p));
        } else {
            setParts([...parts, { ...part, quantity: 1 }]);
        }
        setSearchPart('');
    };

    const addLaborFromCatalog = (labor) => {
        setLabors([...labors, {
            ...labor,
            price: parseFloat(labor.standard_price), // Ensure it's a number
            is_new: false,
            id: labor.id
        }]);
        setSearchLabor('');
    };


    const removePart = (id) => {
        setParts(parts.filter(p => p.id !== id));
    };

    // --- Lógica de Manejo de Filas Manuales (Mano de Obra) ---
    const addLaborRow = () => {
        const newRow = {
            temp_id: Date.now(),
            name: '',
            price: '',
            is_new: true
        };
        setLabors([...labors, newRow]);
    };

    const updateLaborRow = (index, field, value) => {
        const newLabors = [...labors];
        newLabors[index][field] = value;
        setLabors(newLabors);
    };

    const updatePartQuantity = (id, quantity) => {
        // Permitir que se vacíe temporalmente para borrar
        if (quantity === '') {
            setParts(parts.map(p => p.id === id ? { ...p, quantity: '' } : p));
            return;
        }

        const val = parseInt(quantity);
        if (val < 1) return;
        setParts(parts.map(p => p.id === id ? { ...p, quantity: val } : p));
    };

    const updatePartPrice = (id, price) => {
        setParts(parts.map(p => p.id === id ? { ...p, price: parseFloat(price) || 0 } : p));
    };

    // --- Guardar y Avanzar (Con creación automática de servicios) ---
    const handleNext = async () => {
        // Validar que no haya nombres vacíos
        if (labors.some(l => !l.name || l.name.trim() === '')) {
            alert("Por favor, complete la descripción de todas las manos de obra.");
            return;
        }

        // Validar que el kilometraje actual no sea menor al ultimo registrado y sea un número válido
        const kmIngresado = parseInt(kilometraje);
        if (isNaN(kmIngresado)) {
            alert("Por favor, ingrese un kilometraje válido y no deje el campo vacío.");
            return;
        }

        const vehicleOriginalKilometraje = formData.vehicle?.kilometraje || 0;
        if (kmIngresado < parseInt(vehicleOriginalKilometraje)) {
            alert(`El kilometraje actual (${kmIngresado} km) no puede ser menor al registrado en el vehículo (${vehicleOriginalKilometraje} km).`);
            return;
        }

        // Procesar servicios nuevos (que no tienen ID real de base de datos)
        const processedLabors = [];
        const laborsToCreate = labors.filter(l => l.is_new && !l.id);
        const existingLabors = labors.filter(l => !l.is_new || l.id);

        try {
            // Si hay nuevos, crearlos primero en el backend
            for (const labor of laborsToCreate) {
                const response = await axios.post('/labors', {
                    name: labor.name,
                    description: 'Registro rápido desde Mantenimiento',
                    standard_price: labor.price
                });
                // Agregar el creado con su ID real y el precio que puso el usuario
                processedLabors.push({
                    ...response.data.data,
                    cost_at_time: labor.price, // Usamos el precio definido manualmente
                    price: labor.price        // Para compatibilidad visual
                });
            }
        } catch (error) {
            console.error("Error creando servicios automáticos:", error);
            let msg = "Error al guardar los servicios nuevos. Intente de nuevo.";
            if (error.response?.data?.errors) {
                msg = Object.values(error.response.data.errors).flat().join('\n');
            } else if (error.response?.data?.message) {
                msg = error.response.data.message;
            }
            alert(msg);
            return; // Detener si falla
        }

        // Combinar existentes con los recién creados
        const finalLabors = [
            ...existingLabors.map(l => ({ ...l, cost_at_time: parseFloat(l.price) || 0 })),
            ...processedLabors
        ];

        setFormData({
            ...formData,
            service: {
                description,
                kilometraje,
                parts: parts.map(p => ({ ...p, price_at_time: parseFloat(p.price) || 0 })),
                labor: finalLabors
            }
        });
        onNext();
    };

    // Cálculos
    const totalService =
        parts.reduce((acc, p) => acc + (parseFloat(p.price) * p.quantity), 0) +
        labors.reduce((acc, l) => acc + (parseFloat(l.price) || 0), 0);

    return (
        <div>
            {/* Encabezado y Totales */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                <div>
                    <h3 style={{ margin: 0 }}>Paso 3: Detalles del Trabajo</h3>
                    <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>Ingrese los repuestos y la mano de obra realizada.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Total Estimado</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a' }}>
                        ${totalService.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Datos Generales (Kilometraje y Notas) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Kilometraje Actual</label>
                    <input
                        className="form-input no-spin"
                        type="number"
                        value={kilometraje}
                        onChange={e => setKilometraje(e.target.value)}
                        style={{ background: 'white' }}
                    />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Observaciones Generales</label>
                    <input
                        className="form-input"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Notas generales del servicio..."
                        style={{ background: 'white' }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* --- SECCIÓN IZQUIERDA: REPUESTOS (CON INVENTARIO) --- */}
                <div>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ea580c', borderBottom: '2px solid #ea580c', paddingBottom: '0.5rem' }}>
                        <Car size={20} /> Detalles de Repuestos
                    </h4>

                    {/* Buscador de Repuestos */}
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <input
                            className="form-input"
                            placeholder="🔍 Buscar repuesto en inventario (Nombre o Código)..."
                            value={searchPart}
                            onChange={e => setSearchPart(e.target.value)}
                            style={{ borderColor: '#fed7aa' }}
                        />
                        {/* Resultados de búsqueda */}
                        {searchPart.length > 1 && (
                            <div style={{ position: 'absolute', width: '100%', background: 'white', border: '1px solid #ccc', borderRadius: '8px', zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                {inventory
                                    .filter(i => i.name.toLowerCase().includes(searchPart.toLowerCase()) || i.code.includes(searchPart))
                                    .map(p => (
                                        <div key={p.id} onClick={() => addPart(p)} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }} className="hover:bg-orange-50">
                                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{p.name}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666' }}>
                                                <span>COD: {p.code}</span>
                                                <span>Stock: {p.stock} • ${p.price.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                {inventory.filter(i => i.name.toLowerCase().includes(searchPart.toLowerCase()) || i.code.includes(searchPart)).length === 0 && (
                                    <div style={{ padding: '10px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>No encontrado en inventario</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tabla de Repuestos */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: '#fff7ed', color: '#c2410c' }}>
                                <th style={{ padding: '8px', textAlign: 'left', borderRadius: '6px 0 0 6px' }}>Código/Desc.</th>
                                <th style={{ padding: '8px', width: '60px', textAlign: 'center' }}>Cant.</th>
                                <th style={{ padding: '8px', width: '80px', textAlign: 'right' }}>P.Unit</th>
                                <th style={{ padding: '8px', width: '80px', textAlign: 'right' }}>Total</th>
                                <th style={{ padding: '8px', width: '30px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {parts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#cbd5e1', border: '1px dashed #e2e8f0', borderRadius: '8px' }}>
                                        Sin repuestos agregados
                                    </td>
                                </tr>
                            ) : (
                                parts.map(p => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '8px' }}>
                                            <div style={{ fontWeight: '500' }}>{p.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.code}</div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <input
                                                type="number"
                                                value={p.quantity}
                                                min="1"
                                                onChange={(e) => updatePartQuantity(p.id, e.target.value)}
                                                style={{ width: '50px', padding: '4px', textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                                            />
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <input
                                                type="number"
                                                value={p.price}
                                                step="0.01"
                                                onChange={(e) => updatePartPrice(p.id, e.target.value)}
                                                style={{ width: '70px', padding: '4px', textAlign: 'right', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                                            ${(p.price * p.quantity).toFixed(2)}
                                        </td>
                                        <td>
                                            <button onClick={() => removePart(p.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}>×</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- SECCIÓN DERECHA: MANO DE OBRA (TIPO EXCEL/PROFORMA) --- */}
                <div>
                    <h4 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#0369a1', borderBottom: '2px solid #0369a1', paddingBottom: '0.5rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Wrench size={20} /> Mano de Obra</span>
                        <button
                            onClick={addLaborRow}
                            style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '4px 12px', borderRadius: '15px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            + Agregar Manual
                        </button>
                    </h4>

                    {/* Buscador de Servicios (Catálogo) */}
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <input
                            className="form-input"
                            placeholder="🔍 Buscar servicio común..."
                            value={searchLabor}
                            onChange={(e) => setSearchLabor(e.target.value)}
                            style={{ borderColor: '#bae6fd' }}
                        />
                        {/* Resultados de búsqueda Labor */}
                        {searchLabor.length > 1 && (
                            <div style={{ position: 'absolute', width: '100%', background: 'white', border: '1px solid #ccc', borderRadius: '8px', zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                {laborCatalog
                                    .filter(l => l.name.toLowerCase().includes(searchLabor.toLowerCase()))
                                    .map(labor => (
                                        <div key={labor.id} onClick={() => addLaborFromCatalog(labor)} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f9ff' }} className="hover:bg-blue-50">
                                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#0369a1' }}>{labor.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                                ${parseFloat(labor.standard_price).toFixed(2)} • {labor.description}
                                            </div>
                                        </div>
                                    ))}
                                {laborCatalog.filter(l => l.name.toLowerCase().includes(searchLabor.toLowerCase())).length === 0 && (
                                    <div style={{ padding: '10px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>No encontrado en catálogo</div>
                                )}
                            </div>
                        )}
                    </div>


                    {/* Tabla de Mano de Obra */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: '#f0f9ff', color: '#0369a1' }}>
                                <th style={{ padding: '8px', textAlign: 'left', borderRadius: '6px 0 0 6px' }}>Descripción del Trabajo</th>
                                <th style={{ padding: '8px', width: '90px', textAlign: 'right' }}>Precio</th>
                                <th style={{ padding: '8px', width: '30px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {labors.length === 0 ? (
                                <tr>
                                    <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#cbd5e1', border: '1px dashed #e2e8f0', borderRadius: '8px' }}>
                                        Haga clic en "+ Agregar Fila" para escribir
                                    </td>
                                </tr>
                            ) : (
                                labors.map((l, index) => (
                                    <tr key={l.temp_id || l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '6px' }}>
                                            <input
                                                type="text"
                                                value={l.name}
                                                onChange={(e) => updateLaborRow(index, 'name', e.target.value)}
                                                placeholder="Ej: Cambio de Aceite..."
                                                style={{ width: '100%', padding: '6px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                                                autoFocus={l.is_new && !l.name}
                                            />
                                        </td>
                                        <td style={{ padding: '6px', textAlign: 'right' }}>
                                            <input
                                                type="number"
                                                value={l.price}
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                onChange={(e) => updateLaborRow(index, 'price', e.target.value)}
                                                style={{ width: '80px', padding: '6px', textAlign: 'right', border: '1px solid #e2e8f0', borderRadius: '4px', fontWeight: 'bold' }}
                                            />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button
                                                onClick={() => {
                                                    const newLabors = labors.filter((_, i) => i !== index);
                                                    setLabors(newLabors);
                                                }}
                                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}
                                            >
                                                ×
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {labors.length > 0 && (
                        <div style={{ marginTop: '1rem', textAlign: 'right', fontSize: '0.9rem', color: '#64748b' }}>
                            Subtotal Mano de Obra: <span style={{ fontWeight: 'bold', color: '#0369a1' }}>${labors.reduce((acc, l) => acc + (parseFloat(l.price) || 0), 0).toFixed(2)}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="wizard-footer">
                <button className="btn btn-secondary" onClick={onPrev}>Atrás</button>
                <button className="btn btn-primary" onClick={handleNext}>Siguiente: Resumen</button>
            </div>
        </div>
    );
};

export default StepService;
