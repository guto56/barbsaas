import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface GalleryImage {
  id: string;
  image_url: string;
  created_at: string;
}

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar imagens:', error);
        throw error;
      }

      setImages(data || []);
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
      toast.error('Erro ao carregar imagens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Buscar dados imediatamente
    fetchImages();

    // Configurar intervalo para atualizações periódicas (1 segundo)
    const intervalId = setInterval(fetchImages, 1000);

    // Limpar intervalo ao desmontar
    return () => {
      clearInterval(intervalId);
    };
  }, []); // Array vazio significa que o efeito roda apenas uma vez ao montar

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Galeria de Fotos
            </h2>
            
            {loading ? (
              <div className="text-center py-4">Carregando...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={image.image_url}
                      alt="Foto da galeria"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Erro ao carregar imagem:', image.image_url);
                        e.currentTarget.src = 'https://via.placeholder.com/300?text=Erro+ao+carregar';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {!loading && images.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                Nenhuma foto na galeria ainda.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 