import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import { supabase } from '../lib/supabase';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';

const AVAILABLE_HOURS = Array.from({ length: 9 }, (_, i) => `${i + 14}:00`);

export default function Schedule() {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Get next 30 days for date selection
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(new Date(), i + 1);
    return format(date, 'yyyy-MM-dd');
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      toast.error('Selecione uma data e horário');
      return;
    }

    setLoading(true);

    try {
      // Check if the time slot is available
      const { data: existingAppointment } = await supabase
        .from('appointments')
        .select('id')
        .eq('date', selectedDate)
        .eq('time', selectedTime)
        .eq('status', 'scheduled')
        .single();

      if (existingAppointment) {
        throw new Error('Este horário já está reservado');
      }

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não encontrado');

      // Get or create profile for the user
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let profileId;

      if (existingProfile) {
        profileId = existingProfile.id;
      } else {
        // Create new profile if it doesn't exist
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: user.id,
              display_name: user.email // ou outro valor padrão
            }
          ])
          .select('id')
          .single();

        if (profileError) throw profileError;
        profileId = newProfile.id;
      }

      // Create the appointment using the profile id
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert([
          {
            user_id: profileId, // Usando o ID do perfil aqui
            date: selectedDate,
            time: selectedTime,
            status: 'scheduled'
          },
        ]);

      if (appointmentError) throw appointmentError;

      toast.success('Agendamento realizado com sucesso!');
      setSelectedDate('');
      setSelectedTime('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Agendar
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Selecione a data
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Selecione uma data</option>
                  {availableDates.map((date) => (
                    <option key={date} value={date}>
                      {format(new Date(date), 'dd/MM/yyyy')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Selecione o horário
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Selecione um horário</option>
                  {AVAILABLE_HOURS.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading || !selectedDate || !selectedTime}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  {loading ? 'Agendando...' : 'Agendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}