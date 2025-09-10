import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const GEETileLayerWithEvents = ({ url, opacity = 0.8, zIndex = 10, name, ...props }) => {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!url || !map) return;

    // Encontra a camada de tile correspondente no mapa
    const findTileLayer = () => {
      const layers = map._layers;
      for (const layerId in layers) {
        const layer = layers[layerId];
        if (layer instanceof L.TileLayer && layer._url === url) {
          return layer;
        }
      }
      return null;
    };

    // Aguarda um pouco para a camada ser criada
    const timer = setTimeout(() => {
      const tileLayer = findTileLayer();
      if (tileLayer && !layerRef.current) {
        layerRef.current = tileLayer;
        
        console.log(`🗺️ Found GEE Tile Layer for ${name}:`, url);

        // Adiciona event listeners para debug
        tileLayer.on('loading', () => {
          console.log(`🔄 Loading tiles for ${name}`);
        });

        tileLayer.on('load', () => {
          console.log(`✅ Tiles loaded successfully for ${name}`);
        });

        tileLayer.on('tileerror', (error) => {
          console.error(`❌ Tile error for ${name}:`, error);
        });

        tileLayer.on('tileload', (event) => {
          console.log(`📦 Tile loaded for ${name}:`, event.tile.src);
        });

        tileLayer.on('tileloadstart', (event) => {
          console.log(`🚀 Starting to load tile for ${name}:`, event.tile.src);
        });
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (layerRef.current) {
        layerRef.current.off('loading load tileerror tileload tileloadstart');
        layerRef.current = null;
      }
    };
  }, [url, map, name]);

  return null; // Este componente não renderiza nada visualmente
};

export default GEETileLayerWithEvents;
