import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, User, Calendar, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Navigation() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex space-x-6">
          <Link to="/home" className="flex items-center space-x-2 text-gray-700 hover:text-black">
            <Home size={20} />
            <span>Início</span>
          </Link>
          <Link to="/account" className="flex items-center space-x-2 text-gray-700 hover:text-black">
            <User size={20} />
            <span>Conta</span>
          </Link>
          <Link to="/schedule" className="flex items-center space-x-2 text-gray-700 hover:text-black">
            <Calendar size={20} />
            <span>Agendar Corte</span>
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 text-gray-700 hover:text-black"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </nav>
  );
}