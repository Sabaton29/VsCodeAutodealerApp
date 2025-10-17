import React from 'react';
import { WorkOrder, Client, Vehicle, StaffMember } from '../types';

interface PrintableQualityControlReportProps {
  workOrder: WorkOrder;
  client: Client;
  vehicle: Vehicle;
  inspector: string;
  inspectionDate: string;
  isApproved: boolean;
  notes: string;
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
  };
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white text-black p-8 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="text-center mb-8">
        {companyInfo?.logo && (
          <div className="mb-4">
            <img src={companyInfo.logo} alt="Logo" className="h-16 mx-auto" />
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {companyInfo?.name || 'AUTODEALER'}
        </h1>
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">
          REPORTE DE CONTROL DE CALIDAD
        </h2>
        <div className="text-sm text-gray-600">
          <p>{companyInfo?.address || 'Dirección de la empresa'}</p>
          <p>Tel: {companyInfo?.phone || 'Teléfono'} | Email: {companyInfo?.email || 'email@empresa.com'}</p>
        </div>
      </div>

      {/* Información General */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">
          INFORMACIÓN GENERAL
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Datos de la Orden de Trabajo</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Número de OT:</strong> {workOrder.id}</p>
              <p><strong>Fecha de Creación:</strong> {formatDate(workOrder.date)}</p>
              <p><strong>Estado Actual:</strong> {workOrder.stage}</p>
              <p><strong>Servicio Solicitado:</strong> {workOrder.serviceRequested}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Datos del Vehículo</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Cliente:</strong> {client.name}</p>
              <p><strong>Vehículo:</strong> {vehicle.year} {vehicle.make} {vehicle.model}</p>
              <p><strong>Placa:</strong> {vehicle.plate}</p>
              <p><strong>VIN:</strong> {vehicle.vin}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resultado del Control de Calidad */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">
          RESULTADO DEL CONTROL DE CALIDAD
        </h3>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${isApproved ? 'bg-green-500' : 'bg-red-500'}`}></div>
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

      {/* Detalles del Proceso */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">
          DETALLES DEL PROCESO
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <p className="font-semibold">Recepción del Vehículo</p>
              <p className="text-sm text-gray-600">Verificación inicial del estado del vehículo y documentación</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <p className="font-semibold">Diagnóstico Técnico</p>
              <p className="text-sm text-gray-600">Evaluación técnica de los sistemas del vehículo</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <p className="font-semibold">Reparación y Mantenimiento</p>
              <p className="text-sm text-gray-600">Ejecución de las reparaciones y servicios necesarios</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <div className={`w-6 h-6 text-white rounded-full flex items-center justify-center text-sm font-bold ${isApproved ? 'bg-green-500' : 'bg-red-500'}`}>4</div>
            <div>
              <p className="font-semibold">Control de Calidad Final</p>
              <p className="text-sm text-gray-600">
                {isApproved 
                  ? 'Verificación final exitosa - Vehículo listo para entrega'
                  : 'Se requieren correcciones adicionales antes de la entrega'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Criterios de Calidad */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">
          CRITERIOS DE CALIDAD EVALUADOS
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700">Exterior del Vehículo</h4>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Limpieza general del vehículo</li>
              <li>• Estado de la pintura y carrocería</li>
              <li>• Funcionamiento de luces y señalización</li>
              <li>• Estado de neumáticos y llantas</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700">Funcionamiento</h4>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Motor y sistemas mecánicos</li>
              <li>• Sistema de frenos</li>
              <li>• Dirección y suspensión</li>
              <li>• Sistemas eléctricos</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700">Verificación de Tareas</h4>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Completitud de reparaciones</li>
              <li>• Calidad de los trabajos realizados</li>
              <li>• Uso correcto de repuestos</li>
              <li>• Pruebas de funcionamiento</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700">Documentación</h4>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Registro de trabajos realizados</li>
              <li>• Garantías de repuestos</li>
              <li>• Recomendaciones de mantenimiento</li>
              <li>• Documentos de entrega</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Firmas */}
      <div className="mt-12">
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
      </div>
    </div>
  );
};

export default PrintableQualityControlReport;