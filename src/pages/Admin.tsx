import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Appointment {
  id: string;
  user_id: string;
  profiles: {
    bio: string;
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

  const fetchAppointments = async () => {
    try {
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          id,
          user_id,
          date,
          time,
          status,
          profiles!appointments_user_id_fkey (
            bio
          )
        `)
        .eq('status', 'scheduled')
        .order('date', { ascending: true });

      if (error) throw error;

      const transformedAppointments = appointmentsData.map(apt => ({
        ...apt,
        profiles: {
          bio: apt.profiles?.bio || 'Nome não informado'
        }
      })) as Appointment[];

      setAppointments(transformedAppointments);
    } catch (error: any) {
      console.error('Erro ao buscar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    }
  };

  // Atualização automática a cada 1 segundo (como na Home)
  useEffect(() => {
    if (authenticated) {
      // Buscar dados imediatamente
      fetchAppointments();

      // Configurar intervalo para atualizações periódicas (1 segundo como na Home)
      const intervalId = setInterval(fetchAppointments, 1000);

      // Limpar intervalo ao desmontar
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [authenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {

      if (formData.username !== 'adminbarber' || formData.password !== 'byguto') {
        throw new Error('Credenciais inválidas');
      }

      await fetchAppointments(); // Buscar dados imediatamente após login
      setAuthenticated(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      // Primeiro atualiza o status para cancelled
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (updateError) throw updateError;

      // Depois deleta o registro
      const { error: deleteError } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Remove o agendamento da lista local
      setAppointments(appointments.filter(app => app.id !== id));
      toast.success('Agendamento cancelado e removido com sucesso!');
    } catch (error: any) {
      console.error('Erro ao cancelar agendamento:', error);
      toast.error('Erro ao cancelar agendamento');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      toast.loading('Enviando imagem...');

      // Upload simples
      const fileName = `${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      // Save to gallery
      const { error: dbError } = await supabase
        .from('gallery')
        .insert([{ image_url: publicUrl }]);

      if (dbError) throw dbError;

      toast.dismiss();
      toast.success('Imagem enviada com sucesso!');
      
    } catch (error: any) {
      toast.dismiss();
      console.error('Erro detalhado:', error);
      toast.error('Erro ao enviar imagem');
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
                Painel Administrativo
              </h2>
              <div className="flex gap-4">
                <label className="cursor-pointer px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <Upload className="w-5 h-5 inline-block mr-2" />
                  Adicionar Foto
                </label>
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm font-medium text-gray-900 hover:text-gray-700"
                >
                  Sair
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex justify-between items-center"
                >
                  <div>
                    <p className="text-gray-900 font-medium">
                      Cliente: {appointment.profiles.bio}
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