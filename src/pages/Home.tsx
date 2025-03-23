import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { supabase } from '../lib/supabase';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

  return (
    <div>
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Bem-vindo, {profile?.display_name || 'Usuário'}!
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