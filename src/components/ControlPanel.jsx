import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Settings, Map as MapIcon, FileText } from 'lucide-react';
import TabContainer from './TabContainer';
import Spinner from './Spinner';

const ControlPanel = ({
    formData,
    setFormData,
    activeTab,
    setActiveTab,
    onGenerateDiagnosis,
    onGenerateCustom,
    isLoading,
    isFormValid,
    isCustomFormValid,
    error
}) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className={`fixed top-4 left-4 z-[900] transition-all duration-300 ease-in-out flex items-start ${isOpen ? 'w-96' : 'w-12'}`}>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1 shadow-md text-gray-600 hover:bg-gray-50 z-10"
            >
                {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>

            {/* Main Panel Content */}
            <div
                className={`bg-white border border-white/20 shadow-xl rounded-2xl overflow-hidden w-full transition-all duration-300 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'}`}
                // --- AQUI ESTÁ A CORREÇÃO ---
                style={{
                    backgroundColor: '#ffffff',   // Força branco SÓLIDO (remove a transparência para garantir visibilidade)
                    isolation: 'isolate',         // Cria um novo contexto de empilhamento (CRUCIAL)
                    position: 'relative',         // Garante que o z-index funcione
                    zIndex: 905,                  // Garante que fique acima do wrapper e do mapa
                }}
            // ----------------------------
            >

                {/* Scrollable Content */}
                <div className="p-5 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">

                    {/* API Key Input */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Configuração
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Settings size={16} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="password"
                                value={formData.apiKey}
                                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                                placeholder="Chave da API Google Earth Engine"
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Tabs & Form */}
                    <TabContainer
                        formData={formData}
                        setFormData={setFormData}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />

                    {/* Action Buttons */}
                    <div className="mt-6 space-y-3">
                        {activeTab === 'phenological' && (
                            <button
                                onClick={onGenerateDiagnosis}
                                disabled={!isFormValid || isLoading}
                                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2
                  ${isFormValid && !isLoading
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/40 hover:-translate-y-0.5'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            >
                                {isLoading ? <Spinner size="sm" color="white" /> : <FileText size={18} />}
                                {isLoading ? 'Processando...' : 'Gerar Diagnóstico'}
                            </button>
                        )}

                        {activeTab === 'custom' && (
                            <button
                                onClick={onGenerateCustom}
                                disabled={!isCustomFormValid || isLoading}
                                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2
                  ${isCustomFormValid && !isLoading
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-purple-500/40 hover:-translate-y-0.5'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            >
                                {isLoading ? <Spinner size="sm" color="white" /> : <MapIcon size={18} />}
                                {isLoading ? 'Processando...' : 'Gerar Análise Avulsa'}
                            </button>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 animate-fade-in">
                            <p className="font-bold mb-1">Erro</p>
                            {error}
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-[10px] text-gray-400">
                        Sistema de Análise Fenológico Automatizado
                    </p>
                </div>

            </div>
        </div>
    );
};

export default ControlPanel;
