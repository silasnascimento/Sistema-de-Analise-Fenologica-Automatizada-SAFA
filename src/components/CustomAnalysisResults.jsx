import React from 'react';

const CustomAnalysisResults = ({ analysisResult }) => {
  if (!analysisResult) return null;

  const periods = Object.keys(analysisResult.ndvi.ndvi);
  const customPeriods = analysisResult.customPeriods || [];

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Resultados da Análise Avulsa</h3>
      
      {/* Tabela de resultados */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Início</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Fim</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NDVI Médio</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clima (Temp/Chuva)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {periods.map((periodKey, index) => {
              const ndviData = analysisResult.ndvi.ndvi[periodKey];
              const tempData = analysisResult.climate.temperature[periodKey];
              const precipData = analysisResult.climate.precipitation[periodKey];
              const customPeriod = customPeriods[index];

              const observedNdvi = ndviData?.ndvi_mean;
              const tempValue = tempData?.temperature_mean_celsius;
              const precipValue = precipData?.precipitation_sum;

              return (
                <tr key={periodKey}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    Período {index + 1}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {customPeriod?.startDate || 'N/D'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {customPeriod?.endDate || 'N/D'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-semibold">
                    {observedNdvi !== undefined ? observedNdvi.toFixed(3) : 'N/D'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {(tempValue !== undefined && tempValue !== null && precipValue !== undefined && precipValue !== null)
                      ? `${tempValue.toFixed(1)}°C / ${precipValue.toFixed(1)}mm`
                      : 'N/D'
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Gráfico simples de NDVI */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Evolução do NDVI</h4>
        <div className="space-y-2">
          {periods.map((periodKey, index) => {
            const ndviData = analysisResult.ndvi.ndvi[periodKey];
            const observedNdvi = ndviData?.ndvi_mean;
            const customPeriod = customPeriods[index];
            
            if (observedNdvi === undefined) return null;

            const percentage = Math.min(observedNdvi * 100, 100);
            const barColor = observedNdvi > 0.7 ? 'bg-green-500' : observedNdvi > 0.4 ? 'bg-yellow-500' : 'bg-red-500';

            return (
              <div key={periodKey} className="flex items-center space-x-3">
                <div className="w-20 text-xs text-gray-600">
                  P{index + 1}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full ${barColor} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="w-16 text-xs text-gray-700 font-medium">
                  {observedNdvi.toFixed(3)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomAnalysisResults;
