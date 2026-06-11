import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from "react-toastify";

import SuperAdminLogin from './components/superadmin/SuperAdminLogin';
import SuperAdminApp from './components/superadmin/SuperAdminApp';
import './App.css'

function App() {


  return (
    <>
    <ToastContainer/>
    <BrowserRouter>
    <Routes>
      <Route path="/login" element={<SuperAdminLogin />} />
      <Route path="/*" element={<SuperAdminApp />} />
      <Route path="/dashboard" element={<SuperAdminApp />} />
    </Routes>
    </BrowserRouter>
    </>
  )
}
export default App
