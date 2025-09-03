import React from 'react';

const TileSelector = ({ analysisResult, phenologyData, selectedTilePeriod, setSelectedTilePeriod }) => {
  if (!analysisResult?.ndvi_tiles) {
    return null;
  }

  const handleSelectionChange = (e) => {
    setSelectedTilePeriod(e.target.value);
  };

  // Cria as opções para o menu dropdown
  const tilePeriods = Object.keys(analysisResult.ndvi_tiles);

  return (
    <div className="mt-6">
      <label htmlFor="tile-selector" className="block text-sm font-medium text-gray-700">
        Visualizar NDVI no Mapa:
      </label>
      <select
        id="tile-selector"
        value={selectedTilePeriod || ''}
        onChange={handleSelectionChange}
        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="">-- Selecione um período --</option>
        {tilePeriods.map(periodKey => {
          // Pega o índice do período (ex: "period_1" -> 0) para achar o nome do estágio
          const stageIndex = parseInt(periodKey.split('_')[1]) - 1;
          const stageName = phenologyData.estagios[stageIndex]?.codigo || periodKey;
          
          return (
            <option key={periodKey} value={periodKey}>
              {stageName}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default TileSelector;