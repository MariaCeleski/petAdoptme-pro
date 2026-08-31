/**
 * PetAdopt Platform - Supabase Database Setup Script
 * 
 * Configuração completa do banco de dados PostgreSQL para produção
 * Inclui: Tabelas, Índices, RLS, Triggers, Funcções
 * 
 * INSTRUÇÕES:
 * 1. Vá para https://supabase.com/dashboard
 * 2. Abra seu projeto
 * 3. Vá em SQL Editor
 * 4. Crie um novo query
 * 5. Cole todo este script
 * 6. Clique em "Run"
 * 
 * TEMPO ESTIMADO: 2-3 minutos
 */

-- ============================================
-- 1. CRIAR EXTENSÕES
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 2. CRIAR ENUMS
-- ============================================

-- User types
CREATE TYPE user_type AS ENUM ('ADOPTER', 'SHELTER_ADMIN', 'INDIVIDUAL_OWNER');

-- Pet types
CREATE TYPE species AS ENUM ('DOG', 'CAT');
CREATE TYPE pet_size AS ENUM ('SMALL', 'MEDIUM', 'LARGE');
CREATE TYPE gender AS ENUM ('MALE', 'FEMALE');
CREATE TYPE pet_status AS ENUM ('AVAILABLE', 'PENDING', 'ADOPTED', 'UNAVAILABLE');

-- Adoption types
CREATE TYPE adoption_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED');

-- ============================================
-- 3. CRIAR TABELAS
-- ============================================

-- Users table (integrado com NextAuth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  phone TEXT,
  location TEXT,
  type user_type DEFAULT 'ADOPTER',
  email_verified TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$')
);

-- Auth accounts (NextAuth)
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE (provider, provider_account_id)
);

-- Auth sessions (NextAuth)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Verification tokens (NextAuth)
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE (identifier, token)
);

-- Shelters table
CREATE TABLE IF NOT EXISTS shelters (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  description TEXT,
  logo TEXT,
  images TEXT[],
  is_verified BOOLEAN DEFAULT FALSE,
  admin_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pets table
CREATE TABLE IF NOT EXISTS pets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  species species NOT NULL,
  breed TEXT NOT NULL,
  age TEXT NOT NULL,
  size pet_size NOT NULL,
  gender gender NOT NULL,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  is_neutered BOOLEAN DEFAULT FALSE,
  is_vaccinated BOOLEAN DEFAULT FALSE,
  health_status TEXT,
  personality TEXT[],
  images TEXT[],
  status pet_status DEFAULT 'AVAILABLE',
  location TEXT,
  owner_id TEXT NOT NULL REFERENCES users(id),
  shelter_id TEXT REFERENCES shelters(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (char_length(description) >= 10)
);

-- Adoptions table
CREATE TABLE IF NOT EXISTS adoptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  pet_id TEXT NOT NULL REFERENCES pets(id),
  adopter_id TEXT NOT NULL REFERENCES users(id),
  status adoption_status DEFAULT 'PENDING',
  message TEXT,
  adopter_info JSONB NOT NULL,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  CHECK (message IS NULL OR char_length(message) >= 10)
);

-- Adoption logs (para auditoria)
CREATE TABLE IF NOT EXISTS adoption_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  adoption_id TEXT NOT NULL REFERENCES adoptions(id),
  action TEXT NOT NULL,
  old_status adoption_status,
  new_status adoption_status,
  changed_by TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table (usuários podem favoritar pets)
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, pet_id)
);

-- ============================================
-- 4. CRIAR ÍNDICES (PERFORMANCE)
-- ============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(type);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Accounts indexes
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_provider ON accounts(provider, provider_account_id);

-- Sessions indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires ON sessions(expires);

-- Shelters indexes
CREATE INDEX idx_shelters_admin_id ON shelters(admin_id);
CREATE INDEX idx_shelters_city ON shelters(city);
CREATE INDEX idx_shelters_is_verified ON shelters(is_verified);

