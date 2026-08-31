import Link from 'next/link';
import { Button } from '@/components/ui';
import { HomeIcon, SearchIcon, HeartIcon } from 'lucide-react';

/**
 * Pet Not Found Page
 * Displayed when a pet ID is not found
 */
export default function PetNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          {/* Sad Pet Icon */}
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">🐕‍🦺</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Pet não encontrado
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            O pet que você está procurando pode ter sido adotado, removido da plataforma 
            ou o link pode estar incorreto.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/pets">
              <Button variant="primary" size="large" className="w-full">
                <SearchIcon size={20} />
                Ver todos os pets
              </Button>
            </Link>

            <Link href="/">
              <Button variant="outline" size="large" className="w-full">
                <HomeIcon size={20} />
                Voltar ao início
              </Button>
            </Link>
          </div>

          {/* Suggestion */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <HeartIcon size={16} className="text-blue-600" />
              <span className="font-medium text-blue-900 text-sm">
                Sugestão
              </span>
            </div>
            <p className="text-blue-800 text-sm">
              Que tal conhecer outros pets disponíveis para adoção? 
              Temos muitos animais esperando por um lar amoroso!
            </p>
          </div>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-sm text-gray-500">
          Se você chegou aqui através de um link que deveria funcionar, 
          entre em contato conosco para que possamos ajudá-lo.
        </p>
      </div>
    </div>
  );
}