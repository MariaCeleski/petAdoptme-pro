'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import styles from './patrocinadores.module.css';

export default function SponsorsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    website: '',
    description: '',
    isActive: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check authorization
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.type !== 'SHELTER_ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  // Fetch sponsors
  useEffect(() => {
    if (session?.user.type === 'SHELTER_ADMIN') {
      fetchSponsors();
    }
  }, [session]);

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sponsors?admin=true');
      if (response.ok) {
        const data = await response.json();
        setSponsors(data);
      } else {
        setError('Erro ao carregar patrocinadores');
      }
    } catch (err) {
      setError('Erro ao carregar patrocinadores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const url = editingId 
        ? `/api/sponsors/${editingId}` 
        : '/api/sponsors';
      
      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar patrocinador');
      }

      setSuccess(editingId ? 'Patrocinador atualizado com sucesso!' : 'Patrocinador criado com sucesso!');
      setFormData({ name: '', logo: '', website: '', description: '', isActive: true });
      setShowForm(false);
      setEditingId(null);
      fetchSponsors();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (sponsor) => {
    setFormData({
      name: sponsor.name,
      logo: sponsor.logo,
      website: sponsor.website || '',
      description: sponsor.description || '',
      isActive: sponsor.isActive,
    });
    setEditingId(sponsor.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este patrocinador?')) return;

    try {
      const response = await fetch(`/api/sponsors/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar patrocinador');
      }

      setSuccess('Patrocinador deletado com sucesso!');
      fetchSponsors();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', logo: '', website: '', description: '', isActive: true });
  };

  if (status === 'loading' || loading) {
    return <div className={styles.container}>Carregando...</div>;
  }

  if (!session || session.user.type !== 'SHELTER_ADMIN') {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gerenciar Patrocinadores</h1>
        <p className={styles.subtitle}>
          Adicione e gerencie os logos e informações dos patrocinadores da plataforma
        </p>
      </div>

      {error && <div className={styles.alert}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.content}>
        {/* Form Section */}
        <div className={styles.formSection}>
          {!showForm ? (
            <Button 
              onClick={() => setShowForm(true)} 
              variant="primary"
              size="large"
            >
              + Adicionar Patrocinador
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Nome do Patrocinador *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Petshop ABC"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="logo">URL da Logo *</label>
                <input
                  type="url"
                  id="logo"
                  name="logo"
                  value={formData.logo}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  required
                />
                {formData.logo && (
                  <div className={styles.logoPreview}>
                    <img src={formData.logo} alt="Preview" />
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="website">Website (opcional)</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://..."
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Descrição (opcional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Escreva uma breve descrição do patrocinador"
                  rows="3"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="isActive">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Ativo (visível no carousel)
                </label>
              </div>

              <div className={styles.formActions}>
                <Button type="submit" variant="success">
                  {editingId ? 'Atualizar' : 'Criar'} Patrocinador
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Sponsors List */}
        <div className={styles.listSection}>
          <h2 className={styles.listTitle}>Patrocinadores Cadastrados ({sponsors.length})</h2>
          
          {sponsors.length === 0 ? (
            <p className={styles.empty}>Nenhum patrocinador cadastrado ainda</p>
          ) : (
            <div className={styles.sponsorsList}>
              {sponsors.map(sponsor => (
                <div key={sponsor.id} className={styles.sponsorItem}>
                  <div className={styles.sponsorLogo}>
                    <img src={sponsor.logo} alt={sponsor.name} />
                  </div>
                  
                  <div className={styles.sponsorInfo}>
                    <h3>{sponsor.name}</h3>
                    {sponsor.description && <p>{sponsor.description}</p>}
                    {sponsor.website && (
                      <a href={sponsor.website} target="_blank" rel="noopener noreferrer">
                        {sponsor.website}
                      </a>
                    )}
                    <div className={styles.statusBadge}>
                      {sponsor.isActive ? (
                        <span className={styles.active}>✓ Ativo</span>
                      ) : (
                        <span className={styles.inactive}>✗ Inativo</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.sponsorActions}>
                    <Button 
                      onClick={() => handleEdit(sponsor)}
                      variant="outline"
                      size="small"
                    >
                      Editar
                    </Button>
                    <Button 
                      onClick={() => handleDelete(sponsor.id)}
                      variant="danger"
                      size="small"
                    >
                      Deletar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
