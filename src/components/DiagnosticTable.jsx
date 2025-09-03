import React from 'react';

// Lógica para determinar o status do NDVI
const getNdviStatus = (observed, min, max) => {
  const range = max - min;
  const lowerThreshold = min + range * 0.15; // Limite inferior de "Atenção"

  if (observed > max) return { text: 'Vigor Excepcional', className: 'bg-blue-100 text-blue-800' };
  if (observed >= min) return { text: 'Normal', className: 'bg-green-100 text-green-800' };
  if (observed >= lowerThreshold) return { text: 'Atenção', className: 'bg-yellow-100 text-yellow-800' };
  return { text: 'Vigor Baixo', className: 'bg-red-100 text-red-800' };
};

const DiagnosticTable = ({ analysisResult, phenologyData }) => {
  if (!analysisResult || !phenologyData) return null;

  const periods = Object.keys(analysisResult.ndvi.ndvi);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800">Tabela de Diagnóstico</h3>
      <div className="overflow-x-auto mt-2">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estágio</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NDVI Observado</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NDVI Esperado</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clima (Temp/Chuva)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {periods.map((periodKey, index) => {
              const stageData = phenologyData.estagios[index];
              const ndviData = analysisResult.ndvi.ndvi[periodKey];
              const tempData = analysisResult.climate.temperature[periodKey];
              const precipData = analysisResult.climate.precipitation[periodKey];
              
              const status = getNdviStatus(ndviData.ndvi_mean, stageData.ndvi_esperado_min, stageData.ndvi_esperado_max);

              return (
                <tr key={periodKey}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{stageData.codigo}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-semibold">{ndviData.ndvi_mean.toFixed(2)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{`${stageData.ndvi_esperado_min.toFixed(2)} - ${stageData.ndvi_esperado_max.toFixed(2)}`}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.className}`}>
                      {status.text}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {`${tempData.temperature_mean_celsius.toFixed(1)}°C / ${precipData.precipitation_sum.toFixed(1)}mm`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DiagnosticTable;