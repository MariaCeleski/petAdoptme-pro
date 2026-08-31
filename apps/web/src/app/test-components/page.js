'use client';

import { useState } from 'react';
import { 
  Button, 
  Input, 
  Select, 
  Modal, 
  Card, 
  Badge, 
  Avatar, 
  LoadingSkeleton,
  ErrorBoundary 
} from '@/components/ui';

export default function TestComponentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [loading, setLoading] = useState(false);

  const selectOptions = [
    { value: 'dog', label: 'Cachorro' },
    { value: 'cat', label: 'Gato' },
    { value: 'rabbit', label: 'Coelho' },
  ];

  const toggleLoading = () => {
    setLoading(!loading);
  };

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '1200px' }}>
      <h1>Teste dos Componentes UI</h1>
      
      {/* Buttons */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Botões</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <Button variant="primary">Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="success">Sucesso</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Perigo</Button>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button size="small">Pequeno</Button>
          <Button size="medium">Médio</Button>
          <Button size="large">Grande</Button>
          <Button loading>Carregando...</Button>
          <Button rounded icon={<span>🐕</span>}>Com Ícone</Button>
        </div>
      </section>

      {/* Inputs */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Inputs</h2>
        <div style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
          <Input 
            label="Nome"
            placeholder="Digite seu nome"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Input 
            label="Email" 
            type="email"
            placeholder="seu@email.com"
            icon={<span>📧</span>}
            required
          />
          <Input 
            label="Senha" 
            type="password"
            placeholder="Digite sua senha"
            error="Senha deve ter pelo menos 8 caracteres"
          />
          <Input 
            label="Buscar" 
            placeholder="Buscar pets..."
            icon={<span>🔍</span>}
            iconPosition="left"
            helperText="Digite para buscar"
          />
        </div>
      </section>

      {/* Select */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Select</h2>
        <div style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
          <Select
            label="Tipo de Pet"
            options={selectOptions}
            value={selectValue}
            onChange={setSelectValue}
            placeholder="Selecione um tipo"
          />
          <Select
            label="Com busca"
            options={selectOptions}
            searchable
            placeholder="Busque e selecione"
          />
        </div>
      </section>

      {/* Modal */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Modal</h2>
        <Button onClick={() => setIsModalOpen(true)}>Abrir Modal</Button>
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Modal de Teste"
        >
          <p>Este é o conteúdo do modal!</p>
          <Button onClick={() => setIsModalOpen(false)}>Fechar</Button>
        </Modal>
      </section>

      {/* Cards */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Cards</h2>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <Card hover>
            <Card.Image 
              src="https://via.placeholder.com/300x200?text=Pet+Image"
              alt="Pet"
            />
            <Card.Body>
              <Card.Title>Rex</Card.Title>
              <Card.Description>
                Um cãozinho muito fofo e brincalhão que está procurando um novo lar.
              </Card.Description>
            </Card.Body>
            <Card.Footer>
              <Card.Actions>
                <Button variant="primary" size="small">Adotar</Button>
                <Button variant="outline" size="small">Ver mais</Button>
              </Card.Actions>
            </Card.Footer>
          </Card>

          <Card variant="outlined">
            <Card.Body>
              <Card.Title>Card Simples</Card.Title>
              <Card.Description>
                Este é um card sem imagem, apenas com conteúdo textual.
              </Card.Description>
            </Card.Body>
          </Card>
        </div>
      </section>

      {/* Badges */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Badges</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <Badge>Padrão</Badge>
          <Badge variant="primary">Primário</Badge>
          <Badge variant="success">Sucesso</Badge>
          <Badge variant="warning">Aviso</Badge>
          <Badge variant="danger">Perigo</Badge>
          <Badge variant="info">Info</Badge>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <Badge.Status status="available">Disponível</Badge.Status>
          <Badge.Status status="pending">Pendente</Badge.Status>
          <Badge.Status status="adopted">Adotado</Badge.Status>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Badge.Pet type="neutered" />
          <Badge.Pet type="vaccinated" />
          <Badge.Pet type="friendly" />
        </div>
      </section>

      {/* Avatars */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Avatars</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <Avatar size="small" name="João Silva" />
          <Avatar size="medium" name="Maria Santos" />
          <Avatar size="large" name="Pedro Costa" />
          <Avatar 
            src="https://via.placeholder.com/80x80?text=User" 
            alt="Usuário"
            name="Ana Oliveira" 
            size="large"
            status="online"
          />
        </div>
        <Avatar.Group max={3}>
          <Avatar name="João Silva" />
          <Avatar name="Maria Santos" />
          <Avatar name="Pedro Costa" />
          <Avatar name="Ana Oliveira" />
          <Avatar name="Carlos Lima" />
        </Avatar.Group>
      </section>

      {/* Loading Skeletons */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Loading Skeletons</h2>
        <Button onClick={toggleLoading}>
          {loading ? 'Parar Loading' : 'Mostrar Loading'}
        </Button>
        {loading && (
          <div style={{ marginTop: '1rem' }}>
            <h3>Card Skeleton</h3>
            <LoadingSkeleton.Card />
            
            <h3>List Skeleton</h3>
            <LoadingSkeleton.List items={3} />
            
            <h3>Form Skeleton</h3>
            <LoadingSkeleton.Form fields={3} />
          </div>
        )}
      </section>

      {/* Error Boundary */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Error Boundary</h2>
        <ErrorBoundary>
          <div>
            <p>Este componente está protegido por Error Boundary</p>
            <Button 
              onClick={() => {
                throw new Error('Erro de teste');
              }}
            >
              Gerar Erro (Teste)
            </Button>
          </div>
        </ErrorBoundary>
      </section>
    </div>
  );
}