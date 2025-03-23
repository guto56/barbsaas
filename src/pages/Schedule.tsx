import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { supabase } from '../lib/supabase';
import { format, addDays, isBefore, startOfDay, isWeekend, getDay, parseISO, setHours, setMinutes, startOfDay as startOfDayFn } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import toast from 'react-hot-toast';

// Generate time slots for weekdays (13:00 to 19:00 with 50-minute intervals)
const WEEKDAY_SLOTS = Array.from({ length: 8 }, (_, i) => {
  const hour = 13 + Math.floor(i * 50 / 60);
  const minute = (i * 50) % 60;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

// Generate time slots for weekends (8:00 to 10:30 and 13:00 to 19:00)
const WEEKEND_MORNING_SLOTS = Array.from({ length: 6 }, (_, i) => {
  const hour = 8 + Math.floor(i * 30 / 60);
  const minute = (i * 30) % 60;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

const WEEKEND_AFTERNOON_SLOTS = Array.from({ length: 8 }, (_, i) => {
  const hour = 13 + Math.floor(i * 50 / 60);
  const minute = (i * 50) % 60;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

const WEEKEND_SLOTS = [...WEEKEND_MORNING_SLOTS, ...WEEKEND_AFTERNOON_SLOTS];

export default function Schedule() {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  // Fetch booked slots when date is selected
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDate) return;

      // Format date in YYYY-MM-DD format for database query
      const formattedDate = format(startOfDayFn(selectedDate), 'yyyy-MM-dd');
      const { data: appointments } = await supabase
        .from('appointments')
        .select('time')
        .eq('date', formattedDate)
        .eq('status', 'scheduled');

      if (appointments) {
        setBookedSlots(appointments.map(apt => apt.time));
      }
    };

    fetchBookedSlots();
  }, [selectedDate]);

  // Update available slots when date is selected or booked slots change
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const slots = isWeekend(selectedDate) ? WEEKEND_SLOTS : WEEKDAY_SLOTS;
    setAvailableSlots(slots.filter(slot => !bookedSlots.includes(slot)));
  }, [selectedDate, bookedSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      toast.error('Selecione uma data e horário');
      return;
    }

    setLoading(true);

    try {
      // Format the date in YYYY-MM-DD format for database storage
      const formattedDate = format(startOfDayFn(selectedDate), 'yyyy-MM-dd');

      // Check if the time slot is already booked
      const { data: existingAppointment } = await supabase
        .from('appointments')
        .select('time')
        .eq('date', formattedDate)
        .eq('time', selectedTime)
        .eq('status', 'scheduled')
        .single();

      if (existingAppointment) {
        toast.error('Este horário já foi reservado. Por favor, selecione outro horário.');
        setLoading(false);
        return;
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
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: user.id,
              display_name: user.email
            }
          ])
          .select('id')
          .single();

        if (profileError) throw profileError;
        profileId = newProfile.id;
      }

      // Create the appointment with the correct date
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert([
          {
            user_id: profileId,
            date: formattedDate,
            time: selectedTime,
            status: 'scheduled'
          },
        ]);

      if (appointmentError) throw appointmentError;

      toast.success('Agendamento realizado com sucesso!');
      setSelectedDate(undefined);
      setSelectedTime('');
      setAvailableSlots([]);
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecione a data
                </label>
                <div className="flex justify-center">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => isBefore(date, startOfDay(new Date()))}
                    className="border rounded-lg p-4"
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex",
                      head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                      row: "flex w-full mt-2",
                      cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                      day_selected: "bg-gray-900 text-white hover:bg-gray-900 focus:bg-gray-900",
                      day_today: "bg-gray-100 text-gray-900",
                      day_outside: "text-gray-400 opacity-50",
                      day_disabled: "text-gray-400 opacity-50",
                      day_range_middle: "aria-selected:bg-gray-100 aria-selected:text-gray-900",
                      day_hidden: "invisible",
                    }}
                  />
                </div>
              </div>
              
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecione o horário
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {availableSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 rounded-full text-sm font-medium transition-colors
                          ${selectedTime === time 
                            ? 'bg-gray-900 text-white hover:bg-gray-700' 
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                  {availableSlots.length === 0 && (
                    <p className="text-gray-500 text-sm mt-2">
                      Não há horários disponíveis para esta data.
                    </p>
                  )}
                </div>
              )}

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