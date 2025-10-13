import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Importante para preencher a área
} from 'chart.js';
// Registra os componentes necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
const PhenologyChart = ({ apiResult, phenologyData }) => {
  if (!apiResult || !phenologyData) return null;
  // 1. Extrai os dados que precisamos
  const labels = Object.keys(apiResult.ndvi).map(key => {
    const index = parseInt(key.split('_')[1]) - 1;
    // Adiciona verificação para garantir que o estágio existe antes de acessar 'codigo'
    return phenologyData.estagios[index] ? phenologyData.estagios[index].codigo : 'N/A';
  });
  const observedNdvi = Object.values(apiResult.ndvi).map(period => period.ndvi_mean);
  const expectedMinNdvi = phenologyData.estagios.slice(0, labels.length).map(stage => stage.ndvi_esperado_min);
  const expectedMaxNdvi = phenologyData.estagios.slice(0, labels.length).map(stage => stage.ndvi_esperado_max);
  // 2. Configura os dados para o gráfico
  const chartData = {
    labels, // Estágios fenológicos no eixo X
    datasets: [
      {
        label: 'NDVI Observado',
        data: observedNdvi,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.1,
        borderWidth: 3,
      },
      {
        label: 'Faixa Esperada (Máx)',
        data: expectedMaxNdvi,
        borderColor: 'rgba(75, 192, 192, 0.2)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: '+1', // Preenche a área até o próximo dataset na lista (o Mínimo)
        pointRadius: 0,
      },
      {
        label: 'Faixa Esperada (Mín)',
        data: expectedMinNdvi,
        borderColor: 'rgba(75, 192, 192, 0.2)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false, // Não preenche para baixo
        pointRadius: 0,
      },
    ],
  };
  // 3. Configura as opções visuais do gráfico
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#374151' },
      },
      title: {
        display: false
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        title: {
          display: true,
          text: 'Valor do NDVI',
          color: '#6b7280'
        },
        ticks: { color: '#6b7280' },
        grid: { color: 'rgba(107,114,128,0.2)', borderColor: 'rgba(107,114,128,0.3)' }
      },
      x: {
        title: {
          display: true,
          text: 'Estágio Fenológico',
          color: '#6b7280'
        },
        ticks: { color: '#6b7280' },
        grid: { color: 'rgba(107,114,128,0.15)', borderColor: 'rgba(107,114,128,0.3)' }
      }
    }
  };
  return (
    <div className="h-full">
      <Line options={options} data={chartData} />
    </div>
  );
};
export default PhenologyChart;

