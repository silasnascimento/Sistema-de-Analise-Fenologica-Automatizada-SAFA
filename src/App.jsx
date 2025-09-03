import { useState } from 'react';
import './App.css';
import Map from './components/Map';
import AnalysisForm from './components/AnalysisForm';
import PhenologyChart from './components/PhenologyChart';
import TileSelector from './components/TileSelector';
import DiagnosticTable from './components/DiagnosticTable'; // 1. Importa a tabela
import { fetchAnalysis } from './api/geeApi'; // Importação renomeada
import phenologyDB from './data/phenologyDatabase.json';

function App() {
  const [drawnPolygon, setDrawnPolygon] = useState(null);
  const [formData, setFormData] = useState({ plotName: '', cropType: '', startDate: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedTilePeriod, setSelectedTilePeriod] = useState(null);

  const handlePolygonCreated = (geoJson) => setDrawnPolygon(geoJson);
  const handlePolygonEdited = (geoJson) => setDrawnPolygon(geoJson);
  const handlePolygonDeleted = () => setDrawnPolygon(null);

  const handleGenerateDiagnosis = async () => {
    setAnalysisResult(null);
    setSelectedTilePeriod(null);
    setIsLoading(true);
    try {
      const analysisData = { polygon: drawnPolygon, formData: formData };
      const result = await fetchAnalysis(analysisData); // Usa a nova função
      setAnalysisResult(result);
      alert(`Diagnóstico para "${formData.plotName}" gerado com sucesso!`);
    } catch (error) {
      alert(`Ocorreu um erro ao gerar o diagnóstico: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = drawnPolygon && formData.plotName && formData.cropType && startDate;
  const selectedCropData = formData.cropType ? phenologyDB.culturas.find(c => c.id === formData.cropType) : null;
  const activeTileUrl = analysisResult && selectedTilePeriod ? analysisResult.ndvi.ndvi_tiles[selectedTilePeriod]?.tile_url : null;

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-1/3 p-4 shadow-lg bg-white overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">SAFA - Diagnóstico Inteligente</h1>
        
        <AnalysisForm formData={formData} setFormData={setFormData} />
        <div className="mt-6">
          <button onClick={handleGenerateDiagnosis} disabled={!isFormValid || isLoading} className={`...`}>
            {isLoading ? 'Processando...' : 'Gerar Diagnóstico'}
          </button>
        </div>

        {analysisResult && selectedCropData && (
          <>
            <TileSelector
              analysisResult={analysisResult.ndvi} // Passa o objeto aninhado correto
              phenologyData={selectedCropData}
              selectedTilePeriod={selectedTilePeriod}
              setSelectedTilePeriod={setSelectedTilePeriod}
            />
            {/* 2. Adiciona a Tabela de Diagnóstico */}
            <DiagnosticTable
              analysisResult={analysisResult}
              phenologyData={selectedCropData}
            />
            <PhenologyChart
              apiResult={analysisResult.ndvi} // Passa o objeto aninhado correto
              phenologyData={selectedCropData}
            />
          </>
        )}
      </div>
      <div className="w-2/3">
        <Map onPolygonCreated={handlePolygonCreated} onPolygonEdited={handlePolygonEdited} onPolygonDeleted={handlePolygonDeleted} activeTileUrl={activeTileUrl} />
      </div>
    </div>
  );
}

export default App;
