import React from 'react';
import { Link } from 'react-router-dom';
import { Home, User, Calendar } from 'lucide-react';

export default function Navigation() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/home" className="text-xl font-bold text-gray-900">
                Souza.
              </Link>
            </div>
          </div>
          <div className="flex space-x-8">
            <Link
              to="/home"
              className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-700"
            >
              <Home className="h-5 w-5" />
            </Link>
            <Link
              to="/account"
              className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-700"
            >
              <User className="h-5 w-5" />
            </Link>
            <Link
              to="/schedule"
              className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-700"
            >
              <Calendar className="h-5 w-5" />
            </Link>
            <Link
              to="/gallery"
              className="text-gray-900 hover:text-gray-700"
            >
  
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}