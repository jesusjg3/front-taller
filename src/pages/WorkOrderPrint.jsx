import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, FileText } from 'lucide-react';
import '../styles/PrintOrder.css';

const WorkOrderPrint = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Obtenemos el cliente y el vehículo seleccionado desde el estado de navegación
    const { client, vehicle } = location.state || {};
    const currentDate = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Listas fijas por defecto (puedes reemplazarlas después con los nombres exactos que necesitas)
    const servicesList = [
        "ACEITE, MOTOR FILTRO 10W30/20W50/15W40",
        "ACEITE CAJA DE CAMBIOS MT_AT",
        "ACEITE DIFERENCIAL DE CAMBIO Y ACEITE DE DH",
        "AFINAMIENTO DE MOTOR",
        "INYECTORES LIMPIEZA",
        "BANDAS CHEQUEO/CAMBIO",
        "EMBRAGUE CHEQUEO/CAMBIO",
        "FRENOS AJUSTE/REPARACION Y CAMBIO DE LIQUIDO",
        "NIVELES DE REVISION",
        "LUCES GENERALES (REVISION)",
        "ALINEACION",
        "BALANCEO",


    ];

    const inventoryList = [
        "RADIO",
        "MASCARILLA DE RADIO",
        "PERILLAS DE CALEFACTOR",
        "AIRE ACONDICIONADO",
        "MOQUETAS",
        "PLUMAS",
        "PITO",
        "HERRAMIENTAS",
        "SEGURO DE RUEDAS",
        "LLAVE DE CRUZ"

    ];

    if (!client || !vehicle) {
        return (
            <div className="p-8 text-center text-red-500">
                <h2>Error</h2>
                <p>No se proporcionaron los datos del cliente o vehículo. Regrese a la pantalla anterior.</p>
                <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-gray-200 rounded">Volver</button>
            </div>
        );
    }

    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = vehicle?.plate && client?.name
            ? `Orden_Trabajo_${vehicle.plate}_${client.name.replace(/\s+/g, '_')}`
            : 'Orden_Trabajo';
        window.print();
        setTimeout(() => { document.title = originalTitle; }, 1000);
    };

    return (
        <div className="work-order-print p-6 max-w-4xl mx-auto min-h-screen bg-gray-50 print:p-0 print:bg-white print:min-h-0">
            {/* --- CABECERA DE CONTROLES (Solo pantalla) --- */}
            <header className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 print:shadow-none print:border-none print:p-0 print:mb-8 no-print mb-6">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors bg-gray-50 flex-shrink-0"
                    >
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <span className="bg-orange-100 p-2 rounded-lg">
                                <FileText className="text-orange-600" size={24} />
                            </span>
                            <span>Orden de Trabajo Físico</span>
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Plantilla para impresión y llenado manual
                        </p>
                    </div>
                </div>

                <div className="text-right flex items-center gap-6">
                    <button
                        onClick={handlePrint}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
                    >
                        <Printer size={20} /> Imprimir Plantilla
                    </button>
                </div>
            </header>

            {/* --- HOJA DE TRABAJO --- */}
            <div className="bg-white border-2 border-black p-4 relative text-black" style={{ fontFamily: 'sans-serif', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', minHeight: '1000px' }}>

                {/* 1. LOGO Y HEADER */}
                <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-2">
                    <div className="flex flex-col items-center w-1/3">
                        <div className="font-bold text-[10px] mt-1">
                            AUTOSERVICIOS M.G
                        </div>
                    </div>
                    <div className="w-1/3 text-center">
                        <h1 className="text-6xl font-black italic tracking-wider">M.G.</h1>
                    </div>
                    <div className="w-1/3 text-right">
                    </div>
                </div>

                {/* TÍTULO ORDEN */}
                <div className="text-center bg-gray-200 border-y-2 border-black py-1 font-bold text-base mb-2">
                    ORDEN DE REPARACIÓN MECÁNICA:
                </div>

                {/* 2. TABLA DE DATOS CABECERA */}
                <table className="w-full border-collapse mb-4 text-[11px] font-bold uppercase border-2 border-black" style={{ lineHeight: '14px' }}>
                    <tbody>
                        <tr>
                            <td className="p-2 w-[15%] bg-pink-50 text-red-600 border border-black">C.I.</td>
                            <td className="p-2 w-[35%] font-normal border border-black">{client.ci || ''}</td>
                            <td className="p-2 w-[15%] bg-pink-50 text-red-600 border border-black">PLACA:</td>
                            <td className="p-2 w-[35%] font-normal border border-black">{vehicle.plate || ''}</td>
                        </tr>
                        <tr>
                            <td className="p-2 bg-pink-50 text-red-600 border border-black">CLIENTE:</td>
                            <td className="p-2 font-normal border border-black">{client.name || ''}</td>
                            <td className="p-2 bg-pink-50 text-red-600 border border-black">MODELO:</td>
                            <td className="p-2 font-normal border border-black">{vehicle.model || ''}</td>
                        </tr>
                        <tr>
                            <td className="p-2 bg-pink-50 text-red-600 border border-black">TELÉFONO:</td>
                            <td className="p-2 font-normal border border-black">{client.phone || ''}</td>
                            <td className="p-2 bg-pink-50 text-red-600 border border-black">KILÓMETROS:</td>
                            <td className="p-2 font-normal border border-black">{vehicle.kilometraje || ''}</td>
                        </tr>
                        <tr>
                            <td className="p-2 bg-pink-50 text-red-600 border border-black">FECHA:</td>
                            <td className="p-2 font-normal border border-black">{currentDate}</td>
                            <td className="p-2 bg-pink-50 text-red-600 border border-black">FECHA EST. ENTREGA:</td>
                            <td className="p-2 font-normal border border-black"></td>
                        </tr>
                    </tbody>
                </table>

                {/* 3. TABLA MULTICOLUMNA DE CHEQUEOS */}
                <table className="w-full table-fixed border-collapse mb-4 text-[9px] uppercase font-medium border-2 border-black">
                    <thead>
                        <tr className="bg-pink-50 border-b-2 border-black">
                            {/* Mitad izquierda */}
                            <th className="p-1.5 text-left pl-3 w-[42%] border border-black">
                                DESCRIPCIÓN DEL SERVICIO
                            </th>
                            <th className="p-1.5 text-center w-[8%] border border-black border-r-2 border-black">
                                OK
                            </th>

                            {/* Mitad derecha */}
                            <th className="p-1.5 text-left pl-3 w-[42%] border border-black">
                                INVENTARIO
                            </th>
                            <th className="p-1.5 text-center w-[8%] border border-black">
                                OK
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {Array.from({ length: 13 }).map((_, i) => (
                            <tr key={i} className="h-6">
                                {/* SERVICIOS */}
                                <td className="py-0.5 px-2 pl-3 align-middle text-[8px] leading-tight break-words border border-black">
                                    {servicesList[i] ? servicesList[i] : '\u00A0'}
                                </td>

                                <td className="p-1 align-middle text-center border border-black border-r-2 border-black">
                                    {'\u00A0'}
                                </td>

                                {/* INVENTARIO */}
                                <td className="py-0.5 px-2 pl-3 bg-pink-50 align-middle text-[8px] leading-tight break-words border border-black">
                                    {inventoryList[i] ? inventoryList[i] : '\u00A0'}
                                </td>

                                <td className="p-1 align-middle bg-pink-50 text-center border border-black">
                                    {'\u00A0'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* 4. DETALLE DE TRABAJOS LIBRES */}
                <table className="w-full border-collapse mb-4 text-[10px] font-bold uppercase border-2 border-black">
                    <thead>
                        <tr className="bg-pink-50">
                            <th className="p-1 text-center font-normal tracking-widest border border-black">Observaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <tr key={i} className="h-5">
                                <td className="p-1 border border-black">
                                    {'\u00A0'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* ESPACIADOR FÍSICO INQUEBRANTABLE PARA IMPRESIÓN */}
                <div style={{ height: '150px' }} className="w-full"></div>

                {/* 5. SECCIÓN FINAL: FIRMAS */}
                <div className="w-full px-16 pb-4">
                    <div className="flex justify-between text-[10px] font-bold">
                        <div className="w-[40%] text-center">
                            <div className="border-b-2 border-black w-full mb-1"></div>
                            FIRMA DEL CLIENTE
                        </div>

                        <div className="w-[40%] text-center">
                            <div className="border-b-2 border-black w-full mb-1"></div>
                            FIRMA DEL MECANICO
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WorkOrderPrint;
