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

export default function HomePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const fetchUserData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Get user's appointments using profile id
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', profileData.id)
        .eq('status', 'scheduled')
        .order('date', { ascending: true });

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Fetch data every 30 seconds
  useEffect(() => {
    // Fetch immediately
    fetchUserData();

    // Set up interval for periodic updates
    const intervalId = setInterval(fetchUserData, 1000); // 30 seconds

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Logout realizado com sucesso!');
      window.location.href = 'https://barbsaas.vercel.app';
    } catch (error: any) {
      toast.error('Erro ao fazer logout');
      console.error('Erro:', error.message);
    }
  };

  return (
    <div>
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
                <HomeIcon className="h-5 w-5" />
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
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-700"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Bem-vindo, {profile?.bio || 'Usuário'}!
            </h2>
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Seus agendamentos:
              </h3>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <p className="text-gray-900">
                        Dia: {format(parseISO(appointment.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                      <p className="text-gray-900">
                        Horário: {appointment.time.slice(0, 5)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  Você não tem nenhum agendamento marcado.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}