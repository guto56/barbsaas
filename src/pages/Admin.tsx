import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Appointment {
  id: string;
  user_id: string;
  profiles: {
    display_name: string;
  };
  date: string;
  time: string;
  status: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.username !== 'adminbarber' || formData.password !== 'byguto') {
        throw new Error('Credenciais inválidas');
      }

      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          id,
          user_id,
          date,
          time,
          status,
          profiles!appointments_user_id_fkey (
            display_name
          )
        `)
        .eq('status', 'scheduled')
        .order('date', { ascending: true });

      if (error) throw error;

      // Transform the data to match the Appointment interface
      const transformedAppointments = appointmentsData.map(apt => ({
        ...apt,
        profiles: {
          display_name: apt.profiles?.display_name || 'Sem nome'
        }
      }));

      setAppointments(transformedAppointments);
      setAuthenticated(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      setAppointments(appointments.filter(app => app.id !== id));
      toast.success('Agendamento cancelado com sucesso!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Scissors className="mx-auto h-12 w-12 text-gray-900" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Área Administrativa
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  type="text"
                  required
                  className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Usuário"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Senha"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-gray-900 hover:text-gray-700"
              >
                Voltar para login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Agendamentos
              </h2>
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-gray-900 hover:text-gray-700"
              >
                Sair
              </button>
            </div>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex justify-between items-center"
                >
                  <div>
                    <p className="text-gray-900 font-medium">
                      Cliente: {appointment.profiles.display_name}
                    </p>
                    <p className="text-gray-600">
                      Data: {format(parseISO(appointment.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-gray-600">
                      Horário: {appointment.time.slice(0, 5)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCancelAppointment(appointment.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Cancelar
                  </button>
                </div>
              ))}
              {appointments.length === 0 && (
                <p className="text-gray-600 text-center">
                  Não há agendamentos no momento.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}