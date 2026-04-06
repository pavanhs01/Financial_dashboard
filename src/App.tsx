import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './AppShell';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/*" element={<AppShell />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
