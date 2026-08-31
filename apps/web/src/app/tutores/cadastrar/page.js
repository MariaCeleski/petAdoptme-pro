'use client';

import { useState } from 'react';
import Layout from '@/components/common/Layout';
import PageNavigation from '@/components/common/PageNavigation/PageNavigation';
import styles from './cadastrar.module.css';

export default function CadastrarPetPage() {
  const [formData, setFormData] = useState({
    // Section 1: Basic Info
    nomePet: '',
    especie: '',
    raca: '',
    idade: '',
    genero: '',
    tamanho: '',
    corAparencia: '',

    // Section 2: Health
    vacinado: '',
    castrado: '',
    microchip: '',
    historicoMedico: '',
    alergias: '',

    // Section 3: Behavior
    temperamento: '',
    criancas: '',
    outrosAnimais: '',
    descricaoGeral: '',

    // Section 4: Photos
    fotos: [],

    // Section 5: Additional
    motivoAdocao: '',
    nomeContatoTutor: '',
    telefoneTutor: '',
    emailTutor: '',
    aceitaCidade: ''
  });

  const [fotoPreviews, setFotoPreviews] = useState([]);
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
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate number of files
    if (files.length + fotoPreviews.length > 5) {
      setErrorMessage('⚠️ Máximo de 5 fotos permitidas. Você já tem ' + fotoPreviews.length + ' foto(s).');
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/png'];
    const invalidFiles = files.filter(f => !validTypes.includes(f.type));
    
    if (invalidFiles.length > 0) {
      setErrorMessage('❌ Formato inválido. Use apenas JPG ou PNG.');
      return;
    }

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreviews(prev => [...prev, {
          id: Date.now() + Math.random(),
          src: reader.result,
          file
        }]);
      };
      reader.readAsDataURL(file);
    });

    // Update form data
    setFormData(prev => ({
      ...prev,
      fotos: [...prev.fotos, ...files]
    }));

    setErrorMessage('');
  };

  const removePhoto = (id) => {
    setFotoPreviews(prev => prev.filter(p => p.id !== id));
    // In a real app, also update formData.fotos
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.nomePet.trim()) newErrors.nomePet = 'Nome do pet é obrigatório';
    if (!formData.especie) newErrors.especie = 'Espécie é obrigatória';
    if (!formData.raca.trim()) newErrors.raca = 'Raça é obrigatória';
    if (!formData.idade) newErrors.idade = 'Idade é obrigatória';
    if (!formData.genero) newErrors.genero = 'Gênero é obrigatório';
    if (!formData.tamanho) newErrors.tamanho = 'Tamanho é obrigatório';
    if (!formData.corAparencia.trim()) newErrors.corAparencia = 'Cor/Aparência é obrigatória';

    if (!formData.vacinado) newErrors.vacinado = 'Informação sobre vacinação é obrigatória';
    if (!formData.castrado) newErrors.castrado = 'Informação sobre castração é obrigatória';
    if (!formData.microchip) newErrors.microchip = 'Informação sobre microchip é obrigatória';

    if (!formData.temperamento) newErrors.temperamento = 'Temperamento é obrigatório';
    if (!formData.criancas) newErrors.criancas = 'Compatibilidade com crianças é obrigatória';
    if (!formData.outrosAnimais) newErrors.outrosAnimais = 'Compatibilidade com animais é obrigatória';
    if (!formData.descricaoGeral.trim()) newErrors.descricaoGeral = 'Descrição geral é obrigatória';

    if (fotoPreviews.length === 0) newErrors.fotos = 'Adicione pelo menos 1 foto do pet';

    if (!formData.motivoAdocao) newErrors.motivoAdocao = 'Motivo da adoção é obrigatório';
    if (!formData.nomeContatoTutor.trim()) newErrors.nomeContatoTutor = 'Nome do tutor é obrigatório';
    if (!formData.telefoneTutor.trim()) newErrors.telefoneTutor = 'Telefone é obrigatório';
    if (!formData.emailTutor.trim()) newErrors.emailTutor = 'Email é obrigatório';
    if (!formData.aceitaCidade) newErrors.aceitaCidade = 'Selecione uma opção de adoção fora da cidade';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!validateForm()) {
      setErrorMessage('❌ Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare FormData for file upload
      const formDataToSend = new FormData();
      
      // Add pet data fields
      formDataToSend.append('name', formData.nomePet);
      formDataToSend.append('species', formData.especie?.toUpperCase() === 'CACHORRO' ? 'DOG' : formData.especie?.toUpperCase() === 'GATO' ? 'CAT' : formData.especie?.toUpperCase());
      formDataToSend.append('breed', formData.raca);
      formDataToSend.append('age', formData.idade.toString());
      formDataToSend.append('gender', formData.genero?.toUpperCase() === 'MACHO' ? 'MALE' : 'FEMALE');
      formDataToSend.append('size', formData.tamanho?.toUpperCase().replace('-', ' '));
      formDataToSend.append('color', formData.corAparencia);
      formDataToSend.append('description', formData.descricaoGeral);
      formDataToSend.append('isVaccinated', formData.vacinado === 'sim');
      formDataToSend.append('isNeutered', formData.castrado === 'sim');
      formDataToSend.append('microchip', formData.microchip === 'sim');
      formDataToSend.append('healthStatus', formData.historicoMedico);
      formDataToSend.append('allergies', formData.alergias);
      formDataToSend.append('temperament', formData.temperamento);
      formDataToSend.append('compatibilityChildren', formData.criancas);
      formDataToSend.append('compatibilityAnimals', formData.outrosAnimais);
      formDataToSend.append('location', 'São Paulo, SP'); // Default location
      formDataToSend.append('adoptionReason', formData.motivoAdocao);
      formDataToSend.append('tutorName', formData.nomeContatoTutor);
      formDataToSend.append('tutorEmail', formData.emailTutor);
      formDataToSend.append('tutorPhone', formData.telefoneTutor);
      formDataToSend.append('acceptOutsideCity', formData.aceitaCidade === 'sim');

      // Add personality tags
      const personalities = [];
      if (formData.temperamento) personalities.push(formData.temperamento.charAt(0).toUpperCase() + formData.temperamento.slice(1));
      if (formData.criancas) personalities.push(`Crianças: ${formData.criancas}`);
      formDataToSend.append('personality', JSON.stringify(personalities));

      // Add placeholder images since we don't have file upload yet
      const images = [
        'https://picsum.photos/400/300?random=10',
        'https://picsum.photos/400/300?random=11'
      ];
      formDataToSend.append('images', JSON.stringify(images));

      // Call API
      const response = await fetch('/api/pets', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao cadastrar pet');
      }

      const result = await response.json();
      
      setSuccessMessage('✅ Pet cadastrado com sucesso! Obrigado por nos ajudar a encontrar um novo lar. 🎉\n\n🔄 Seu cadastro será revisado em até 24h. Você receberá um email de confirmação em breve.');
      
      // Redirect after 3 seconds
      setTimeout(() => {
        window.location.href = '/pets';
      }, 3000);
      
      // Reset form
      setFormData({
        nomePet: '',
        especie: '',
        raca: '',
        idade: '',
        genero: '',
        tamanho: '',
        corAparencia: '',
        vacinado: '',
        castrado: '',
        microchip: '',
        historicoMedico: '',
        alergias: '',
        temperamento: '',
        criancas: '',
        outrosAnimais: '',
        descricaoGeral: '',
        fotos: [],
        motivoAdocao: '',
        nomeContatoTutor: '',
        telefoneTutor: '',
        emailTutor: '',
        aceitaCidade: ''
      });
      setFotoPreviews([]);
    } catch (error) {
      setErrorMessage('❌ Erro ao cadastrar pet. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Descartar formulário? Todos os dados serão perdidos.')) {
      setFormData({
        nomePet: '',
        especie: '',
        raca: '',
        idade: '',
        genero: '',
        tamanho: '',
        corAparencia: '',
        vacinado: '',
        castrado: '',
        microchip: '',
        historicoMedico: '',
        alergias: '',
        temperamento: '',
        criancas: '',
        outrosAnimais: '',
        descricaoGeral: '',
        fotos: [],
        motivoAdocao: '',
        nomeContatoTutor: '',
        telefoneTutor: '',
        emailTutor: '',
        aceitaCidade: ''
      });
      setFotoPreviews([]);
      setErrors({});
      setSuccessMessage('');
      setErrorMessage('');
    }
  };

  return (
    <Layout 
      title="Cadastrar um Pet" 
      breadcrumbs={breadcrumbs}
      showBreadcrumbs={true}
      showNavigation={false}
    >
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <h1 className={styles.heroTitle}>
            Cadastrar um Pet 🐾
          </h1>
          <p className={styles.heroDescription}>
            Ajude-nos a encontrar um novo lar para um animal especial. 
            Compartilhe informações detalhadas sobre o pet que você deseja oferecer para adoção.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className={styles.mainContent}>
        <div className={styles.mainContainer}>
          {/* Info Box */}
          <div className={styles.infoBox}>
            <div className={styles.infoBoxIcon}>ℹ️</div>
            <div className={styles.infoBoxContent}>
              <h3 className={styles.infoBoxTitle}>Como Funciona o Cadastro</h3>
              <p className={styles.infoBoxText}>
                Após você preencher este formulário com <strong>informações completas e honestas</strong> sobre o pet, 
                nosso time avaliará o cadastro em até 24 horas. Você receberá uma resposta no email informado. 
                O pet será listado em nossa plataforma quando aprovado, e interessados em adoção entrarão em contato direto com você.
              </p>
            </div>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className={styles.successMessage}>
              <div className={styles.successMessageIcon}>✓</div>
              <div className={styles.successMessageContent}>
                <h4 className={styles.successMessageTitle}>Sucesso!</h4>
                <p className={styles.successMessageText}>{successMessage}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className={styles.errorMessage}>
              <div className={styles.errorMessageIcon}>✕</div>
              <div className={styles.errorMessageContent}>
                <h4 className={styles.errorMessageTitle}>Erro</h4>
                <p className={styles.errorMessageText}>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.formContainer}>
            
            {/* Section 1: Basic Information */}
            <div className={styles.formSection}>
              <h2 className={styles.formSectionTitle}>📋 Informações Básicas do Pet</h2>
              <p className={styles.formSectionDescription}>
                Conte-nos o essencial sobre o seu pet. Use nomes e descrições claras.
              </p>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Nome do Pet <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.formInput}
                    type="text"
                    name="nomePet"
                    value={formData.nomePet}
                    onChange={handleChange}
                    placeholder="Ex: Luna, Max, Fluffy"
                    style={errors.nomePet ? { borderColor: '#E74C3C' } : {}}
                  />
                  {errors.nomePet && <div className={styles.formHelperText} style={{ color: '#E74C3C' }}>⚠️ {errors.nomePet}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Espécie <span className={styles.required}>*</span>
                  </label>
                  <select
                    className={styles.formSelect}
                    name="especie"
                    value={formData.especie}
                    onChange={handleChange}
                    style={errors.especie ? { borderColor: '#E74C3C' } : {}}
                  >
                    <option value="">Selecione uma espécie</option>
                    <option value="cachorro">Cachorro</option>
                    <option value="gato">Gato</option>
                    <option value="coelho">Coelho</option>
                    <option value="outro">Outro</option>
                  </select>
                  {errors.especie && <div className={styles.formHelperText} style={{ color: '#E74C3C' }}>⚠️ {errors.especie}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Raça <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.formInput}
                    type="text"
                    name="raca"
                    value={formData.raca}
                    onChange={handleChange}
                    placeholder="Ex: Labrador, Persa, Sem raça definida"
                    style={errors.raca ? { borderColor: '#E74C3C' } : {}}
                  />
                  {errors.raca && <div className={styles.formHelperText} style={{ color: '#E74C3C' }}>⚠️ {errors.raca}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Idade <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.formInput}
                    type="number"
                    name="idade"
                    value={formData.idade}
                    onChange={handleChange}
                    placeholder="Ex: 3 (em anos)"
                    min="0"
                    max="50"
                    style={errors.idade ? { borderColor: '#E74C3C' } : {}}
                  />
                  {errors.idade && <div className={styles.formHelperText} style={{ color: '#E74C3C' }}>⚠️ {errors.idade}</div>}
                  <div className={styles.formHelperText}>Use a idade em anos. Para filhotes, use 0.</div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Gênero <span className={styles.required}>*</span>
                  </label>
                  <select
                    className={styles.formSelect}
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                    style={errors.genero ? { borderColor: '#E74C3C' } : {}}
                  >
                    <option value="">Selecione o gênero</option>
                    <option value="macho">Macho</option>
                    <option value="femea">Fêmea</option>
                  </select>
                  {errors.genero && <div className={styles.formHelperText} style={{ color: '#E74C3C' }}>⚠️ {errors.genero}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Tamanho <span className={styles.required}>*</span>
                  </label>
                  <select
                    className={styles.formSelect}
                    name="tamanho"
                    value={formData.tamanho}
                    onChange={handleChange}
                    style={errors.tamanho ? { borderColor: '#E74C3C' } : {}}
                  >
                    <option value="">Selecione o tamanho</option>
                    <option value="pequeno">Pequeno (até 5kg)</option>
                    <option value="medio">Médio (5-15kg)</option>
                    <option value="grande">Grande (15-30kg)</option>
                    <option value="extra-grande">Extra Grande (acima de 30kg)</option>
                  </select>
                  {errors.tamanho && <div className={styles.formHelperText} style={{ color: '#E74C3C' }}>⚠️ {errors.tamanho}</div>}
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel}>
                    Cor/Aparência <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    className={styles.formTextarea}
                    name="corAparencia"
                    value={formData.corAparencia}
                    onChange={handleChange}
                    placeholder="Ex: Branco com manchas marrom, olhos azuis, uma orelha menor..."
                    style={errors.corAparencia ? { borderColor: '#E74C3C' } : {}}
                  />
                  {errors.corAparencia && <div className={styles.formHelperText} style={{ color: '#E74C3C' }}>⚠️ {errors.corAparencia}</div>}
                  <div className={styles.formHelperText}>Descreva características físicas que ajudem a identificar o pet.</div>
                </div>
              </div>
            </div>

            {/* Section 2: Health & Wellness */}
            <div className={styles.formSection}>
              <h2 className={styles.formSectionTitle}>💊 Saúde e Bem-estar</h2>
              <p className={styles.formSectionDescription}>
                Informações médicas são importantes para encontrar um lar adequado ao pet.
              </p>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Vacinado? <span className={styles.required}>*</span>
                  </label>
                  <select
                    className={styles.formSelect}
                    name="vacinado"
                    value={formData.vacinado}
                    onChange={handleChange}
                    style={errors.vacinado ? { borderColor: '#E74C3C' } : {}}
                  >
                    <option value="">Selecione uma opção</option>
                    <option value="sim">Sim, vacinado</option>
                    <option value="nao">Não vacinado</option>
                  </select>
                  {errors.vacinado && <div className={styles.formHelperText} style={{ color: '#E74C3C' }}>⚠️ {errors.vacinado}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Castrado? <span className={styles.required}>*</span>
                  </label>
                  <select
                    className={styles.formSelect}
                    name="castrado"
                    value={formData.castrado}
                    onChange={handleChange}
                    style={errors.castrado ? { borderColor: '#E74C3C' } : {}}
                  >
                    <option value="">Selecione uma opção</option>
                    <option value="sim">Sim, castrado</option>
                    <option value="nao">Não castrado</option>
                  </select>
                  {errors.castrado && <div className={styles.formHelperText} style={{ color: '#E74C3C' }}>⚠️ {errors.castrado}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Microchip? <span className={styles.required}>*</span>
                  </label>
                  <select
                    className={styles.formSelect}
                    name="microchip"
                    value={formData.microchip}
                    onChange={handleChange}
                    style={errors.microchip ? { borderColor: '#E74C3C' } : {}}
                  >
                    <option value="">Selecione uma opção</option>
                    <option value="sim">Sim, possui microchip</option>
                    <option value="nao">Não possui microchip</option>
                  </select>
                  {errors.microchip && <div className={styles.formHelperText} style={{ color: '#E74C3C' }}>⚠️ {errors.microchip}</div>}
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel}>
                    Histórico Médico
                  </label>
                  <textarea
                    className={styles.formTextarea}
                    name="historicoMedico"
                    value={formData.historicoMedico}
                    onChange={handleChange}
                    placeholder="Ex: Cirurgia anterior, problemas de saúde, medicações contínuas..."
                  />
                  <div className={styles.formHelperText}>Informações opcionais que ajudem a entender a saúde do pet.</div>
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel}>
                    Alergias ou Restrições
                  </label>
                  <textarea
                    className={styles.formTextarea}
                    name="alergias"
                    value={formData.alergias}
                    onChange={handleChange}
                    placeholder="Ex: Alergia a frango, intolerância a certos medicamentos..."
                  />
                  <div className={styles.formHelperText}>Alergias alimentares ou restrições especiais.</div>
                </div>
              </div>
            </div>

            {/* Section 3: Behavior & Temperament */}
            <div className={styles.formSection}>
              <h2 className={styles.formSectionTitle}>🎭 Temperamento e Comportamento</h2>
              <p className={styles.formSectionDescription}>
                Descreva a personalidade do pet para encontrar o tutor ideal.
              </p>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Temperamento <span className={styles.required}>*</span>
                  </label>
                  <select
                    className={styles.formSelect}
                    name="temperamento"
                    value={formData.temperamento}
                    onChange={handleChange}
                    style={errors.temperamento ? { borderColor: '#E74C3C' } : {}}
                  >
                    <option value="">Selecione o temperamento</option>
                    <option value="docil">Dócil</option>
                    <option value="brincalhao">Brincalhão</option>
                    <option value="timido">Tímido</option>
                    <option value="agressivo">Agressivo</option>
                    <option value="calmo">Calmo</option>
                  </select>
                  {errors.temperamento && <div className={styles.formHelperText} style={{ color: '#E74C3C' }}>⚠️ {errors.temperamento}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Compatibilidade com Crianças <span className={styles.required}>*</span>
                  </label>
                  <select
                    className={styles.formSelect}
                    name="criancas"
                    value={formData.criancas}
                    onChange={handleChange}
                    style={errors.criancas ? { borderColor: '#E74C3C' } : {}}
                  >
                    <option value="">Selecione uma opção</option>
                    <option value="sim">Sim, ótimo com crianças</option>
                    <option value="nao">Não recomendado para crianças</option>
                    <option value="supervisionada">Recomendado com supervisão</option>
                  </select>
                  {errors.criancas && <div className={styles.formHelperText} style={{ color: '#E74C3C' }}>⚠️ {errors.criancas}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Compatibilidade com Outros Animais <span className={styles.required}>*</span>
                  </label>
                  <select
                    className={styles.formSelect}
                    name="outrosAnimais"
                    value={formData.outrosAnimais}
                    onChange={handleChange}
                    style={errors.outrosAnimais ? { borderColor: '#E74C3C' } : {}}
                  >
                    <option value="">Selecione uma opção</option>
                    <option value="sim">Sim, compatível</option>
                    <option value="nao">Não compatível</option>
                    <option value="depende">Depende da situação</option>
                  </select>
                  {errors.outrosAnimais && <div className={styles.formHelperText} style={{ color: '#E74C3C' }}>⚠️ {errors.outrosAnimais}</div>}
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel}>
                    Descrição Geral <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    className={styles.formTextarea}
                    name="descricaoGeral"
                    value={formData.descricaoGeral}
                    onChange={handleChange}
                    placeholder="Conte uma história sobre o pet. Quais são seus hábitos? Brinquedos favoritos? Manias? Coisas que adora ou detesta? Isso ajuda muito!"
                    style={errors.descricaoGeral ? { borderColor: '#E74C3C' } : {}}
                  />
                  {errors.descricaoGeral && <div className={styles.formHelperText} style={{ color: '#E74C3C' }}>⚠️ {errors.descricaoGeral}</div>}
                  <div className={styles.formHelperText}>Minimo 20 caracteres. Seja descritivo e honesto!</div>
                </div>
              </div>
            </div>

            {/* Section 4: Photos */}
            <div className={styles.formSection}>
              <h2 className={styles.formSectionTitle}>📸 Fotos do Pet</h2>
              <p className={styles.formSectionDescription}>
                Fotos são essenciais! Elas ajudam a encontrar o tutor perfeito.
              </p>

              <div className={styles.imageUploadContainer}>
                <label className={`${styles.imageUploadLabel} ${fotoPreviews.length > 0 ? styles.active : ''}`}>
                  <div className={styles.imageUploadIcon}>📷</div>
                  <div className={styles.imageUploadText}>Clique ou arraste fotos aqui</div>
                  <div className={styles.imageUploadSubtext}>
                    {fotoPreviews.length > 0 
                      ? `${fotoPreviews.length} foto(s) adicionada(s)` 
                      : 'JPG ou PNG, máximo 5 fotos'}
                  </div>
                  <input
                    className={styles.imageUploadInput}
                    type="file"
                    name="fotos"
                    accept="image/jpeg,image/png"
                    multiple
                    onChange={handleFileChange}
                    disabled={fotoPreviews.length >= 5}
                  />
                </label>

                {fotoPreviews.length > 0 && (
                  <div className={styles.imagePreviewContainer}>
                    <div className={styles.imagePreviewTitle}>Fotos Selecionadas ({fotoPreviews.length}/5)</div>
                    <div className={styles.imagePreview}>
                      {fotoPreviews.map((preview) => (
                        <div key={preview.id} className={styles.imagePreviewItem}>
                          <img src={preview.src} alt="Preview" />
                          <button
                            type="button"
                            className={styles.imagePreviewRemove}
                            onClick={() => removePhoto(preview.id)}
                            title="Remover foto"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {errors.fotos && <div className={styles.formHelperText} style={{ color: '#E74C3C', marginTop: '1rem' }}>⚠️ {errors.fotos}</div>}
                <div className={styles.formHelperText} style={{ marginTop: '1rem' }}>
                  <strong>Dica:</strong> Adicione fotos do rosto, corpo inteiro e alguma interagindo com você.
                </div>
              </div>
            </div>

            {/* Section 5: Contact Details */}
            <div className={styles.formSection}>
              <h2 className={styles.formSectionTitle}>📞 Detalhes Adicionais</h2>
              <p className={styles.formSectionDescription}>
                Informações do tutor atual e detalhes sobre a adoção.
              </p>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Motivo da Adoção <span className={styles.required}>*</span>
                  </label>
                  <select
                    className={styles.formSelect}
                    name="motivoAdocao"
                    value={formData.motivoAdocao}
                    onChange={handleChange}
                    style={errors.motivoAdocao ? { borderColor: '#E74C3C' } : {}}
                  >
                    <option value="">Selecione um motivo</option>
                    <option value="mudanca">Mudança/Viagem</option>
                    <option value="incompatibilidade">Incompatibilidade</option>
                    <option value="outras-circunstancias">Outras Circunstâncias</option>
                    <option value="resgate">Resgate/Encontrado</option>
                  </select>
                  {errors.motivoAdocao && <div className={styles.formHelperText} style={{ color: '#E74C3C' }}>⚠️ {errors.motivoAdocao}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Seu Nome <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.formInput}
                    type="text"
                    name="nomeContatoTutor"
                    value={formData.nomeContatoTutor}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    style={errors.nomeContatoTutor ? { borderColor: '#E74C3C' } : {}}
                  />
                  {errors.nomeContatoTutor && <div className={styles.formHelperText} style={{ color: '#E74C3C' }}>⚠️ {errors.nomeContatoTutor}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Telefone <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.formInput}
                    type="tel"
                    name="telefoneTutor"
                    value={formData.telefoneTutor}
                    onChange={handleChange}
                    placeholder="(11) 99999-9999 ou WhatsApp"
                    style={errors.telefoneTutor ? { borderColor: '#E74C3C' } : {}}
                  />
                  {errors.telefoneTutor && <div className={styles.formHelperText} style={{ color: '#E74C3C' }}>⚠️ {errors.telefoneTutor}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Email <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.formInput}
                    type="email"
                    name="emailTutor"
                    value={formData.emailTutor}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    style={errors.emailTutor ? { borderColor: '#E74C3C' } : {}}
                  />
                  {errors.emailTutor && <div className={styles.formHelperText} style={{ color: '#E74C3C' }}>⚠️ {errors.emailTutor}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Aceita Adoção para Fora da Cidade? <span className={styles.required}>*</span>
                  </label>
                  <select
                    className={styles.formSelect}
                    name="aceitaCidade"
                    value={formData.aceitaCidade}
                    onChange={handleChange}
                    style={errors.aceitaCidade ? { borderColor: '#E74C3C' } : {}}
                  >
                    <option value="">Selecione uma opção</option>
                    <option value="sim">Sim, aceito</option>
                    <option value="nao">Não, apenas na minha cidade</option>
                  </select>
                  {errors.aceitaCidade && <div className={styles.formHelperText} style={{ color: '#E74C3C' }}>⚠️ {errors.aceitaCidade}</div>}
                </div>
              </div>
            </div>

            {/* Button Group */}
            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Descartar
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Cadastrar Pet 🚀'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>
            Dúvidas? 💬
          </h2>
          <p className={styles.ctaDescription}>
            Se tiver perguntas sobre o processo de cadastro ou adoção, 
            <strong> entre em contato conosco</strong>. Estamos aqui para ajudar e garantir que o pet encontre o lar perfeito!
          </p>
        </div>
      </section>

      {/* Page Navigation */}
      <PageNavigation 
        previousPage={{ label: 'Termos de Serviço', href: '/termos' }}
        nextPage={null}
      />
    </Layout>
  );
}
