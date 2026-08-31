'use client';

import { useState } from 'react';
import Layout from '@/components/common/Layout';
import Button from '@/components/ui/Button';

export default function TestLayoutPage() {
  const [showNavigation, setShowNavigation] = useState(true);
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(true);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Test Layout', href: '/test-layout' }
  ];

  return (
    <Layout 
      title="Teste do Sistema de Layout"
      breadcrumbs={showBreadcrumbs ? breadcrumbs : []}
      showNavigation={showNavigation}
      showBreadcrumbs={showBreadcrumbs}
    >
      <div className="container">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Controles do Layout</h2>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <Button 
              variant={showNavigation ? 'primary' : 'outline'}
              onClick={() => setShowNavigation(!showNavigation)}
            >
              {showNavigation ? 'Ocultar' : 'Mostrar'} Navigation
            </Button>
            
            <Button 
              variant={showBreadcrumbs ? 'primary' : 'outline'}
              onClick={() => setShowBreadcrumbs(!showBreadcrumbs)}
            >
              {showBreadcrumbs ? 'Ocultar' : 'Mostrar'} Breadcrumbs
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3 text-primary-orange">📱 Mobile</h3>
            <ul className="space-y-2 text-sm text-neutral-medium">
              <li>✅ Sidebar navigation</li>
              <li>✅ Touch-friendly buttons</li>
              <li>✅ Hamburger menu</li>
              <li>✅ Overlay para fechamento</li>
              <li>✅ Gestos touch</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3 text-primary-blue">💻 Desktop</h3>
            <ul className="space-y-2 text-sm text-neutral-medium">
              <li>✅ Navigation horizontal</li>
              <li>✅ Header completo</li>
              <li>✅ User dropdown</li>
              <li>✅ Quick actions</li>
              <li>✅ Hover states</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3 text-primary-green">⚙️ Funcionalidades</h3>
            <ul className="space-y-2 text-sm text-neutral-medium">
              <li>✅ Breadcrumbs opcionais</li>
              <li>✅ Título de página</li>
              <li>✅ Layout flexível</li>
              <li>✅ Sessão integrada</li>
              <li>✅ Sticky navigation</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Responsividade</h3>
          <p className="text-neutral-medium mb-4">
            Redimensione a janela ou teste em diferentes dispositivos para ver o layout se adaptar:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-neutral-lighter rounded-lg">
              <div className="text-2xl mb-2">📱</div>
              <div className="font-semibold">Mobile</div>
              <div className="text-sm text-neutral-medium">&lt; 768px</div>
            </div>
            
            <div className="p-4 bg-neutral-lighter rounded-lg">
              <div className="text-2xl mb-2">📱</div>
              <div className="font-semibold">Tablet</div>
              <div className="text-sm text-neutral-medium">768px - 1024px</div>
            </div>
            
            <div className="p-4 bg-neutral-lighter rounded-lg">
              <div className="text-2xl mb-2">💻</div>
              <div className="font-semibold">Desktop</div>
              <div className="text-sm text-neutral-medium">1024px - 1280px</div>
            </div>
            
            <div className="p-4 bg-neutral-lighter rounded-lg">
              <div className="text-2xl mb-2">🖥️</div>
              <div className="font-semibold">Large</div>
              <div className="text-sm text-neutral-medium">&gt; 1280px</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Conteúdo de Teste</h3>
          <p className="text-neutral-medium mb-4">
            Este é um conteúdo de teste para demonstrar como o layout se comporta com diferentes quantidades de conteúdo.
          </p>
          
          <div className="space-y-4">
            <div className="h-20 bg-gradient-to-r from-primary-orange to-primary-blue rounded-lg"></div>
            <div className="h-32 bg-gradient-to-r from-primary-blue to-primary-green rounded-lg"></div>
            <div className="h-16 bg-gradient-to-r from-primary-green to-secondary-coral rounded-lg"></div>
          </div>
        </div>
      </div>
    </Layout>
  );
}