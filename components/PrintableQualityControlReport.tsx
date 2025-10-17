import React from 'react';
import { WorkOrder, Client, Vehicle, StaffMember, CompanyInfo } from '../types';

interface PrintableQualityControlReportProps {
  workOrder: WorkOrder;
  client: Client;
  vehicle: Vehicle;
  inspector: string;
  inspectionDate: string;
  isApproved: boolean;
  notes: string;
  companyInfo?: CompanyInfo;
}

const PrintableQualityControlReport: React.FC<PrintableQualityControlReportProps> = ({
  workOrder,
  client,
  vehicle,
  inspector,
  inspectionDate,
  isApproved,
  notes,
  companyInfo
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const InfoField = ({ label, value }: { label: string, value?: string | number }) => (
    <div className="mb-2">
      <span className="text-xs font-semibold text-gray-600 block">{label}</span>
      <p className="text-sm text-black break-words">{value || 'N/A'}</p>
    </div>
  );

  const CheckItem = ({ label, checked }: { label: string, checked?: boolean }) => (
    <div className="flex items-center mb-1">
      <div className={`w-3 h-3 border border-black mr-2 ${checked ? 'bg-black' : ''}`}></div>
      <span className="text-xs">{label}</span>
    </div>
  );

  return (
    <>
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: #fff !important;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
          }
        }
      `}</style>
      <div className="bg-gray-200 min-h-screen">
        <div className="no-print p-4 bg-dark-light text-white flex justify-between items-center shadow-lg sticky top-0 z-10">
          <h2 className="font-bold">Vista Previa de Impresión - Control de Calidad</h2>
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🖨️ Imprimir
          </button>
        </div>
        <div className="bg-white text-black p-8 max-w-4xl mx-auto page-break-inside-avoid" style={{ fontFamily: 'Arial, sans-serif' }}>
          {/* Header */}
          <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
            {companyInfo?.logoUrl && (
              <div className="mb-4">
                <img src={companyInfo.logoUrl} alt="Logo" className="h-16 mx-auto" />
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {companyInfo?.name || 'AUTODEALER'}
            </h1>
            <h2 className="text-xl font-semibold text-blue-600 mb-2">
              REPORTE DE CONTROL DE CALIDAD
            </h2>
            <div className="text-sm text-gray-600">
              <p>NIT: {companyInfo?.nit || 'NIT no especificado'}</p>
            </div>
          </div>

          {/* Información General */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-400 pb-2">
              INFORMACIÓN GENERAL
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3 text-sm">DATOS DE LA ORDEN DE TRABAJO</h4>
                <InfoField label="Número de OT" value={workOrder.id} />
                <InfoField label="Fecha de Creación" value={formatDate(workOrder.date)} />
                <InfoField label="Estado Actual" value={workOrder.stage} />
                <InfoField label="Servicio Solicitado" value={workOrder.serviceRequested} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3 text-sm">DATOS DEL VEHÍCULO</h4>
                <InfoField label="Cliente" value={client.name} />
                <InfoField label="Vehículo" value={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} />
                <InfoField label="Placa" value={vehicle.plate} />
                <InfoField label="VIN" value={(vehicle as any).vin || 'No especificado'} />
              </div>
            </div>
          </div>

          {/* Resultado del Control de Calidad */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-400 pb-2">
              RESULTADO DEL CONTROL DE CALIDAD
            </h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${isApproved ? 'bg-green-500 border-green-600' : 'bg-red-500 border-red-600'}`}></div>
                  <span className="text-lg font-semibold">
                    {isApproved ? '✅ CONTROL DE CALIDAD APROBADO' : '❌ CONTROL DE CALIDAD RECHAZADO'}
                  </span>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p><strong>Inspector:</strong> {inspector}</p>
                  <p><strong>Fecha de Inspección:</strong> {formatDate(inspectionDate)}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-300 pt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Observaciones del Inspector:</h4>
                <p className="text-gray-800 bg-white p-3 rounded border text-sm">
                  {notes || 'Sin observaciones adicionales'}
                </p>
              </div>
            </div>
          </div>


          {/* Criterios de Calidad */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-400 pb-2">
              CRITERIOS DE CALIDAD EVALUADOS
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3 text-sm">EXTERIOR DEL VEHÍCULO</h4>
                <CheckItem label="No hay manchas de grasa en tapicería o latonería" checked={isApproved} />
                <CheckItem label="Se retiraron plásticos protectores de asientos/volante" checked={isApproved} />
                <CheckItem label="Los elementos personales del cliente están en su lugar" checked={isApproved} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3 text-sm">FUNCIONAMIENTO Y PRUEBAS</h4>
                <CheckItem label="El vehículo enciende correctamente" checked={isApproved} />
                <CheckItem label="No hay luces de advertencia en el tablero" checked={isApproved} />
                <CheckItem label="El motor funciona sin ruidos anormales" checked={isApproved} />
                <CheckItem label="Se realizó prueba de ruta y el manejo es correcto" checked={isApproved} />
                <CheckItem label="El sistema de A/C y calefacción funciona" checked={isApproved} />
                <CheckItem label="Los frenos responden adecuadamente" checked={isApproved} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3 text-sm">VERIFICACIÓN DE TAREAS</h4>
                <CheckItem label="Se completaron todos los trabajos aprobados en la cotización" checked={isApproved} />
                <CheckItem label="Los repuestos reemplazados están guardados para el cliente (si aplica)" checked={isApproved} />
                <CheckItem label="Se verificaron los niveles de fluidos (aceite, refrigerante, frenos)" checked={isApproved} />
                <CheckItem label="Se ajustó la presión de los neumáticos" checked={isApproved} />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3 text-sm">DOCUMENTACIÓN Y ENTREGA</h4>
                <CheckItem label="La factura corresponde con los trabajos realizados" checked={isApproved} />
                <CheckItem label="La orden de trabajo está completamente documentada" checked={isApproved} />
                <CheckItem label="Se ha preparado la recomendación de próximo mantenimiento" checked={isApproved} />
              </div>
            </div>
          </div>

          {/* Firmas */}
          <div className="mt-12">
            <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-400 pb-2">
              FIRMAS Y APROBACIONES
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="border-b border-gray-400 mb-2" style={{ height: '60px' }}></div>
                <p className="text-sm font-semibold">Inspector de Calidad</p>
                <p className="text-xs text-gray-600">{inspector}</p>
                <p className="text-xs text-gray-600">{formatDate(inspectionDate)}</p>
              </div>
              <div className="text-center">
                <div className="border-b border-gray-400 mb-2" style={{ height: '60px' }}></div>
                <p className="text-sm font-semibold">Jefe de Taller</p>
                <p className="text-xs text-gray-600">_________________________</p>
                <p className="text-xs text-gray-600">Fecha: _______________</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
            <p>Este documento es generado automáticamente por el sistema de gestión de talleres</p>
            <p>Fecha de generación: {formatDate(new Date().toISOString())}</p>
            <p>{companyInfo?.name || 'AUTODEALER'} - NIT: {companyInfo?.nit || 'NIT no especificado'}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintableQualityControlReport;