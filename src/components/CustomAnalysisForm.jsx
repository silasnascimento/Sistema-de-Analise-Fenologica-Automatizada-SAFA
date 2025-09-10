import React, { useState } from 'react';

const CustomAnalysisForm = ({ formData, setFormData }) => {
  const [periods, setPeriods] = useState([{ startDate: '', endDate: '' }]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePeriodChange = (index, field, value) => {
    const newPeriods = [...periods];
    newPeriods[index][field] = value;
    setPeriods(newPeriods);
    
    // Atualiza o formData com os períodos
    setFormData(prevData => ({
      ...prevData,
      customPeriods: newPeriods
    }));
  };

  const addPeriod = () => {
    setPeriods([...periods, { startDate: '', endDate: '' }]);
  };

  const removePeriod = (index) => {
    if (periods.length > 1) {
      const newPeriods = periods.filter((_, i) => i !== index);
      setPeriods(newPeriods);
      setFormData(prevData => ({
        ...prevData,
        customPeriods: newPeriods
      }));
    }
  };

  return (
    <form className="space-y-4">
      <div>
        <label htmlFor="customPlotName" className="block text-sm font-medium text-gray-700">
          Nome do Talhão
        </label>
        <input
          type="text"
          id="customPlotName"
          name="customPlotName"
          value={formData.customPlotName || ''}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Ex: Talhão Experimental 1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Períodos de Análise
        </label>
        {periods.map((period, index) => (
          <div key={index} className="border border-gray-200 rounded-md p-3 mb-3 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Período {index + 1}</span>
              {periods.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePeriod(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remover
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={period.startDate}
                  onChange={(e) => handlePeriodChange(index, 'startDate', e.target.value)}
                  className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Data de Fim
                </label>
                <input
                  type="date"
                  value={period.endDate}
                  onChange={(e) => handlePeriodChange(index, 'endDate', e.target.value)}
                  className="mt-1 block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addPeriod}
          className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
        >
          + Adicionar Período
        </button>
      </div>
    </form>
  );
};

export default CustomAnalysisForm;