-- Pets indexes (CRITICAL para busca)
CREATE INDEX idx_pets_species_status ON pets(species, status);
CREATE INDEX idx_pets_size_status ON pets(size, status);
CREATE INDEX idx_pets_gender_status ON pets(gender, status);
CREATE INDEX idx_pets_location ON pets(location);
CREATE INDEX idx_pets_owner_id ON pets(owner_id);
CREATE INDEX idx_pets_shelter_id ON pets(shelter_id);
CREATE INDEX idx_pets_status ON pets(status);
CREATE INDEX idx_pets_created_at ON pets(created_at DESC);

-- Full-text search index para nome e raça
CREATE INDEX idx_pets_search ON pets USING gin(
  to_tsvector('portuguese', name || ' ' || breed || ' ' || description)
);

-- Adoptions indexes
CREATE INDEX idx_adoptions_pet_id ON adoptions(pet_id);
CREATE INDEX idx_adoptions_adopter_id ON adoptions(adopter_id);
CREATE INDEX idx_adoptions_status ON adoptions(status);
CREATE INDEX idx_adoptions_created_at ON adoptions(created_at DESC);

-- Adoption logs indexes
CREATE INDEX idx_adoption_logs_adoption_id ON adoption_logs(adoption_id);
CREATE INDEX idx_adoption_logs_created_at ON adoption_logs(created_at DESC);

-- Favorites indexes
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_pet_id ON favorites(pet_id);

-- ============================================
-- 5. CRIAR FUNCTIONS
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para criar adoption log
CREATE OR REPLACE FUNCTION log_adoption_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO adoption_logs (
      adoption_id,
      action,
      old_status,
      new_status,
      changed_by,
      created_at
    ) VALUES (
      NEW.id,
      'STATUS_CHANGE',
      OLD.status,
      NEW.status,
      auth.uid()::text,
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar pet availability
CREATE OR REPLACE FUNCTION check_pet_adoption_consistency()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se pet com status ADOPTED tem adoption COMPLETED
  IF NEW.status = 'ADOPTED' THEN
    IF NOT EXISTS (
      SELECT 1 FROM adoptions 
      WHERE pet_id = NEW.id AND status = 'COMPLETED'
    ) THEN
      RAISE EXCEPTION 'Pet cannot be marked as ADOPTED without completed adoption';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. CRIAR TRIGGERS
-- ============================================

-- Update timestamp triggers
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at
BEFORE UPDATE ON pets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adoptions_updated_at
BEFORE UPDATE ON adoptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shelters_updated_at
BEFORE UPDATE ON shelters
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Adoption status change logging
CREATE TRIGGER log_adoption_changes
AFTER UPDATE ON adoptions
FOR EACH ROW EXECUTE FUNCTION log_adoption_status_change();

-- Pet adoption consistency check
CREATE TRIGGER check_pet_adoption
BEFORE UPDATE ON pets
FOR EACH ROW EXECUTE FUNCTION check_pet_adoption_consistency();

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoption_logs ENABLE ROW LEVEL SECURITY;

-- Users: Leitura pública de informações básicas
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
USING (auth.uid()::text = id);

CREATE POLICY "Users can read public profiles"
ON users FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid()::text = id);

-- Pets: Leitura pública, escrita apenas do owner
CREATE POLICY "Anyone can read available pets"
ON pets FOR SELECT
USING (true);

CREATE POLICY "Users can insert own pets"
ON pets FOR INSERT
WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Users can update own pets"
ON pets FOR UPDATE
USING (auth.uid()::text = owner_id);

CREATE POLICY "Users can delete own pets"
ON pets FOR DELETE
USING (auth.uid()::text = owner_id);

-- Adoptions: Usuários podem ver suas próprias adoções
CREATE POLICY "Users can read own adoptions"
ON adoptions FOR SELECT
USING (
  auth.uid()::text = adopter_id 
  OR auth.uid()::text = (SELECT owner_id FROM pets WHERE id = pet_id)
);

CREATE POLICY "Users can create adoption requests"
ON adoptions FOR INSERT
WITH CHECK (auth.uid()::text = adopter_id);

CREATE POLICY "Pet owners can update adoption status"
ON adoptions FOR UPDATE
USING (auth.uid()::text = (SELECT owner_id FROM pets WHERE id = pet_id));

-- Favorites: Usuários podem ver seus próprios favoritos
CREATE POLICY "Users can read own favorites"
ON favorites FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own favorites"
ON favorites FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own favorites"
ON favorites FOR DELETE
USING (auth.uid()::text = user_id);

