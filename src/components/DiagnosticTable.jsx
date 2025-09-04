import React from 'react';
// Lógica para determinar o status do NDVI
const getNdviStatus = (observed, min, max) => {
  if (observed === null || observed === undefined) {
    return { text: 'N/D', className: 'bg-gray-200 text-gray-800' };
  }
  if (min === null || min === undefined || max === null || max === undefined) {
    return { text: 'Info', className: 'bg-blue-100 text-blue-800' };
  }
  const range = max - min;
  const lowerThreshold = min + range * 0.15;
  if (observed > max) return { text: 'Vigor Excepcional', className: 'bg-blue-100 text-blue-800' };
  if (observed >= min) return { text: 'Normal', className: 'bg-green-100 text-green-800' };
  if (observed >= lowerThreshold) return { text: 'Atenção', className: 'bg-yellow-100 text-yellow-800' };
  return { text: 'Vigor Baixo', className: 'bg-red-100 text-red-800' };
};
const DiagnosticTable = ({ analysisResult, phenologyData }) => {
  if (!analysisResult || !phenologyData) return null;
  const periods = Object.keys(analysisResult.ndvi.ndvi);
  const stagesToRender = phenologyData.estagios.slice(0, periods.length);
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
            {stagesToRender.map((stageData, index) => {
              const periodKey = `period_${index + 1}`;
              
              const ndviData = analysisResult.ndvi.ndvi[periodKey];
              const tempData = analysisResult.climate.temperature[periodKey];
              const precipData = analysisResult.climate.precipitation[periodKey];
              
              const observedNdvi = ndviData?.ndvi_mean;
              const expectedMin = stageData?.ndvi_esperado_min;
              const expectedMax = stageData?.ndvi_esperado_max;
              const status = getNdviStatus(observedNdvi, expectedMin, expectedMax);
              return (
                <tr key={periodKey}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{stageData?.codigo || 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-semibold">
                    {observedNdvi !== undefined ? observedNdvi.toFixed(2) : 'N/D'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {(expectedMin !== undefined && expectedMax !== undefined)
                      ? `${expectedMin.toFixed(2)} - ${expectedMax.toFixed(2)}`
                      : 'N/A'
                    }
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.className}`}>
                      {status.text}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {/* CORREÇÃO FINAL: Verifica as propriedades dentro dos objetos de clima */}
                    {(tempData?.temperature_mean_celsius !== undefined && tempData.temperature_mean_celsius !== null && precipData?.precipitation_sum !== undefined && precipData.precipitation_sum !== null)
                      ? `${tempData.temperature_mean_celsius.toFixed(1)}°C / ${precipData.precipitation_sum.toFixed(1)}mm`
                      : 'N/D'
                    }
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

