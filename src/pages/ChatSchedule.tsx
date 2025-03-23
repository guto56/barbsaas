import React, { useState, useRef, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { supabase } from '../lib/supabase';
import { format, parseISO, startOfDay as startOfDayFn } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatSchedule() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou o assistente virtual da barbearia. Como posso ajudar você a agendar seu horário hoje?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: history, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (history && history.length > 0) {
        const formattedMessages = history.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('chat_history')
        .insert([
          {
            user_id: user.id,
            role,
            content
          }
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    await saveMessage('user', userMessage);
    setLoading(true);

    try {
      // Chamar a API do DeepSeek
      const response = await fetch(process.env.REACT_APP_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `Você é um assistente virtual de uma barbearia. Sua função é ajudar os clientes a agendar horários.
              Quando o cliente mencionar uma data e horário, você deve:
              1. Confirmar a data e horário mencionados
              2. Responder com "AGENDAR: [data] [horário]" (exemplo: "AGENDAR: 25/03/2024 14:00")
              Se o cliente não mencionar data e horário, continue a conversa normalmente.`
            },
            ...messages,
            { role: 'user', content: userMessage }
          ]
        })
      });

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;

      // Verificar se a mensagem contém um comando de agendamento
      if (assistantMessage.startsWith('AGENDAR:')) {
        const [, dateTime] = assistantMessage.split(':');
        const [date, time] = dateTime.trim().split(' ');
        
        // Converter a data do formato DD/MM/YYYY para YYYY-MM-DD
        const [day, month, year] = date.split('/');
        const formattedDate = `${year}-${month}-${day}`;

        // Verificar se o horário já está reservado
        const { data: existingAppointment } = await supabase
          .from('appointments')
          .select('time')
          .eq('date', formattedDate)
          .eq('time', time)
          .eq('status', 'scheduled')
          .single();

        if (existingAppointment) {
          const errorMessage = 'Desculpe, este horário já está reservado. Por favor, escolha outro horário.';
          setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
          await saveMessage('assistant', errorMessage);
          return;
        }

        // Obter o usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não encontrado');

        // Obter ou criar perfil do usuário
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

        // Criar o agendamento
        const { error: appointmentError } = await supabase
          .from('appointments')
          .insert([
            {
              user_id: profileId,
              date: formattedDate,
              time: time,
              status: 'scheduled'
            },
          ]);

        if (appointmentError) throw appointmentError;

        const successMessage = `Perfeito! Seu agendamento foi realizado com sucesso para ${date} às ${time}.`;
        setMessages(prev => [...prev, { role: 'assistant', content: successMessage }]);
        await saveMessage('assistant', successMessage);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        await saveMessage('assistant', assistantMessage);
      }
    } catch (error: any) {
      console.error('Erro:', error);
      const errorMessage = 'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.';
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
      await saveMessage('assistant', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Agendar via Chat
            </h2>
            
            <div className="h-[500px] overflow-y-auto mb-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 rounded-lg p-3">
                    Digitando...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 