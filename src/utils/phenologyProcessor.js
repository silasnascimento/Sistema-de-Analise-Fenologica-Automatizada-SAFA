// 1. Importa a nossa base de conhecimento
import phenologyDB from '../data/phenologyDatabase.json';

/**
 * Calcula os períodos fenológicos para uma cultura com base na data de plantio.
 * @param {string} cropId - O ID da cultura (ex: "glycine_max" para Soja).
 * @param {string} plantingDateStr - A data de plantio no formato "YYYY-MM-DD".
 * @returns {Array} - Um array de objetos, cada um representando um estágio fenológico passado.
 */
export const calculatePhenologyPeriods = (cropId, plantingDateStr) => {
  if (!cropId || !plantingDateStr) {
    return [];
  }

  // 2. Encontra a cultura selecionada no nosso "banco de dados" JSON
  const cropData = phenologyDB.culturas.find(c => c.id === cropId);
  if (!cropData) {
    console.error(`Cultura com id "${cropId}" não encontrada.`);
    return [];
  }

  const today = new Date();
  const plantingDate = new Date(plantingDateStr);
  // Adiciona 1 dia para evitar problemas de fuso horário que podem fazer a data "voltar" um dia.
  plantingDate.setDate(plantingDate.getDate() + 1);

  const periods = [];

  // 3. Itera sobre cada estágio fenológico definido no JSON para a cultura
  for (const stage of cropData.estagios) {
    const stageStartDate = new Date(plantingDate);
    stageStartDate.setDate(plantingDate.getDate() + stage.dias_apos_semeadura_inicio);

    const stageEndDate = new Date(plantingDate);
    stageEndDate.setDate(plantingDate.getDate() + stage.dias_apos_semeadura_fim);
    
    // 4. Apenas inclui estágios que já começaram (aconteceram no passado ou estão em andamento)
    if (stageStartDate <= today) {
      periods.push({
        stageCode: stage.codigo,
        stageDescription: stage.descricao,
        startDate: stageStartDate.toISOString().split('T')[0],
        endDate: stageEndDate.toISOString().split('T')[0],
      });
    }
  }

  console.log("Períodos Fenológicos Calculados:", periods);
  return periods;
};
