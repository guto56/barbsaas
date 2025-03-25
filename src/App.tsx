import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Account from './pages/Account';
import Schedule from './pages/Schedule';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import ChatSchedule from './pages/ChatSchedule';
import Gallery from './pages/Gallery';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/account" element={<Account />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/chat-schedule" element={<ChatSchedule />} />
            <Route path="/gallery" element={<Gallery />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;