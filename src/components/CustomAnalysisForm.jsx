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
        <label htmlFor="customPlotName" className="block text-sm font-medium text-slate-300">
          Nome do Talhão
        </label>
        <input
          type="text"
          id="customPlotName"
          name="customPlotName"
          value={formData.customPlotName || ''}
          onChange={handleChange}
          className="mt-1 block w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          placeholder="Ex: Talhão Experimental 1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Períodos de Análise
        </label>
        {periods.map((period, index) => (
          <div key={index} className="border border-slate-700 rounded-md p-3 mb-3 bg-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-300">Período {index + 1}</span>
              {periods.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePeriod(index)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remover
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-400">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={period.startDate}
                  onChange={(e) => handlePeriodChange(index, 'startDate', e.target.value)}
                  className="mt-1 block w-full p-2 text-sm rounded-md bg-slate-900 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400">
                  Data de Fim
                </label>
                <input
                  type="date"
                  value={period.endDate}
                  onChange={(e) => handlePeriodChange(index, 'endDate', e.target.value)}
                  className="mt-1 block w-full p-2 text-sm rounded-md bg-slate-900 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addPeriod}
          className="w-full py-2 px-4 border border-dashed border-slate-600 rounded-md text-sm text-slate-300 hover:border-slate-500 hover:text-slate-200 transition-colors"
        >
          + Adicionar Período
        </button>
      </div>
    </form>
  );
};

export default CustomAnalysisForm;
