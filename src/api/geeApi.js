import axios from 'axios';
import { calculatePhenologyPeriods } from '../utils/phenologyProcessor';

//const apiClient = axios.create({
//  baseURL: '/api',
//  headers: { 'Content-Type': 'application/json' },
//});

// Define a URL base para a API de forma dinâmica.
// Em desenvolvimento (npm run dev), usa o proxy local '/api'.
// Em produção (no GitHub Pages), aponta diretamente para a API real.

const baseURL = import.meta.env.DEV ? '/api' : 'https://map.silasogis.com';

console.log(`Modo: ${import.meta.env.DEV ? 'Desenvolvimento' : 'Produção'}. URL da API: ${baseURL}`);

const apiClient = axios.create({
  baseURL: baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Função auxiliar para calcular o centroide de um polígono
const getPolygonCentroid = (polygon) => {
  const coords = polygon.geometry.coordinates[0];
  const centroid = coords.reduce((acc, coord) => {
    return [acc[0] + coord[0], acc[1] + coord[1]];
  }, [0, 0]);
  
  const numPoints = coords.length;
  return [centroid[0] / numPoints, centroid[1] / numPoints];
};


export const fetchAnalysis = async (analysisData) => {
  const { polygon, formData } = analysisData;
  const apiKey = formData?.apiKey;
  if (!apiKey) throw new Error("API key obrigatória.");

  const periods = calculatePhenologyPeriods(formData.cropType, formData.startDate);
  if (periods.length === 0) throw new Error("Nenhum período fenológico encontrado.");

  // 1. Prepara os corpos das duas requisições
  const ndviPayload = { "roi": polygon.geometry };
  periods.forEach((p, i) => {
    ndviPayload[`start_date_period_${i + 1}`] = p.startDate;
    ndviPayload[`end_date_period_${i + 1}`] = p.endDate;
  });

  const centroid = getPolygonCentroid(polygon);
  const climatePayload = {
    "point": { "type": "Point", "coordinates": centroid },
    "date_periods": periods.map(p => [p.startDate, p.endDate]), // API de clima espera um formato diferente
  };

  console.log("Enviando payload NDVI:", ndviPayload);
  console.log("Enviando payload Clima:", climatePayload);

  try {
    // 2. Cria as duas promessas de requisição
    const requestConfig = { headers: { 'x-api-key': apiKey } };
    const ndviPromise = apiClient.post('/ndvi_composite', ndviPayload, requestConfig);
    const climatePromise = apiClient.post('/climate_stats', climatePayload, requestConfig);

    // 3. Executa as duas em paralelo e aguarda os resultados
    const [ndviResponse, climateResponse] = await Promise.all([ndviPromise, climatePromise]);

    const combinedResult = {
      ndvi: ndviResponse.data,
      climate: climateResponse.data,
    };

    console.log("✅ Sucesso! Resposta Combinada:", combinedResult);
    return combinedResult;
  } catch (error) {
    console.error("❌ Erro ao chamar a API:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Nova função para análise avulsa com períodos customizados
export const fetchCustomAnalysis = async (analysisData) => {
  const { polygon, formData } = analysisData;
  const apiKey = formData?.apiKey;
  if (!apiKey) throw new Error("API key obrigatória.");

  // Valida se há períodos customizados
  if (!formData.customPeriods || formData.customPeriods.length === 0) {
    throw new Error("Nenhum período customizado definido.");
  }

  // Valida se todos os períodos têm datas de início e fim
  const validPeriods = formData.customPeriods.filter(p => p.startDate && p.endDate);
  if (validPeriods.length === 0) {
    throw new Error("Períodos customizados devem ter datas de início e fim válidas.");
  }

  // 1. Prepara os corpos das duas requisições
  const ndviPayload = { "roi": polygon.geometry };
  validPeriods.forEach((p, i) => {
    ndviPayload[`start_date_period_${i + 1}`] = p.startDate;
    ndviPayload[`end_date_period_${i + 1}`] = p.endDate;
  });

  const centroid = getPolygonCentroid(polygon);
  const climatePayload = {
    "point": { "type": "Point", "coordinates": centroid },
    "date_periods": validPeriods.map(p => [p.startDate, p.endDate]),
  };

  console.log("Enviando payload NDVI (Custom):", ndviPayload);
  console.log("Enviando payload Clima (Custom):", climatePayload);

  try {
    // 2. Cria as duas promessas de requisição
    const requestConfig = { headers: { 'x-api-key': apiKey } };
    const ndviPromise = apiClient.post('/ndvi_composite', ndviPayload, requestConfig);
    const climatePromise = apiClient.post('/climate_stats', climatePayload, requestConfig);

    // 3. Executa as duas em paralelo e aguarda os resultados
    const [ndviResponse, climateResponse] = await Promise.all([ndviPromise, climatePromise]);

    const combinedResult = {
      ndvi: ndviResponse.data,
      climate: climateResponse.data,
      customPeriods: validPeriods, // Inclui os períodos customizados no resultado
    };

    console.log("✅ Sucesso! Resposta Combinada (Custom):", combinedResult);
    return combinedResult;
  } catch (error) {
    console.error("❌ Erro ao chamar a API (Custom):", error.response ? error.response.data : error.message);
    throw error;
  }
};