
import React, { useMemo } from 'react';
import { Icon } from '../Icon';
import { Vehicle, Client, WorkOrder, Invoice, Quote, Permission } from '../../types';
import { STATUS_DISPLAY_CONFIG, QUOTE_STATUS_DISPLAY_CONFIG, INVOICE_STATUS_DISPLAY_CONFIG } from '../../constants';

interface VehicleDetailViewProps {
    vehicle: Vehicle;
    client?: Client;
    workOrders: WorkOrder[];
    invoices: Invoice[];
    quotes: Quote[];
    onBack: () => void;
    onEditVehicle: (vehicle: Vehicle) => void;
    onViewWorkOrder: (id: string) => void;
    onViewQuote: (id: string) => void;
    hasPermission: (permission: Permission) => boolean;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const VehicleDetailView: React.FC<VehicleDetailViewProps> = ({ vehicle, client, workOrders, invoices, quotes, onBack, onEditVehicle, onViewWorkOrder, onViewQuote, hasPermission }) => {

    const combinedHistory = useMemo(() => {
        const history = [
            ...workOrders.map(wo => ({ ...wo, type: 'Orden de Trabajo', date: wo.date, statusDisplay: STATUS_DISPLAY_CONFIG[wo.status] })),
            ...quotes.map(q => ({ ...q, type: 'Cotización', date: q.issueDate, statusDisplay: QUOTE_STATUS_DISPLAY_CONFIG[q.status] })),
            ...invoices.map(i => ({ ...i, type: 'Factura', date: i.issueDate, statusDisplay: INVOICE_STATUS_DISPLAY_CONFIG[i.status] })),
        ];
        return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [workOrders, quotes, invoices]);

    const handleHistoryClick = (item: any) => {
        if (item.type === 'Orden de Trabajo') onViewWorkOrder(item.id);
        if (item.type === 'Cotización') onViewQuote(item.id);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700/50 transition-colors">
                        <Icon name="arrow-left" className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">{`${vehicle.make} ${vehicle.model} - `}<span className="font-mono">{vehicle.plate}</span></h1>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">Hoja de vida y detalles del vehículo</p>
                    </div>
                </div>
                 {hasPermission('manage:vehicles') && (
                     <button onClick={() => onEditVehicle(vehicle)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-red rounded-lg shadow-md hover:bg-red-700 transition-colors">
                        <Icon name="edit" className="w-4 h-4" /> Editar Vehículo
                    </button>
                )}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-dark-light rounded-xl p-5">
                        <h3 className="font-bold text-white flex items-center gap-2 mb-3"><Icon name="car" className="w-5 h-5 text-brand-red"/> Ficha Técnica</h3>
                        <ul className="text-sm space-y-2 text-gray-300">
                            <li><strong className="text-gray-400">Propietario:</strong> {client?.name || 'N/A'}</li>
                            <li><strong className="text-gray-400">Tipo:</strong> {vehicle.vehicleType}</li>
                            <li><strong className="text-gray-400">Año:</strong> {vehicle.year}</li>
                            <li><strong className="text-gray-400">Color:</strong> {vehicle.color}</li>
                            <li><strong className="text-gray-400">Cilindraje:</strong> {vehicle.engineDisplacement ? `${vehicle.engineDisplacement} cc` : 'N/A'}</li>
                            <li><strong className="text-gray-400">Combustible:</strong> {vehicle.fuelType}</li>
                        </ul>
                    </div>
                </div>

                {/* Right Column (History) */}
                <div className="lg:col-span-2 bg-dark-light rounded-xl p-5">
                    <h3 className="font-bold text-white text-lg mb-3">Historial del Vehículo</h3>
                     <div className="overflow-x-auto max-h-[60vh]">
                        <table className="w-full text-sm text-left">
                             <thead className="text-xs text-gray-400 uppercase bg-black dark:bg-gray-900/30 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2">Tipo</th>
                                    <th className="px-4 py-2">ID</th>
                                    <th className="px-4 py-2">Fecha</th>
                                    <th className="px-4 py-2">Estado</th>
                                    <th className="px-4 py-2 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {combinedHistory.map((item: any, index) => (
                                    <tr key={`${item.type}-${item.id}-${index}`} onClick={() => handleHistoryClick(item)} className="hover:bg-gray-800/50 cursor-pointer">
                                        <td className="px-4 py-3 font-semibold">{item.type}</td>
                                        <td className="px-4 py-3 font-mono">{item.id}</td>
                                        <td className="px-4 py-3">{new Date(item.date).toLocaleDateString('es-CO')}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.statusDisplay.bg} ${item.statusDisplay.text}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono">{formatCurrency(item.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleDetailView;
