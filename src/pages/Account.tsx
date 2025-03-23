import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  site_username: string;
}

export default function Account() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    id: '',
    user_id: '',
    email: '',
    site_username: ''
  });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('id, user_id, email, site_username')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          // Se não encontrar o perfil, cria um novo
          if (error.code === 'PGRST116') {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([
                {
                  user_id: user.id,
                  email: user.email,
                  site_username: user.email?.split('@')[0] || 'usuario'
                }
              ])
              .select('*')
              .single();

            if (createError) throw createError;
            if (newProfile) setProfile(newProfile);
            return;
          }
          throw error;
        }
        
        if (data) {
          setProfile(data);
        }
      } catch (error: any) {
        console.error('Error:', error);
        toast.error('Erro ao carregar perfil');
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não encontrado');

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          site_username: profile.site_username
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      if (newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (passwordError) throw passwordError;
      }

      toast.success('Perfil atualizado com sucesso!');
      setNewPassword('');
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Minha Conta</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={profile.email}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome de Usuário
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={profile.site_username}
                  onChange={(e) => setProfile({ ...profile, site_username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nova Senha (deixe em branco para não alterar)
                </label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}