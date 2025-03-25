import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { supabase } from '../lib/supabase';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Home as HomeIcon, User, Calendar, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Appointment {
  id: string;
  user_id: string;
  date: string;
  time: string;
  status: string;
}

interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
}

export default function Home() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button
                onClick={() => navigate('/schedule')}
                className="flex items-center justify-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <Calendar className="w-6 h-6 mr-2" />
                <span>Agendar Horário</span>
              </button>
              <button
                onClick={() => navigate('/account')}
                className="flex items-center justify-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <User className="w-6 h-6 mr-2" />
                <span>Minha Conta</span>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center justify-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <LogOut className="w-6 h-6 mr-2" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}