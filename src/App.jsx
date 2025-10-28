import { useState, useCallback } from 'react';
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

// Novo componente para o ícone do formulário
const FormIcon = () => (
  <div className="mx-auto mb-4 w-24 h-28 bg-gray-50 rounded-lg shadow-sm flex flex-col items-center justify-center border border-gray-200">
    <div className="text-lg font-bold text-gray-700 mb-3">Formulário de dados da sua área de análise</div>
    <div className="space-y-1.5 w-16">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-1.5 bg-gray-300 rounded w-full"></div>
      ))}
      <div className="h-1.5 bg-gray-300 rounded w-8"></div>
    </div>
  </div>
);

function App() {
  const [drawnPolygon, setDrawnPolygon] = useState(null);
  const [formData, setFormData] = useState({ apiKey: '', plotName: '', cropType: '', startDate: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('phenological');

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
      {/* Left Sidebar */}
      <div className="sidebar">
        {/* Header Section */}
        <div className="sidebar-header">
          <div className="header-content">
            <div className="logo">
              <span className="logo-icon">🌱</span>
            </div>
            <div className="title-section">
              <h1 className="main-title">🌱 SAFA</h1>
              <h2 className="subtitle">Diagnóstico Inteligente</h2>
            </div>
          </div>
          <p className="description">Sistema de Análise Fenológico Automatizado</p>
          <p className="author">Desenvolvido por <a href="https://silasogis.com" target="_blank">Silas Oliveira</a></p>
        </div>

        {/* Form Section */}
        <div className="sidebar-content">
          {isLoading && <LoadingOverlay />}
          
          {/* Form Icon */}
          <FormIcon />
          
          {/* API Key */}
          <div className="form-group">
            <label htmlFor="apiKey" className="form-label">
              API Key <span className="required">*</span>
            </label>
            <input
              type="password"
              id="apiKey"
              name="apiKey"
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Insira sua chave da API"
              className="form-input"
            />
            {!formData.apiKey && (
              <p className="form-help">Necessária para executar as análises.</p>
            )}
          </div>

          <TabContainer formData={formData} setFormData={setFormData} activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <div className="button-section">
            {activeTab === 'phenological' && (
              <button 
                onClick={handleGenerateDiagnosis} 
                disabled={!isFormValid || isLoading} 
                className={`action-button ${isFormValid && !isLoading ? 'primary' : 'disabled'}`}
              >
                {isLoading ? 'Processando...' : 'Gerar Diagnóstico Fenológico'}
              </button>
            )}
            {activeTab === 'custom' && (
              <button 
                onClick={handleGenerateCustomAnalysis} 
                disabled={!isCustomFormValid || isLoading} 
                className={`action-button ${isCustomFormValid && !isLoading ? 'secondary' : 'disabled'}`}
              >
                {isLoading ? 'Processando...' : 'Gerar Análise Avulsa'}
              </button>
            )}
          </div>

          {error && (
            <div className="error-message">
              <p className="error-title">Ocorreu um Erro</p>
              <p className="error-text">{error}</p>
            </div>
          )}

          {/* Results Section in Sidebar */}
          {analysisResult && (
            <div className="results-section">
              {/* Phenology Chart */}
              {activeTab === 'phenological' && selectedCropData && (
                <div className="result-card">
                  <h3 className="result-title">Curva de Vida da Lavoura</h3>
                  <p className="result-subtitle">NDVI Observado vs. Esperado</p>
                  <div className="chart-container">
                    <PhenologyChart apiResult={analysisResult.ndvi} phenologyData={selectedCropData} />
                  </div>
                </div>
              )}

              {/* Diagnostic Table */}
              {activeTab === 'phenological' && selectedCropData && (
                <div className="result-card">
                  <h3 className="result-title">Tabela de Diagnóstico</h3>
                  <DiagnosticTable analysisResult={analysisResult} phenologyData={selectedCropData} />
                </div>
              )}

              {/* Custom Analysis Results */}
              {activeTab === 'custom' && (
                <div className="result-card">
                  <CustomAnalysisResults analysisResult={analysisResult} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Map */}
      <div className="map-section">
        {/* Map Header */}
        <div className="map-header">
          <h4 className="map-title">Mapa interativo</h4>
        </div>
        
        {/* Map Container */}
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
    </div>
  );
}

export default App;