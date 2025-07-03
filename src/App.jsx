import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import SuperAdminLogin from './components/superadmin/SuperAdminLogin';
import SuperAdminDashboard from './components/superadmin/SuperAdminDashboard';
import SuperAdminApp from './components/superadmin/SuperAdminApp';
import './App.css'

function App() {


  return (
    <BrowserRouter>
    <Routes>
      <Route path="/superadmin/login" element={<SuperAdminLogin />} />
      <Route path="/superadmin/*" element={<SuperAdminApp />} />
      <Route path="/superadmin/dashboard" element={<SuperAdminApp />} />
    </Routes>
    </BrowserRouter>
  )
}
export default App
