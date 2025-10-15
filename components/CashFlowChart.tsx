import React from 'react';

export interface CashFlowDataPoint {
    label: string;
    income: number;
    expense: number;
}

interface CashFlowChartProps {
    data: CashFlowDataPoint[];
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ data }) => {
    const maxValue = Math.max(1, ...data.flatMap(d => [d.income, d.expense]));

    return (
        <div className="bg-dark-light rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-dark-text">Flujo de Caja</h3>
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-green-500/80"></div>Ingresos</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-red-500/80"></div>Egresos</div>
                </div>
            </div>
            {data.length > 0 ? (
                <div className="h-64 flex items-end space-x-2 border-l border-b border-gray-700 p-1">
                    {data.map((point, index) => {
                        const incomeHeight = (point.income / maxValue) * 100;
                        const expenseHeight = (point.expense / maxValue) * 100;

                        return (
                            <div key={index} className="flex-1 h-full flex flex-col items-center justify-end group relative">
                                <div className="flex items-end h-full w-full justify-center gap-1">
                                    <div className="w-1/2 bg-green-500/80 hover:bg-green-500 rounded-t-sm" style={{ height: `${incomeHeight}%`, transition: 'height 0.3s ease-in-out' }}></div>
                                    <div className="w-1/2 bg-red-500/80 hover:bg-red-500 rounded-t-sm" style={{ height: `${expenseHeight}%`, transition: 'height 0.3s ease-in-out' }}></div>
                                </div>
                                <span className="text-xs text-gray-400 mt-1 absolute -bottom-5">{point.label}</span>
                                <div className="absolute bottom-full mb-2 w-max p-2 bg-black dark:bg-gray-900/80 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                    <p className="font-bold">{point.label}</p>
                                    <p className="text-green-400">Ingresos: {point.income.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</p>
                                    <p className="text-red-400">Egresos: {point.expense.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                    No hay datos de flujo de caja para el período seleccionado.
                </div>
            )}
        </div>
    );
};

export default CashFlowChart;
