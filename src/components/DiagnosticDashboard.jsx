import React, { useState, useRef, useEffect } from 'react';
import { Line, Bar, Chart } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    LineController,
    BarController,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import {
    Download,
    Minimize2,
    Maximize2,
    X,
    Thermometer,
    CloudRain,
    Activity,
    Calendar,
    Map as MapIcon,
    Leaf
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Registra componentes do Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    LineController,
    BarController,
    Title,
    Tooltip,
    Legend,
    Filler
);

const FitBounds = ({ polygonCoordinates }) => {
    const map = useMap();
    useEffect(() => {
        if (polygonCoordinates) {
            const bounds = L.polygon(polygonCoordinates).getBounds();
            map.fitBounds(bounds, { padding: [0, 0] });
        }
    }, [map, polygonCoordinates]);
    return null;
};

const DiagnosticDashboard = ({ analysisResult, phenologyData, formData, onClose, polygon }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const dashboardRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    if (!analysisResult || !phenologyData) return null;

    // --- Processamento de Dados ---

    const periods = Object.keys(analysisResult.ndvi.ndvi);
    const stages = phenologyData.estagios.slice(0, periods.length);

    const labels = stages.map(s => s.codigo);

    // Dados para o Gráfico Combinado
    const ndviData = periods.map(p => analysisResult.ndvi.ndvi[p]?.ndvi_mean || 0);
    const precipData = periods.map(p => analysisResult.climate.precipitation[p]?.precipitation_sum || 0);
    const tempData = periods.map(p => analysisResult.climate.temperature[p]?.temperature_mean_celsius || 0);

    const expectedMin = stages.map(s => s.ndvi_esperado_min);
    const expectedMax = stages.map(s => s.ndvi_esperado_max);

    // Configuração do Gráfico
    const chartData = {
        labels,
        datasets: [
            {
                type: 'line',
                label: 'NDVI Observado',
                data: ndviData,
                borderColor: 'rgb(34, 197, 94)', // Green-500
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
                borderWidth: 3,
                yAxisID: 'y',
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                type: 'bar',
                label: 'Precipitação (mm)',
                data: precipData,
                backgroundColor: 'rgba(59, 130, 246, 0.5)', // Blue-500
                yAxisID: 'y1',
                barThickness: 20,
            },
            {
                type: 'line',
                label: 'Temperatura (°C)',
                data: tempData,
                borderColor: 'rgb(249, 115, 22)', // Orange-500
                borderWidth: 2,
                borderDash: [5, 5],
                yAxisID: 'y2',
                pointStyle: 'rectRot',
                pointRadius: 4,
                tension: 0.4,
            },
            // Faixas esperadas (apenas visualização de fundo)
            {
                type: 'line',
                label: 'NDVI Esperado (Máx)',
                data: expectedMax,
                borderColor: 'rgba(156, 163, 175, 0.0)', // Invisível
                backgroundColor: 'rgba(34, 197, 94, 0.1)', // Fundo verde claro
                fill: '+1', // Preenche até o próximo dataset (Mín)
                pointRadius: 0,
                yAxisID: 'y',
            },
            {
                type: 'line',
                label: 'NDVI Esperado (Mín)',
                data: expectedMin,
                borderColor: 'rgba(156, 163, 175, 0.0)',
                fill: false,
                pointRadius: 0,
                yAxisID: 'y',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: { usePointStyle: true, boxWidth: 8 }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1f2937',
                bodyColor: '#4b5563',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 13, weight: 'bold' },
                bodyFont: { size: 12 },
                displayColors: true,
                boxPadding: 4
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 11 } }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: { display: true, text: 'NDVI', color: '#16a34a' },
                min: 0,
                max: 1,
                grid: { color: 'rgba(0,0,0,0.05)' }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: { display: true, text: 'Precipitação (mm)', color: '#3b82f6' },
                grid: { display: false },
                min: 0,
            },
            y2: {
                type: 'linear',
                display: true,
                position: 'right',
                title: { display: true, text: 'Temp (°C)', color: '#f97316' },
                grid: { display: false },
                min: 0,
                max: 50, // Ajuste conforme necessário
            },
        },
    };

    // --- Funções Auxiliares ---

    const getStatus = (obs, min, max) => {
        if (obs === undefined || obs === null) return { label: 'N/D', color: 'bg-gray-100 text-gray-600 border-gray-200' };
        if (obs > max) return { label: 'Excelente', color: 'bg-blue-50 text-blue-700 border-blue-200' };
        if (obs >= min) return { label: 'Normal', color: 'bg-green-50 text-green-700 border-green-200' };
        if (obs >= min * 0.85) return { label: 'Atenção', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
        return { label: 'Crítico', color: 'bg-red-50 text-red-700 border-red-200' };
    };

    const downloadPDF = async () => {
        if (!dashboardRef.current) return;
        setIsDownloading(true);

        try {
            // Pequeno delay para garantir renderização
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(dashboardRef.current, {
                scale: 2, // Melhor qualidade
                useCORS: true, // Para imagens externas (tiles)
                logging: false,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    // Ajusta o elemento clonado para mostrar todo o conteúdo
                    const clonedDashboard = clonedDoc.body.querySelector('[data-dashboard-container]');
                    if (clonedDashboard) {
                        clonedDashboard.style.maxHeight = 'none';
                        clonedDashboard.style.height = 'auto';
                        clonedDashboard.style.overflow = 'visible';

                        // Encontra o container rolável interno e expande
                        const scrollableContent = clonedDashboard.querySelector('.overflow-y-auto');
                        if (scrollableContent) {
                            scrollableContent.style.overflow = 'visible';
                            scrollableContent.style.height = 'auto';
                            scrollableContent.style.maxHeight = 'none';
                        }
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = pdfWidth / imgWidth;
            const imgHeightInPdf = imgHeight * ratio;

            let heightLeft = imgHeightInPdf;
            let position = 0;

            // Adiciona a primeira página
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
            heightLeft -= pdfHeight;

            // Adiciona páginas extras se necessário
            while (heightLeft >= 0) {
                position = heightLeft - imgHeightInPdf;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
                heightLeft -= pdfHeight;
            }

            pdf.save(`Diagnostico_Safra_${formData.plotName}.pdf`);
        } catch (err) {
            console.error("Erro ao gerar PDF:", err);
            alert("Erro ao gerar PDF. Tente novamente.");
        } finally {
            setIsDownloading(false);
        }
    };

    // --- Funções Auxiliares ---

    const buildTileUrl = (tileData) => {
        if (typeof tileData === 'string') return tileData;
        if (!tileData || typeof tileData !== 'object') return null;
        if (tileData.tile_url) return tileData.tile_url;
        if (tileData.url) return tileData.url;
        const mapId = tileData.mapId || tileData.mapid || tileData.map_id || tileData.mapid_value;
        const token = tileData.token || tileData.accessToken || tileData.mapToken;
        if (mapId && token) {
            return `https://earthengine.googleapis.com/map/${mapId}/{z}/{x}/{y}?token=${token}`;
        }
        return null;
    };

    // --- Renderização ---

    if (isMinimized) {
        return (
            <div className="fixed bottom-6 right-6 z-[1000] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-center gap-4 animate-fade-in-up cursor-pointer hover:scale-105 transition-transform" onClick={() => setIsMinimized(false)}>
                <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl text-white shadow-lg shadow-green-200">
                    <Leaf size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 text-sm">Diagnóstico Pronto</h3>
                    <p className="text-xs text-gray-500 font-medium">{formData.plotName}</p>
                </div>
                <button
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors ml-2"
                    title="Maximizar"
                    onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}
                >
                    <Maximize2 size={20} />
                </button>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
            style={{ position: 'fixed', zIndex: 9999 }} // Força ficar na frente do mapa
        >
            <div
                ref={dashboardRef}
                className="w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-200 animate-fade-in-up"
                // A CORREÇÃO ESTÁ AQUI ABAIXO:
                style={{
                    backgroundColor: '#ffffff', // Força cor branca sólida (ignora Tailwind)
                    opacity: 1,                 // Garante opacidade total
                    position: 'relative',       // Cria novo contexto de empilhamento
                    zIndex: 10000,              // Garante que o conteúdo fique acima de tudo
                    isolation: 'isolate'        // Impede mistura de cores com o fundo
                }}
                data-dashboard-container="true"
            >
                {/* --- Cabeçalho --- */}
                <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-start sticky top-0 z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-green-200">
                                Relatório de Diagnóstico
                            </span>
                            <span className="text-gray-400 text-xs font-medium">Gerado em {new Date().toLocaleDateString()}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{formData.plotName}</h1>
                        <div className="flex items-center gap-6 mt-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                <Leaf size={16} className="text-green-500" />
                                <span className="font-medium">{phenologyData.cultura}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                <Calendar size={16} className="text-blue-500" />
                                <span className="font-medium">Início: {new Date(formData.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                <MapIcon size={16} className="text-purple-500" />
                                <span className="font-medium">{stages.length} Estágios Analisados</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 no-print">
                        <button
                            onClick={downloadPDF}
                            disabled={isDownloading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={18} />
                            {isDownloading ? 'Gerando...' : 'Baixar PDF'}
                        </button>
                        <div className="h-8 w-px bg-gray-200 mx-1"></div>
                        <button
                            onClick={() => setIsMinimized(true)}
                            className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
                            title="Minimizar"
                        >
                            <Minimize2 size={20} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2.5 hover:bg-red-50 rounded-xl text-red-500 transition-colors"
                            title="Fechar"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto p-8 space-y-8 bg-slate-50 custom-scrollbar">

                    {/* --- Painel de Telemetria --- */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <Activity size={24} />
                                </div>
                                Telemetria da Safra
                            </h2>
                            <div className="flex gap-6 text-xs font-medium text-gray-500 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                                <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm"></div> NDVI (Vigor)</span>
                                <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></div> Precipitação</span>
                                <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm"></div> Temperatura</span>
                            </div>
                        </div>
                        <div className="h-96 w-full">
                            <Chart type='bar' data={chartData} options={chartOptions} />
                        </div>
                    </div>

                    {/* --- Linha do Tempo Agronômica --- */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                <Calendar size={24} />
                            </div>
                            Evolução Fenológica
                        </h2>
                        <div className="flex gap-5 overflow-x-auto pb-6 pt-2 snap-x custom-scrollbar">
                            {stages.map((stage, idx) => {
                                const periodKey = periods[idx];
                                const obsNdvi = analysisResult.ndvi.ndvi[periodKey]?.ndvi_mean;
                                const precip = analysisResult.climate.precipitation[periodKey]?.precipitation_sum;
                                const temp = analysisResult.climate.temperature[periodKey]?.temperature_mean_celsius;
                                const status = getStatus(obsNdvi, stage.ndvi_esperado_min, stage.ndvi_esperado_max);

                                return (
                                    <div key={idx} className="min-w-[300px] bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 snap-center flex flex-col relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gray-200 to-transparent group-hover:from-blue-400 transition-colors"></div>

                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded">Estágio {idx + 1}</span>
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${status.color} shadow-sm`}>
                                                {status.label}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-gray-800 text-xl mb-1 leading-tight">{stage.codigo}</h3>

                                        {/* Exibe o período de datas */}
                                        <div className="flex items-center gap-1 mb-2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                                            <Calendar size={12} />
                                            <span>
                                                {(analysisResult.periods?.[idx] || analysisResult.customPeriods?.[idx]) ? (
                                                    `${new Date((analysisResult.periods?.[idx] || analysisResult.customPeriods?.[idx]).startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - ${new Date((analysisResult.periods?.[idx] || analysisResult.customPeriods?.[idx]).endDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
                                                ) : '-'}
                                            </span>
                                        </div>

                                        <p className="text-xs text-gray-500 mb-5 h-10 overflow-hidden leading-relaxed">{stage.descricao}</p>

                                        <div className="space-y-3 mt-auto bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600 font-medium">NDVI Médio</span>
                                                <span className="font-mono font-bold text-gray-800 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm">{obsNdvi?.toFixed(2) || '-'}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full shadow-sm"
                                                    style={{ width: `${Math.min((obsNdvi || 0) * 100, 100)}%` }}
                                                ></div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/50">
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <CloudRain size={14} className="text-blue-500" />
                                                    <span className="font-medium">{precip?.toFixed(1) || 0}mm</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <Thermometer size={14} className="text-orange-500" />
                                                    <span className="font-medium">{temp?.toFixed(1) || 0}°C</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* --- Galeria de Análise Espacial --- */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                <MapIcon size={24} />
                            </div>
                            Análise Espacial (NDVI)
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                            {periods.map((periodKey, idx) => {
                                const tileData = analysisResult.ndvi.ndvi_tiles?.[periodKey] || analysisResult.ndvi.tiles?.[periodKey];
                                const tileUrl = buildTileUrl(tileData);
                                // Converter GeoJSON [lon, lat] para Leaflet [lat, lon]
                                const polygonCoordinates = polygon?.geometry?.coordinates?.[0]?.map(coord => [coord[1], coord[0]]);

                                return (
                                    <div key={idx} className="aspect-square bg-white rounded-2xl border border-gray-200 overflow-hidden relative group shadow-sm hover:shadow-md transition-all">
                                        {tileUrl && polygonCoordinates ? (
                                            <MapContainer
                                                zoom={13}
                                                zoomControl={false}
                                                dragging={false}
                                                scrollWheelZoom={false}
                                                doubleClickZoom={false}
                                                touchZoom={false}
                                                attributionControl={false}
                                                style={{ height: '100%', width: '100%' }}
                                            >
                                                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                                                <TileLayer url={tileUrl} opacity={1} />
                                                <Polygon positions={polygonCoordinates} pathOptions={{ color: 'white', fillOpacity: 0, weight: 2 }} />
                                                <FitBounds polygonCoordinates={polygonCoordinates} />
                                            </MapContainer>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 bg-slate-50">
                                                <MapIcon size={48} opacity={0.2} />
                                                <span className="text-xs font-medium mt-2 opacity-50">Tile Indisponível</span>
                                            </div>
                                        )}

                                        <div className="absolute top-0 left-0 w-full p-3 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-[400]">
                                            <span className="text-white text-xs font-bold shadow-sm tracking-wide">{stages[idx]?.codigo}</span>
                                        </div>

                                        <div className="absolute bottom-0 left-0 w-full p-2 bg-white/90 backdrop-blur-sm text-center border-t border-gray-100 z-[400]">
                                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                                                <Maximize2 size={10} />
                                                Expandir
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DiagnosticDashboard;
