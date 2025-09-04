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
    const ndviPromise = apiClient.post('/ndvi_composite', ndviPayload);
    const climatePromise = apiClient.post('/climate_stats', climatePayload);

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