-- Shelters: Leitura pública, escrita apenas do admin
CREATE POLICY "Anyone can read shelters"
ON shelters FOR SELECT
USING (true);

CREATE POLICY "Shelter admin can update own shelter"
ON shelters FOR UPDATE
USING (auth.uid()::text = admin_id);

-- ============================================
-- 8. GRANT PERMISSIONS
-- ============================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT SELECT ON users TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON pets TO authenticated;
GRANT SELECT ON pets TO anon;

GRANT SELECT, INSERT, UPDATE ON adoptions TO authenticated;
GRANT SELECT ON adoptions TO anon;

GRANT SELECT, INSERT, UPDATE ON shelters TO authenticated;
GRANT SELECT ON shelters TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON favorites TO authenticated;

-- ============================================
-- 9. CRIAR VIEWS ÚTEIS
-- ============================================

-- View: Pets disponíveis com informações do owner
CREATE OR REPLACE VIEW available_pets_view AS
SELECT 
  p.id,
  p.name,
  p.species,
  p.breed,
  p.age,
  p.size,
  p.gender,
  p.color,
  p.description,
  p.images,
  p.location,
  p.status,
  u.name as owner_name,
  u.email as owner_email,
  u.phone as owner_phone,
  s.name as shelter_name,
  p.created_at
FROM pets p
LEFT JOIN users u ON p.owner_id = u.id
LEFT JOIN shelters s ON p.shelter_id = s.id
WHERE p.status = 'AVAILABLE';

-- View: Adoções em progresso
CREATE OR REPLACE VIEW adoptions_in_progress_view AS
SELECT 
  a.id,
  a.pet_id,
  p.name as pet_name,
  p.species,
  a.adopter_id,
  u.name as adopter_name,
  u.email as adopter_email,
  a.status,
  a.created_at,
  a.updated_at
FROM adoptions a
JOIN pets p ON a.pet_id = p.id
JOIN users u ON a.adopter_id = u.id
WHERE a.status IN ('PENDING', 'APPROVED');

-- View: Estatísticas de abrigo
CREATE OR REPLACE VIEW shelter_statistics_view AS
SELECT 
  s.id,
  s.name,
  COUNT(p.id) as total_pets,
  COUNT(CASE WHEN p.status = 'AVAILABLE' THEN 1 END) as available_pets,
  COUNT(CASE WHEN p.status = 'ADOPTED' THEN 1 END) as adopted_pets,
  ROUND(
    COUNT(CASE WHEN p.status = 'ADOPTED' THEN 1 END)::numeric 
    / NULLIF(COUNT(p.id), 0) * 100, 
    2
  ) as adoption_rate
FROM shelters s
LEFT JOIN pets p ON s.id = p.shelter_id
GROUP BY s.id, s.name;

-- ============================================
-- 10. DATA SAMPLE (OPCIONAL - COMENTADO)
-- ============================================

/*
-- Criar usuário de teste (você precisa usar Supabase Auth)
-- INSERT INTO users (id, email, name, type) VALUES
-- ('user-1', 'adopter@example.com', 'Maria Silva', 'ADOPTER'),
-- ('user-2', 'shelter@example.com', 'Abrigo Feliz', 'SHELTER_ADMIN');

-- INSERT INTO shelters (name, address, city, state, zip_code, phone, email, admin_id) VALUES
-- ('Abrigo Feliz', 'Rua dos Pets 123', 'São Paulo', 'SP', '01310-100', '11999999999', 'shelter@example.com', 'user-2');

-- INSERT INTO pets (name, species, breed, age, size, gender, color, description, personality, location, owner_id, shelter_id) VALUES
-- ('Buddy', 'DOG', 'Labrador', '2 years', 'LARGE', 'MALE', 'Brown', 'Friendly and energetic dog looking for a loving home', ARRAY['friendly', 'energetic', 'loving'], 'São Paulo', 'user-2', (SELECT id FROM shelters WHERE name = 'Abrigo Feliz'));
*/

-- ============================================
-- 11. FINALIZAÇÃO
-- ============================================

-- Mostrar resumo
SELECT 
  'Database Setup Complete!' as status,
  'PetAdopt - Production Ready' as project,
  NOW() as setup_time;

-- Listar tabelas criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
