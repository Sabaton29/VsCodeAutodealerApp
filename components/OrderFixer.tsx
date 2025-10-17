import React, { useState } from 'react';
import { useData } from './DataContext';

const OrderFixer: React.FC = () => {
    const { handleFixSpecificOrder } = useData();
    const [isFixing, setIsFixing] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleFix = async() => {
        setIsFixing(true);
        setResult(null);
        
        try {
            const fixResult = await handleFixSpecificOrder('0068');
            setResult(fixResult);
            
            if (fixResult.success) {
                // Recargar la página después de 2 segundos
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        } catch (error) {
            setResult({
                success: false,
                message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });
        } finally {
            setIsFixing(false);
        }
    };

    return (
        <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-50">
            <h3 className="text-lg font-semibold mb-2">🔧 Corrector de Órdenes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Corregir orden #0068 que tiene cotización ENVIADA pero está en PENDIENTE_COTIZACION
            </p>
            
            <button
                onClick={handleFix}
                disabled={isFixing}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
            >
                {isFixing ? 'Corrigiendo...' : 'Corregir Orden #0068'}
            </button>
            
            {result && (
                <div className={`mt-3 p-2 rounded ${
                    result.success 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                    {result.success ? '✅' : '❌'} {result.message}
                </div>
            )}
        </div>
    );
};

export default OrderFixer;


