import React, { useState } from 'react';
import AnalysisForm from './AnalysisForm';
import CustomAnalysisForm from './CustomAnalysisForm';

const TabContainer = ({ formData, setFormData, activeTab, setActiveTab }) => {

  const tabs = [
    { id: 'phenological', label: 'Análise Fenológica', icon: '🌱' },
    { id: 'custom', label: 'Consulta Avulsa', icon: '📊' }
  ];

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'phenological' && (
          <div>
            <div className="mb-3">
              <p className="text-xs text-slate-400">
                Análise baseada em estágios fenológicos específicos da cultura selecionada
              </p>
            </div>
            <AnalysisForm formData={formData} setFormData={setFormData} />
          </div>
        )}
        
        {activeTab === 'custom' && (
          <div>
            <div className="mb-3">
              <p className="text-xs text-slate-400">
                Análise personalizada com períodos definidos manualmente
              </p>
            </div>
            <CustomAnalysisForm formData={formData} setFormData={setFormData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TabContainer;
