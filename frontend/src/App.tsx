import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import StationPage from './pages/StationPage';
import QRCodesPage from './pages/QRCodesPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/station/:id" element={<StationPage />} />
        <Route path="/qrcodes" element={<QRCodesPage />} />
      </Routes>
    </BrowserRouter>
  );
}
