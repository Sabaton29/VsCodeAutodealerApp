
import React, { useMemo } from 'react';
import { WorkOrder, KanbanStage, WorkOrderStatus, Invoice } from '../types';
import { KANBAN_STAGES_ORDER } from '../constants';
import { Icon } from './Icon';

interface OperationalEfficiencyReportProps {
    workOrders: WorkOrder[];
    invoices: Invoice[];
    selectedLocationId: string;
    dateRange: { startDate: Date; endDate: Date };
}

// Helper to format milliseconds into a human-readable string (d h m)
const formatDuration = (ms: number) => {
    if (ms <= 0) return '0m';
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    ms %= (1000 * 60 * 60 * 24);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    ms %= (1000 * 60 * 60);
    const minutes = Math.floor(ms / (1000 * 60));

    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0 || (days === 0 && hours === 0)) result += `${minutes}m`;
    
    return result.trim();
};


const OperationalEfficiencyReport: React.FC<OperationalEfficiencyReportProps> = ({ workOrders, invoices, selectedLocationId, dateRange }) => {

    const efficiencyData = useMemo(() => {
        const invoiceMap = new Map(invoices.map(inv => [inv.workOrderId, inv]));

        const completedOrders = workOrders.filter(wo => {
            const inv = invoiceMap.get(wo.id);
            if (!inv) return false;
            const invoiceDate = new Date(inv.issueDate);
            return (
                wo.locationId === selectedLocationId &&
                wo.status === WorkOrderStatus.FACTURADO &&
                invoiceDate >= dateRange.startDate &&
                invoiceDate <= dateRange.endDate
            );
        });

        if (completedOrders.length === 0) {
            return {
                averageCycleTime: 0,
                slowestStage: 'N/A',
                stageAverages: [],
            };
        }

        const stageDurations: { [key in KanbanStage]?: number[] } = {};
        let totalCycleTime = 0;
        let validCycleOrders = 0;

        for (const order of completedOrders) {
            const sortedHistory = [...order.history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const invoiceForOrder = invoiceMap.get(order.id);
            if (!invoiceForOrder) continue;

            // Calculate duration for each stage
            for (let i = 0; i < sortedHistory.length; i++) {
                const currentStageEntry = sortedHistory[i];
                const nextStageEntry = sortedHistory[i + 1];
                const stage = currentStageEntry.stage as KanbanStage;

                if (KANBAN_STAGES_ORDER.includes(stage)) {
                    const startTime = new Date(currentStageEntry.date).getTime();
                    const endTime = nextStageEntry ? new Date(nextStageEntry.date).getTime() : new Date(invoiceForOrder.issueDate).getTime();
                    const duration = endTime - startTime;
                    
                    if (!stageDurations[stage]) {
                        stageDurations[stage] = [];
                    }
                    stageDurations[stage]!.push(duration);
                }
            }
            
            // Calculate total cycle time for this order (Reception to Invoice)
            const receptionEntry = sortedHistory.find(h => h.stage === KanbanStage.RECEPCION);
            if (receptionEntry) {
                const startTime = new Date(receptionEntry.date).getTime();
                const endTime = new Date(invoiceForOrder.issueDate).getTime();
                totalCycleTime += (endTime - startTime);
                validCycleOrders++;
            }
        }
        
        const stageAverages = KANBAN_STAGES_ORDER.map(stage => {
            const durations = stageDurations[stage] || [];
            const average = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
            return { stage, averageTime: average };
        });

        const slowestStage = stageAverages.reduce((slowest, current) => 
            current.averageTime > slowest.averageTime ? current : slowest, { stage: 'N/A' as KanbanStage, averageTime: 0 });

        return {
            averageCycleTime: validCycleOrders > 0 ? totalCycleTime / validCycleOrders : 0,
            slowestStage: slowestStage.stage,
            stageAverages,
        };

    }, [workOrders, invoices, selectedLocationId, dateRange]);
    
    return (
         <div className="bg-light dark:bg-dark-light rounded-xl shadow-md">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-dark-light p-5 rounded-xl">
                    <div className="flex items-start justify-between">
                        <div className="text-brand-red">
                            <Icon name="clock" className="w-8 h-8" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Tiempo Promedio de Ciclo</h3>
                        <p className="mt-1 text-3xl font-bold text-dark-text">{formatDuration(efficiencyData.averageCycleTime)}</p>
                        <p className="mt-2 text-xs text-gray-500">Desde recepción hasta facturación</p>
                    </div>
                </div>
                <div className="bg-dark-light p-5 rounded-xl">
                    <div className="flex items-start justify-between">
                        <div className="text-brand-red">
                            <Icon name="exclamation-triangle" className="w-8 h-8" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Etapa Más Lenta (Cuello de Botella)</h3>
                        <p className="mt-1 text-3xl font-bold text-red-400">{efficiencyData.slowestStage}</p>
                        <p className="mt-2 text-xs text-gray-500">Área con mayor tiempo promedio</p>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto p-6 pt-0">
                 <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
                    Tiempo Promedio por Etapa
                </h3>
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-black dark:bg-gray-900/20 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Etapa del Proceso</th>
                            <th className="px-6 py-3 text-right">Tiempo Promedio</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {efficiencyData.stageAverages.filter(s => s.averageTime > 0).length > 0 ? (
                            efficiencyData.stageAverages
                                .filter(s => s.averageTime > 0)
                                .sort((a, b) => b.averageTime - a.averageTime)
                                .map(data => (
                                    <tr key={data.stage} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{data.stage}</td>
                                        <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-300 font-mono text-base">{formatDuration(data.averageTime)}</td>
                                    </tr>
                                ))
                        ) : (
                             <tr>
                                <td colSpan={2} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No hay datos suficientes para calcular la eficiencia.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OperationalEfficiencyReport;
