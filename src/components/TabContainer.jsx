import React, { useState } from 'react';
import AnalysisForm from './AnalysisForm';
import CustomAnalysisForm from './CustomAnalysisForm';

const TabContainer = ({ formData, setFormData, activeTab, setActiveTab }) => {

  const tabs = [
    { id: 'phenological', label: 'Análise Fenológica', icon: '🌱' },
    { id: 'custom', label: 'Consulta Avulsa', icon: '📊' }
  ];

  return (
    <div className="tab-container">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'phenological' && (
          <div>
            <div className="tab-description">
              <p>Análise baseada em estágios fenológicos específicos da cultura selecionada</p>
            </div>
            <AnalysisForm formData={formData} setFormData={setFormData} />
          </div>
        )}
        
        {activeTab === 'custom' && (
          <div>
            <div className="tab-description">
              <p>Análise personalizada com períodos definidos manualmente</p>
            </div>
            <CustomAnalysisForm formData={formData} setFormData={setFormData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TabContainer;
