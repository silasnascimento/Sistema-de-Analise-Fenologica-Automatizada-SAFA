import './index.css';
import Map from './components/Map';

function App() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">SAFA - Mapa Interativo</h1>
      <Map />
    </div>
  );
}

export default App;