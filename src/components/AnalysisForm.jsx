import React from 'react';
// 1. Importa a base de dados para gerar as opções dinamicamente
import phenologyDB from '../data/phenologyDatabase.json';

// O componente recebe o estado do formulário (formData) e a função para atualizá-lo (setFormData) como props.
const AnalysisForm = ({ formData, setFormData }) => {
  // Função genérica para lidar com a mudança em qualquer campo do formulário.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <form className="space-y-4">
      <div>
        <label htmlFor="plotName" className="block text-sm font-medium text-slate-300">
          Nome do Talhão
        </label>
        <input
          type="text"
          id="plotName"
          name="plotName"
          value={formData.plotName}
          onChange={handleChange}
          className="mt-1 block w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          placeholder="Ex: Talhão Sede 1"
        />
      </div>

      <div>
        <label htmlFor="cropType" className="block text-sm font-medium text-slate-300">
          Cultura
        </label>
        <select
          id="cropType"
          name="cropType"
          value={formData.cropType}
          onChange={handleChange}
          className="mt-1 block w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
        >
          <option value="">Selecione uma cultura</option>
          {/* 2. Mapeia a lista de culturas do JSON para criar as opções do menu */}
          {phenologyDB.culturas.map((cultura) => (
            <option key={cultura.id} value={cultura.id}>
              {cultura.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-slate-300">
          Data de Início do Plantio
        </label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          className="mt-1 block w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
        />
      </div>
    </form>
  );
};

export default AnalysisForm;
