import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { Layout } from './components/Layout';

// Pages
import { HomePage } from './pages/HomePage';
import { GuardianPage } from './pages/GuardianPage';
import { LemurPage } from './pages/LemurPage';
import { DFRPage } from './pages/DFRPage';
import { DronesPage } from './pages/DronesPage';
import { SolutionsPage } from './pages/SolutionsPage';
import { SolutionDetailPage } from './pages/SolutionDetailPage';
import { ContactPage } from './pages/ContactPage';

// Wrapper for AnimatePresence to work with routes
function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/guardian" element={<GuardianPage />} />
        <Route path="/lemur" element={<LemurPage />} />
        <Route path="/drones" element={<DronesPage />} />
        <Route path="/dfr" element={<DFRPage />} />
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/solutions/:slug" element={<SolutionDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </BrowserRouter>
  );
}
