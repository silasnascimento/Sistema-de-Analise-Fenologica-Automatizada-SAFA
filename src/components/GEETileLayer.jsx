import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const GEETileLayer = ({ url, opacity = 0.8, zIndex = 10, name }) => {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!url || !map) return;

    console.log(`🗺️ Creating GEE Tile Layer for ${name}:`, url);

    // Cria uma camada de tile personalizada para Google Earth Engine
    const tileLayer = L.tileLayer(url, {
      attribution: 'Google Earth Engine',
      crossOrigin: 'anonymous',
      maxZoom: 18,
      minZoom: 1,
      tileSize: 256,
      zoomOffset: 0,
      bounds: [[-90, -180], [90, 180]],
      noWrap: false,
      updateWhenZooming: false,
      keepBuffer: 2,
      maxNativeZoom: 18,
      opacity: opacity,
      zIndex: zIndex,
      // Configurações específicas para GEE
      subdomains: [],
      errorTileUrl: '',
      // Força o carregamento
      detectRetina: false,
      // Configurações de cache
      useCache: true,
      cacheMaxAge: 24 * 60 * 60 * 1000, // 24 horas
    });

    // Adiciona event listeners para debug
    tileLayer.on('loading', () => {
      console.log(`🔄 Loading tiles for ${name}`);
    });

    tileLayer.on('load', () => {
      console.log(`✅ Tiles loaded successfully for ${name}`);
    });

    tileLayer.on('tileerror', (error) => {
      console.error(`❌ Tile error for ${name}:`, error);
      // Tenta recarregar o tile após um delay
      setTimeout(() => {
        if (layerRef.current && map.hasLayer(layerRef.current)) {
          layerRef.current.redraw();
        }
      }, 2000);
    });

    tileLayer.on('tileload', (event) => {
      console.log(`📦 Tile loaded for ${name}:`, event.tile.src);
    });

    tileLayer.on('tileloadstart', (event) => {
      console.log(`🚀 Starting to load tile for ${name}:`, event.tile.src);
    });

    // Armazena a referência da camada
    layerRef.current = tileLayer;

    // Adiciona a camada ao mapa
    map.addLayer(tileLayer);

    // Cleanup function
    return () => {
      if (layerRef.current && map.hasLayer(layerRef.current)) {
        map.removeLayer(layerRef.current);
        console.log(`🗑️ Removed tile layer for ${name}`);
      }
    };
  }, [url, map, opacity, zIndex, name]);

  return null; // Este componente não renderiza nada visualmente
};

export default GEETileLayer;
