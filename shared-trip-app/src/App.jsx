import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Tracking from './pages/Tracking';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/track/:token" element={<Tracking />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
