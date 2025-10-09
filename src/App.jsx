import { useState } from 'react';
import './App.css';
import Map from './components/Map';
import TabContainer from './components/TabContainer';
import PhenologyChart from './components/PhenologyChart';
import DiagnosticTable from './components/DiagnosticTable';
import CustomAnalysisResults from './components/CustomAnalysisResults';
import Spinner from './components/Spinner';
import { fetchAnalysis, fetchCustomAnalysis } from './api/geeApi';
import phenologyDB from './data/phenologyDatabase.json';

const LoadingOverlay = () => (
  <div className="absolute inset-0 bg-slate-900/80 flex flex-col justify-center items-center z-20 text-slate-200">
    <Spinner />
    <p className="mt-4 text-slate-300 font-semibold">Processando diagnóstico...</p>
  </div>
);

function App() {
  const [drawnPolygon, setDrawnPolygon] = useState(null);
  const [formData, setFormData] = useState({ apiKey: '', plotName: '', cropType: '', startDate: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('phenological');

  // 1. O estado 'selectedTilePeriod' foi removido.

  const handlePolygonCreated = (geoJson) => setDrawnPolygon(geoJson);
  const handlePolygonEdited = (geoJson) => setDrawnPolygon(geoJson);
  const handlePolygonDeleted = () => setDrawnPolygon(null);

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

  // 2. A lógica 'activeTileUrl' foi removida.

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-950 text-slate-100">
      <div className="relative w-full md:w-1/4 p-4 md:p-6 bg-slate-900/80 backdrop-blur border-r border-slate-800 overflow-y-auto">
        {isLoading && <LoadingOverlay />}
        <h1 className="text-2xl font-bold mb-1 text-slate-100">🌱 SAFA - Diagnóstico Inteligente</h1>
        <h2 className="text-sm mb-1 text-slate-400">Sistema de Análise Fenolóigco Automatizado</h2>
        <h2 className="text-xs mb-4 text-slate-500">Desenvolvido por <a href="https://silasogis.com" target="_blank" className="text-blue-400 underline hover:text-blue-300">Silas Oliveira</a></h2>

        {/* API Key */}
        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-xs font-medium text-slate-400 mb-1">API Key <span className="text-slate-500">(obrigatória)</span></label>
          <input
            type="password"
            id="apiKey"
            name="apiKey"
            value={formData.apiKey}
            onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
            placeholder="Insira sua chave da API"
            className="block w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
          {!formData.apiKey && (
            <p className="mt-1 text-[11px] text-slate-500">Necessária para executar as análises.</p>
          )}
        </div>
        <TabContainer formData={formData} setFormData={setFormData} activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-6">
          {activeTab === 'phenological' && (
            <button onClick={handleGenerateDiagnosis} disabled={!isFormValid || isLoading} className={`w-full text-white font-bold py-2 px-4 rounded transition-colors ${ isFormValid && !isLoading ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-700 cursor-not-allowed'}`}>
              {isLoading ? 'Processando...' : 'Gerar Diagnóstico Fenológico'}
            </button>
          )}
          {activeTab === 'custom' && (
            <button onClick={handleGenerateCustomAnalysis} disabled={!isCustomFormValid || isLoading} className={`w-full text-white font-bold py-2 px-4 rounded transition-colors ${ isCustomFormValid && !isLoading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 cursor-not-allowed'}`}>
              {isLoading ? 'Processando...' : 'Gerar Análise Avulsa'}
            </button>
          )}
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-950 border border-red-800 text-red-300 rounded">
            <p className="font-bold text-red-200">Ocorreu um Erro</p>
            <p>{error}</p>
          </div>
        )}
        {analysisResult && (
          <>
            {activeTab === 'phenological' && selectedCropData && (
              <>
                <DiagnosticTable analysisResult={analysisResult} phenologyData={selectedCropData} />
                <PhenologyChart apiResult={analysisResult.ndvi} phenologyData={selectedCropData} />
              </>
            )}
            {activeTab === 'custom' && (
              <CustomAnalysisResults analysisResult={analysisResult} />
            )}
          </>
        )}
      </div>
      <div className="w-full h-[50vh] md:h-full md:w-3/4">
        {/* 3. Passa os resultados da análise para o componente Map */}
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
  );
}

export default App;