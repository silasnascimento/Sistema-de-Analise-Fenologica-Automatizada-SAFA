import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, LayersControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-draw';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import GEETileLayerWithEvents from './GEETileLayerWithEvents';

// Código de correção do ícone padrão
let DefaultIcon = L.icon({
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Componente interno para a busca de endereço (Geocoding)
const GeoSearchHandler = () => {
  const map = useMap();
  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider: provider,
      style: 'bar',
      showMarker: true,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
    });
    map.addControl(searchControl);
    return () => map.removeControl(searchControl);
  }, [map]);
  return null;
};

// Componente interno para o controle de desenho
const DrawHandler = ({ onPolygonCreated, onPolygonEdited, onPolygonDeleted }) => {
  const map = useMap();
  const drawnItemsRef = useRef(new L.FeatureGroup());

  useEffect(() => {
    map.addLayer(drawnItemsRef.current);
    const drawControl = new L.Control.Draw({
      position: 'topright',
      edit: { featureGroup: drawnItemsRef.current },
      draw: {
        polygon: {
          allowIntersection: false,
          shapeOptions: { color: '#4CAF50' },
        },
        polyline: false, rectangle: false, circle: false, marker: false, circlemarker: false,
      },
    });
    map.addControl(drawControl);

    const handleCreated = (e) => {
      const layer = e.layer;
      drawnItemsRef.current.addLayer(layer);
      onPolygonCreated(layer.toGeoJSON());
    };
    const handleEdited = (e) => {
      const layers = e.layers.getLayers();
      if (layers.length > 0) onPolygonEdited(layers[0].toGeoJSON());
    };
    const handleDeleted = () => onPolygonDeleted();

    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.EDITED, handleEdited);
    map.on(L.Draw.Event.DELETED, handleDeleted);

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.off(L.Draw.Event.EDITED, handleEdited);
      map.off(L.Draw.Event.DELETED, handleDeleted);
      map.removeControl(drawControl);
    };
  }, [map, onPolygonCreated, onPolygonEdited, onPolygonDeleted]);

  return null;
};

// O componente Map agora recebe os resultados da análise
const Map = ({ onPolygonCreated, onPolygonEdited, onPolygonDeleted, analysisResult, phenologyData, activeTab }) => {
  const position = [-27.7801, -52.9292];

  return (
    <MapContainer center={position} zoom={10} style={{ height: '100%', width: '100%' }}>
      {/* Controle de Basemaps */}
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Mapa Claro (CartoDB)">
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Padrão (OpenStreetMap)">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satélite (Esri)">
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community' />
        </LayersControl.BaseLayer>
      </LayersControl>
      
      {/* Controle de Camadas NDVI (renderizado condicionalmente) */}
      {analysisResult && analysisResult.ndvi && (() => {
        // Tenta diferentes possíveis estruturas de dados para os tiles
        const tilesData = analysisResult.ndvi.ndvi_tiles || 
                         analysisResult.ndvi.tiles || 
                         analysisResult.ndvi.layers;
        
        if (!tilesData || Object.keys(tilesData).length === 0) {
          return null;
        }

        return (
          <LayersControl position="topleft">
            {Object.keys(tilesData).map((periodKey) => {
              const tileData = tilesData[periodKey];
              const tileUrl = tileData?.tile_url || tileData?.url || tileData;

              console.log(`🔍 Tile Debug - ${periodKey}:`, {
                tileData,
                tileUrl,
                isValid: tileUrl && typeof tileUrl === 'string'
              });

              if (!tileUrl || typeof tileUrl !== 'string') return null;

              // Para análise fenológica, usa o nome do estágio
              // Para análise avulsa, usa "Período X"
              let layerName;
              if (activeTab === 'phenological' && phenologyData) {
                const stageIndex = parseInt(periodKey.split('_')[1]) - 1;
                layerName = phenologyData.estagios[stageIndex]?.codigo || periodKey;
              } else {
                const periodIndex = parseInt(periodKey.split('_')[1]);
                layerName = `Período ${periodIndex}`;
              }

              return (
                <LayersControl.Overlay key={periodKey} name={layerName}>
                  <TileLayer
                    url={tileUrl}
                    opacity={0.8}
                    zIndex={10}
                    attribution="Google Earth Engine"
                    crossOrigin="anonymous"
                    maxZoom={18}
                    minZoom={1}
                    tileSize={256}
                    zoomOffset={0}
                    bounds={[[-90, -180], [90, 180]]}
                    noWrap={false}
                    updateWhenZooming={false}
                    keepBuffer={2}
                    maxNativeZoom={18}
                    detectRetina={false}
                    subdomains={[]}
                    errorTileUrl=""
                  />
                  <GEETileLayerWithEvents
                    url={tileUrl}
                    opacity={0.8}
                    zIndex={10}
                    name={layerName}
                  />
                </LayersControl.Overlay>
              );
            })}
          </LayersControl>
        );
      })()}

      {/* CORREÇÃO: Readicionando os manipuladores de funcionalidade */}
      <DrawHandler
        onPolygonCreated={onPolygonCreated}
        onPolygonEdited={onPolygonEdited}
        onPolygonDeleted={onPolygonDeleted}
      />
      <GeoSearchHandler />

    </MapContainer>
  );
};

export default Map;