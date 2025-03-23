import React from 'react';
import { Link } from 'react-router-dom';
import { Home, User, Calendar, MessageSquare } from 'lucide-react';

export default function Navigation() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/home" className="text-xl font-bold text-gray-900">
                Barbearia
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
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
                <span>Agendar</span>
              </Link>
              <Link to="/chat-schedule" className="flex items-center space-x-2 text-gray-700 hover:text-black">
                <MessageSquare size={20} />
                <span>Agendar via Chat</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}