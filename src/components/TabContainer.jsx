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
      <div className="flex border-b border-gray-200 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-green-500 text-green-600 bg-green-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
              <p className="text-xs text-gray-600">
                Análise baseada em estágios fenológicos específicos da cultura selecionada
              </p>
            </div>
            <AnalysisForm formData={formData} setFormData={setFormData} />
          </div>
        )}
        
        {activeTab === 'custom' && (
          <div>
            <div className="mb-3">
              <p className="text-xs text-gray-600">
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
