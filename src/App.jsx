import { useState, useCallback } from 'react';
import './App.css';
import Map from './components/Map';
import ControlPanel from './components/ControlPanel';
import DiagnosticDashboard from './components/DiagnosticDashboard';
import CustomAnalysisResults from './components/CustomAnalysisResults';
import Spinner from './components/Spinner';
import { fetchAnalysis, fetchCustomAnalysis } from './api/geeApi';
import phenologyDB from './data/phenologyDatabase.json';

const LoadingOverlay = () => (
  <div className="absolute inset-0 bg-slate-900/80 flex flex-col justify-center items-center z-[2000] text-slate-200 backdrop-blur-sm">
    <Spinner size="lg" />
    <p className="mt-4 text-slate-300 font-semibold text-lg animate-pulse">Processando diagnóstico...</p>
  </div>
);

function App() {
  const [drawnPolygon, setDrawnPolygon] = useState(null);
  const [formData, setFormData] = useState({ apiKey: '', plotName: '', cropType: '', startDate: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('phenological');

  // Memoizar callbacks para evitar re-renderizações desnecessárias do Map
  const handlePolygonCreated = useCallback((geoJson) => setDrawnPolygon(geoJson), []);
  const handlePolygonEdited = useCallback((geoJson) => setDrawnPolygon(geoJson), []);
  const handlePolygonDeleted = useCallback(() => setDrawnPolygon(null), []);

  const handleGenerateDiagnosis = async () => {
    setAnalysisResult(null);
    setError(null);
    setIsLoading(true);
    try {
      const analysisData = { polygon: drawnPolygon, formData: formData };
      const result = await fetchAnalysis(analysisData);
      setAnalysisResult(result);
    } catch (err) {
      setError("Não foi possível gerar o diagnóstico. Verifique os dados ou tente novamente mais tarde.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCustomAnalysis = async () => {
    setAnalysisResult(null);
    setError(null);
    setIsLoading(true);
    try {
      const analysisData = { polygon: drawnPolygon, formData: formData };
      const result = await fetchCustomAnalysis(analysisData);
      setAnalysisResult(result);
    } catch (err) {
      setError("Não foi possível gerar a análise avulsa. Verifique os períodos definidos ou tente novamente mais tarde.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = drawnPolygon && formData.apiKey && formData.plotName && formData.cropType && formData.startDate;
  const isCustomFormValid = drawnPolygon && formData.apiKey && formData.customPlotName && formData.customPeriods && formData.customPeriods.length > 0 && formData.customPeriods.every(p => p.startDate && p.endDate);
  const selectedCropData = formData.cropType ? phenologyDB.culturas.find(c => c.id === formData.cropType) : null;

  return (
    <div className="app-container">

      {/* Global Loading Overlay */}
      {isLoading && <LoadingOverlay />}

      {/* Full Screen Map */}
      <div className="map-section">
        <div className="map-container">
          <Map
            onPolygonCreated={handlePolygonCreated}
            onPolygonEdited={handlePolygonEdited}
            onPolygonDeleted={handlePolygonDeleted}
            analysisResult={analysisResult}
            phenologyData={selectedCropData}
            activeTab={activeTab}
          />
        </div>
      </div>

      {/* Floating Control Panel */}
      <ControlPanel
        formData={formData}
        setFormData={setFormData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onGenerateDiagnosis={handleGenerateDiagnosis}
        onGenerateCustom={handleGenerateCustomAnalysis}
        isLoading={isLoading}
        isFormValid={isFormValid}
        isCustomFormValid={isCustomFormValid}
        error={error}
      />

      {/* Diagnostic Dashboard Overlay */}
      {analysisResult && activeTab === 'phenological' && selectedCropData && (
        <DiagnosticDashboard
          analysisResult={analysisResult}
          phenologyData={selectedCropData}
          formData={formData}
          onClose={() => setAnalysisResult(null)}
          polygon={drawnPolygon}
        />
      )}

      {/* Custom Analysis Results Overlay (Simple Modal for now) */}
      {analysisResult && activeTab === 'custom' && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setAnalysisResult(null)}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
            <div className="p-6">
              <CustomAnalysisResults analysisResult={analysisResult} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;