'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isTokenValid } from '@/lib/authToken';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Layout from '@/components/common/Layout';
import PhotoUpload from '@/components/PhotoUpload';
import styles from './cadastrar.module.css';

function CadastrarPetContent() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    nomePet: '',
    especie: '',
    raca: '',
    idade: '',
    genero: '',
    tamanho: '',
    corAparencia: '',
    vacinado: '',
    castrado: '',
    historicoMedico: '',
    alergias: '',
    temperamento: '',
    descricaoGeral: '',
    fotos: [],
    motivoAdocao: '',
    nomeContatoTutor: '',
    telefoneTutor: '',
    emailTutor: '',
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});

  const breadcrumbs = [
    { label: 'Início', href: '/' },
    { label: 'Tutores', href: '/tutores' },
    { label: 'Cadastrar Pet', href: '/tutores/cadastrar' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePhotoChange = (files) => {
    setFormData(prev => ({
      ...prev,
      fotos: files
    }));
    if (errors.fotos) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.fotos;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nomePet.trim()) newErrors.nomePet = 'Nome obrigatório';
    if (!formData.especie) newErrors.especie = 'Espécie obrigatória';
    if (!formData.raca.trim()) newErrors.raca = 'Raça obrigatória';
    if (!formData.idade) newErrors.idade = 'Idade obrigatória';
    if (!formData.genero) newErrors.genero = 'Gênero obrigatório';
    if (!formData.tamanho) newErrors.tamanho = 'Tamanho obrigatório';
    if (!formData.corAparencia.trim()) newErrors.corAparencia = 'Cor/Aparência obrigatória';
    if (!formData.descricaoGeral.trim()) newErrors.descricaoGeral = 'Descrição obrigatória';
    if (formData.fotos.length === 0) newErrors.fotos = 'Pelo menos 1 foto obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setErrorMessage('❌ Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const formDataToSend = new FormData();

      formDataToSend.append('name', formData.nomePet);
      formDataToSend.append('species', mapSpecies(formData.especie));
      formDataToSend.append('breed', formData.raca);
      formDataToSend.append('age', formData.idade.toString());
      formDataToSend.append('gender', mapGender(formData.genero));
      formDataToSend.append('size', mapSize(formData.tamanho));
      formDataToSend.append('color', formData.corAparencia);
      formDataToSend.append('description', formData.descricaoGeral);
      formDataToSend.append('isVaccinated', formData.vacinado === 'sim');
      formDataToSend.append('isNeutered', formData.castrado === 'sim');
      
      if (formData.historicoMedico) {
        formDataToSend.append('healthStatus', formData.historicoMedico);
      }
      
      formDataToSend.append('personality', JSON.stringify([formData.temperamento]));

      if (formData.motivoAdocao) {
        formDataToSend.append('adoption_reason', formData.motivoAdocao);
      }
      if (formData.nomeContatoTutor) {
        formDataToSend.append('owner_name', formData.nomeContatoTutor);
      }
      if (formData.telefoneTutor) {
        formDataToSend.append('owner_phone', formData.telefoneTutor);
      }
      if (formData.emailTutor) {
        formDataToSend.append('owner_email', formData.emailTutor);
      }

      formData.fotos.forEach((file) => {
        formDataToSend.append('photos', file);
      });

      setUploadProgress(50);

      const token = getToken();
      
      if (!token) {
        setErrorMessage('Erro de autenticação. Token não encontrado. Faça login novamente.');
        setIsSubmitting(false);
        return;
      }
      
      if (!isTokenValid(token)) {
        setErrorMessage('Sua sessão expirou. Faça login novamente.');
        setIsSubmitting(false);
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      setUploadProgress(75);

      const response = await fetch(`${backendUrl}/api/pets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend,
      });

      const result = await response.json();
      setUploadProgress(100);

      if (!response.ok) {
        let mensagemErro = result.error || 'Erro ao cadastrar pet';
        
        if (result.details && Array.isArray(result.details)) {
          const detalhes = result.details
            .map(d => `${d.field}: ${d.message}`)
            .join(' | ');
          mensagemErro = `Erro de validação: ${detalhes}`;
        }

        setErrorMessage(mensagemErro);
        setIsSubmitting(false);
        return;
      }

      const petId = result.data?.id;
      setSuccessMessage('✅ Pet cadastrado! Redirecionando...');
      
      setTimeout(() => {
        router.push(petId ? `/tutores/${petId}/pendente` : '/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('❌ Erro inesperado. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  const mapSpecies = (especie) => {
    const map = { 'cachorro': 'DOG', 'gato': 'CAT', 'coelho': 'RABBIT', 'outro': 'OTHER' };
    return map[especie] || especie.toUpperCase();
  };

  const mapGender = (genero) => {
    return genero === 'macho' ? 'MALE' : 'FEMALE';
  };

  const mapSize = (tamanho) => {
    const map = { 'pequeno': 'SMALL', 'medio': 'MEDIUM', 'grande': 'LARGE', 'extra-grande': 'XLARGE' };
    return map[tamanho] || tamanho.toUpperCase();
  };

  const handleCancel = () => {
    if (window.confirm('Descartar? Todos os dados serão perdidos.')) {
      setFormData({
        nomePet: '', especie: '', raca: '', idade: '', genero: '', tamanho: '',
        corAparencia: '', vacinado: '', castrado: '', historicoMedico: '', alergias: '',
        temperamento: '', descricaoGeral: '', fotos: [], motivoAdocao: '',
        nomeContatoTutor: '', telefoneTutor: '', emailTutor: ''
      });
      setErrors({});
      setSuccessMessage('');
      setErrorMessage('');
      setUploadProgress(0);
    }
  };

  return (
    <Layout 
      title="Cadastrar um Pet" 
      breadcrumbs={breadcrumbs}
      showBreadcrumbs={true}
    >
      <section className={styles.mainContent}>
        <div className={styles.container}>
          {/* Hero Section */}
          <div className={styles.heroSection}>
            <h1 className={styles.heroTitle}>📝 Cadastre seu Pet</h1>
            <p className={styles.heroDescription}>
              Preencha os dados abaixo para colocar seu pet para adoção. Quanto mais informações, melhores as chances!
            </p>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className={styles.successBox}>{successMessage}</div>
          )}
          {errorMessage && (
            <div className={styles.errorBox}>{errorMessage}</div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Informações Básicas */}
            <fieldset className={styles.fieldset}>
              <legend>📋 Informações Básicas</legend>
              
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="nomePet">Nome do Pet *</label>
                  <input
                    type="text"
                    id="nomePet"
                    name="nomePet"
                    value={formData.nomePet}
                    onChange={handleChange}
                    placeholder="Ex: Max"
                    maxLength={50}
                  />
                  {errors.nomePet && <span className={styles.error}>{errors.nomePet}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="especie">Espécie *</label>
                  <select
                    id="especie"
                    name="especie"
                    value={formData.especie}
                    onChange={handleChange}
                  >
                    <option value="">Selecione</option>
                    <option value="cachorro">🐕 Cachorro</option>
                    <option value="gato">🐱 Gato</option>
                    <option value="coelho">🐰 Coelho</option>
                    <option value="outro">🐾 Outro</option>
                  </select>
                  {errors.especie && <span className={styles.error}>{errors.especie}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="raca">Raça *</label>
                  <input
                    type="text"
                    id="raca"
                    name="raca"
                    value={formData.raca}
                    onChange={handleChange}
                    placeholder="Ex: Labrador"
                    maxLength={50}
                  />
                  {errors.raca && <span className={styles.error}>{errors.raca}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="idade">Idade (anos) *</label>
                  <input
                    type="number"
                    id="idade"
                    name="idade"
                    value={formData.idade}
                    onChange={handleChange}
                    min="0"
                    max="50"
                    placeholder="3"
                  />
                  {errors.idade && <span className={styles.error}>{errors.idade}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="genero">Gênero *</label>
                  <select
                    id="genero"
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                  >
                    <option value="">Selecione</option>
                    <option value="macho">Macho</option>
                    <option value="femea">Fêmea</option>
                  </select>
                  {errors.genero && <span className={styles.error}>{errors.genero}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="tamanho">Tamanho *</label>
                  <select
                    id="tamanho"
                    name="tamanho"
                    value={formData.tamanho}
                    onChange={handleChange}
                  >
                    <option value="">Selecione</option>
                    <option value="pequeno">Pequeno</option>
                    <option value="medio">Médio</option>
                    <option value="grande">Grande</option>
                    <option value="extra-grande">Extra Grande</option>
                  </select>
                  {errors.tamanho && <span className={styles.error}>{errors.tamanho}</span>}
                </div>

                <div className={styles.formGroup + ' ' + styles.twoCol}>
                  <label htmlFor="corAparencia">Cor/Aparência *</label>
                  <textarea
                    id="corAparencia"
                    name="corAparencia"
                    value={formData.corAparencia}
                    onChange={handleChange}
                    placeholder="Ex: Marrom com manchas brancas"
                    rows={3}
                  />
                  {errors.corAparencia && <span className={styles.error}>{errors.corAparencia}</span>}
                </div>
              </div>
            </fieldset>

            {/* Saúde */}
            <fieldset className={styles.fieldset}>
              <legend>⚕️ Saúde</legend>
              
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="vacinado">Vacinado?</label>
                  <select id="vacinado" name="vacinado" value={formData.vacinado} onChange={handleChange}>
                    <option value="">Selecione</option>
                    <option value="sim">✅ Sim</option>
                    <option value="nao">❌ Não</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="castrado">Castrado/Esterilizado?</label>
                  <select id="castrado" name="castrado" value={formData.castrado} onChange={handleChange}>
                    <option value="">Selecione</option>
                    <option value="sim">✅ Sim</option>
                    <option value="nao">❌ Não</option>
                  </select>
                </div>

                <div className={styles.formGroup + ' ' + styles.twoCol}>
                  <label htmlFor="historicoMedico">Histórico Médico</label>
                  <textarea
                    id="historicoMedico"
                    name="historicoMedico"
                    value={formData.historicoMedico}
                    onChange={handleChange}
                    placeholder="Problemas de saúde, medicações, etc"
                    rows={3}
                    maxLength={300}
                  />
                </div>

                <div className={styles.formGroup + ' ' + styles.twoCol}>
                  <label htmlFor="alergias">Alergias</label>
                  <textarea
                    id="alergias"
                    name="alergias"
                    value={formData.alergias}
                    onChange={handleChange}
                    placeholder="Se tiver alergias, descreva aqui"
                    rows={3}
                    maxLength={300}
                  />
                </div>
              </div>
            </fieldset>

            {/* Comportamento */}
            <fieldset className={styles.fieldset}>
              <legend>🎭 Comportamento</legend>
              
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="temperamento">Temperamento</label>
                  <select id="temperamento" name="temperamento" value={formData.temperamento} onChange={handleChange}>
                    <option value="">Selecione</option>
                    <option value="docil">Dócil</option>
                    <option value="brincalhao">Brincalhão</option>
                    <option value="timido">Tímido</option>
                    <option value="calmo">Calmo</option>
                  </select>
                </div>

                <div className={styles.formGroup + ' ' + styles.twoCol}>
                  <label htmlFor="descricaoGeral">Descrição Geral *</label>
                  <textarea
                    id="descricaoGeral"
                    name="descricaoGeral"
                    value={formData.descricaoGeral}
                    onChange={handleChange}
                    placeholder="Descreva o comportamento e características principais"
                    rows={4}
                    minLength={10}
                    maxLength={500}
                  />
                  {errors.descricaoGeral && <span className={styles.error}>{errors.descricaoGeral}</span>}
                </div>
              </div>
            </fieldset>

            {/* Fotos */}
            <fieldset className={styles.fieldset}>
              <legend>📸 Fotos *</legend>
              <PhotoUpload 
                onChange={handlePhotoChange}
                maxFiles={5}
                acceptedFormats={['image/jpeg', 'image/png']}
              />
              {errors.fotos && <span className={styles.error}>{errors.fotos}</span>}
            </fieldset>

            {/* Contato */}
            <fieldset className={styles.fieldset}>
              <legend>📞 Informações de Contato</legend>
              
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="nomeContatoTutor">Seu Nome</label>
                  <input
                    type="text"
                    id="nomeContatoTutor"
                    name="nomeContatoTutor"
                    value={formData.nomeContatoTutor}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    maxLength={100}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="emailTutor">Email</label>
                  <input
                    type="email"
                    id="emailTutor"
                    name="emailTutor"
                    value={formData.emailTutor}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="telefoneTutor">Telefone</label>
                  <input
                    type="tel"
                    id="telefoneTutor"
                    name="telefoneTutor"
                    value={formData.telefoneTutor}
                    onChange={handleChange}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="motivoAdocao">Motivo da Adoção</label>
                  <select id="motivoAdocao" name="motivoAdocao" value={formData.motivoAdocao} onChange={handleChange}>
                    <option value="">Selecione</option>
                    <option value="mudanca">Mudança</option>
                    <option value="incompatibilidade">Incompatibilidade</option>
                    <option value="outras">Outras Razões</option>
                    <option value="resgate">Resgate</option>
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Buttons */}
            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={handleCancel}
                className={styles.buttonCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.buttonSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? `Enviando... ${uploadProgress}%` : '✅ Cadastrar Pet'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
}

export default function CadastrarPetPage() {
  return (
    <ProtectedRoute>
      <CadastrarPetContent />
    </ProtectedRoute>
  );
}
