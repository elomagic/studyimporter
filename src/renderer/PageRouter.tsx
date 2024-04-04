import { Route, Routes } from 'react-router-dom';
import AboutPage from './pages/about/AboutPage';
import ImportPage from './pages/import/ImportPage';
import ConfigurationPage from './pages/configuration/ConfigurationPage';
import ToolsPage from './pages/tools/ToolsPage';
import MainPage from './pages/main/MainPage';

export default function PageRouter() {
  return (
    <Routes>
      <Route path="*" element={<MainPage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="import" element={<ImportPage />} />
      <Route path="tools" element={<ToolsPage />} />
      <Route path="configuration" element={<ConfigurationPage />} />
    </Routes>
  );
}
