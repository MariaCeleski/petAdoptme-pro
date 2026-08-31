'use client';

import { useState, useCallback, useMemo } from 'react';
import { Input, Select, Button, Card, Badge, Checkbox, RangeSlider } from '@/components/ui';
import { 
  SearchIcon, 
  SlidersHorizontalIcon,
  XIcon,
  ChevronDownIcon,
  MapPinIcon,
  HeartIcon,
  AlertCircleIcon,
  CheckCircleIcon
} from 'lucide-react';
import styles from './AdvancedSearch.module.css';
import { clsx } from 'clsx';

/**
 * AdvancedSearch Component
 * Advanced filtering with personality traits, special needs, and distance radius
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.6, 10.7
 */
export default function AdvancedSearch({
  onSearch,
  isLoading = false,
  savedSearches = [],
  onSaveSearch,
  userLocation
}) {
  // Advanced filter state
  const [expandedSections, setExpandedSections] = useState({
    health: false,
    personality: false,
    advanced: false
  });

  const [filters, setFilters] = useState({
    // Location & distance
    location: userLocation || '',
    distanceRadius: 50, // km
    
    // Health status
    isNeutered: null,
    isVaccinated: null,
    healthNeeds: [],
    
    // Personality traits
    personalityTraits: [],
    
    // Sorting
    sortBy: 'newest' // newest, relevance, distance
  });

  // Personality traits options
  const personalityOptions = [
    { id: 'friendly', label: '🐾 Amigável', color: 'blue' },
    { id: 'playful', label: '🎾 Brincalhão', color: 'green' },
    { id: 'calm', label: '😌 Calmo', color: 'purple' },
    { id: 'energetic', label: '⚡ Energético', color: 'yellow' },
    { id: 'shy', label: '🤫 Tímido', color: 'gray' },
    { id: 'affectionate', label: '💕 Carinhoso', color: 'pink' },
    { id: 'independent', label: '🦁 Independente', color: 'orange' },
    { id: 'protective', label: '🛡️ Protetor', color: 'red' }
  ];

  // Special health needs options
  const healthNeedsOptions = [
    { id: 'special_diet', label: 'Dieta especial' },
    { id: 'medication', label: 'Medicação contínua' },
    { id: 'physical_therapy', label: 'Fisioterapia' },
    { id: 'mobility_issues', label: 'Dificuldades de mobilidade' },
    { id: 'behavioral_training', label: 'Treinamento comportamental' },
    { id: 'vision_impaired', label: 'Deficiente visual' },
    { id: 'hearing_impaired', label: 'Deficiente auditivo' }
  ];

  /**
   * Toggle section expansion
   */
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  /**
   * Update filter
   */
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  /**
   * Toggle personality trait
   */
  const togglePersonalityTrait = useCallback((traitId) => {
    setFilters(prev => ({
      ...prev,
      personalityTraits: prev.personalityTraits.includes(traitId)
        ? prev.personalityTraits.filter(t => t !== traitId)
        : [...prev.personalityTraits, traitId]
    }));
  }, []);

  /**
   * Toggle health need
   */
  const toggleHealthNeed = useCallback((needId) => {
    setFilters(prev => ({
      ...prev,
      healthNeeds: prev.healthNeeds.includes(needId)
        ? prev.healthNeeds.filter(n => n !== needId)
        : [...prev.healthNeeds, needId]
    }));
  }, []);

  /**
   * Reset all filters
   */
  const resetFilters = useCallback(() => {
    setFilters({
      location: userLocation || '',
      distanceRadius: 50,
      isNeutered: null,
      isVaccinated: null,
      healthNeeds: [],
      personalityTraits: [],
      sortBy: 'newest'
    });
  }, [userLocation]);

  /**
   * Apply search
   */
  const applySearch = useCallback(() => {
    onSearch?.(filters);
  }, [filters, onSearch]);

  /**
   * Save current search
   */
  const saveCurrentSearch = useCallback(() => {
    const searchName = prompt('Nome da busca:');
    if (searchName) {
      onSaveSearch?.({
        name: searchName,
        filters,
        timestamp: new Date().toISOString()
      });
    }
  }, [filters, onSaveSearch]);

  /**
   * Get active filter count
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.location) count++;
    if (filters.distanceRadius !== 50) count++;
    if (filters.isNeutered !== null) count++;
    if (filters.isVaccinated !== null) count++;
    if (filters.healthNeeds.length > 0) count++;
    if (filters.personalityTraits.length > 0) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className={styles.advancedSearch}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <SlidersHorizontalIcon size={24} className={styles.headerIcon} />
          <div className={styles.headerText}>
            <h3 className={styles.title}>Busca Avançada</h3>
            {hasActiveFilters && (
              <span className={styles.filterCount}>
                {activeFilterCount} filtro{activeFilterCount !== 1 ? 's' : ''} ativo{activeFilterCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="small"
            onClick={resetFilters}
            className={styles.resetButton}
          >
            Limpar
          </Button>
        )}
      </div>

      {/* Location & Distance Section */}
      <div className={styles.section}>
        <button
          onClick={() => toggleSection('advanced')}
          className={clsx(styles.sectionHeader, {
            [styles.expanded]: expandedSections.advanced
          })}
        >
          <span className={styles.sectionTitle}>
            <MapPinIcon size={18} /> Localização
          </span>
          <ChevronDownIcon 
            size={20} 
            className={clsx(styles.chevron, {
              [styles.rotated]: expandedSections.advanced
            })}
          />
        </button>

        {expandedSections.advanced && (
          <div className={styles.sectionContent}>
            <div className={styles.filterGrid}>
              <Input
                type="text"
                placeholder="Cidade ou CEP"
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
                leftIcon={<MapPinIcon size={18} />}
              />
            </div>

            <div className={styles.filterItem}>
              <label className={styles.filterLabel}>
                Raio de Distância: {filters.distanceRadius} km
              </label>
              <input
                type="range"
                min="5"
                max="500"
                step="5"
                value={filters.distanceRadius}
                onChange={(e) => updateFilter('distanceRadius', parseInt(e.target.value))}
                className={styles.rangeInput}
              />
            </div>

            {/* Sort By */}
            <Select
              value={filters.sortBy}
              onChange={(value) => updateFilter('sortBy', value)}
              options={[
                { value: 'newest', label: '📅 Mais recentes' },
                { value: 'distance', label: '📍 Mais próximos' },
                { value: 'relevance', label: '⭐ Mais relevantes' }
              ]}
              placeholder="Ordenar por"
            />
          </div>
        )}
      </div>

      {/* Health & Status Section */}
      <div className={styles.section}>
        <button
          onClick={() => toggleSection('health')}
          className={clsx(styles.sectionHeader, {
            [styles.expanded]: expandedSections.health
          })}
        >
          <span className={styles.sectionTitle}>
            <CheckCircleIcon size={18} /> Saúde & Status
          </span>
          <ChevronDownIcon 
            size={20} 
            className={clsx(styles.chevron, {
              [styles.rotated]: expandedSections.health
            })}
          />
        </button>

        {expandedSections.health && (
          <div className={styles.sectionContent}>
            {/* Neutered Status */}
            <div className={styles.filterGroup}>
              <label className={styles.groupLabel}>Castração:</label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.isNeutered === true}
                    onChange={(e) => updateFilter('isNeutered', e.target.checked ? true : null)}
                  />
                  <span>Castrado</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.isNeutered === false}
                    onChange={(e) => updateFilter('isNeutered', e.target.checked ? false : null)}
                  />
                  <span>Não castrado</span>
                </label>
              </div>
            </div>

            {/* Vaccination Status */}
            <div className={styles.filterGroup}>
              <label className={styles.groupLabel}>Vacinação:</label>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.isVaccinated === true}
                    onChange={(e) => updateFilter('isVaccinated', e.target.checked ? true : null)}
                  />
                  <span>Vacinado</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.isVaccinated === false}
                    onChange={(e) => updateFilter('isVaccinated', e.target.checked ? false : null)}
                  />
                  <span>Não vacinado</span>
                </label>
              </div>
            </div>

            {/* Special Health Needs */}
            <div className={styles.filterGroup}>
              <label className={styles.groupLabel}>
                <AlertCircleIcon size={16} />
                Necessidades Especiais:
              </label>
              <div className={styles.checkboxGrid}>
                {healthNeedsOptions.map(need => (
                  <label key={need.id} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={filters.healthNeeds.includes(need.id)}
                      onChange={() => toggleHealthNeed(need.id)}
                    />
                    <span>{need.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Personality Traits Section */}
      <div className={styles.section}>
        <button
          onClick={() => toggleSection('personality')}
          className={clsx(styles.sectionHeader, {
            [styles.expanded]: expandedSections.personality
          })}
        >
          <span className={styles.sectionTitle}>
            <HeartIcon size={18} /> Personalidade
          </span>
          <ChevronDownIcon 
            size={20} 
            className={clsx(styles.chevron, {
              [styles.rotated]: expandedSections.personality
            })}
          />
        </button>

        {expandedSections.personality && (
          <div className={styles.sectionContent}>
            <div className={styles.personalityGrid}>
              {personalityOptions.map(trait => (
                <button
                  key={trait.id}
                  onClick={() => togglePersonalityTrait(trait.id)}
                  className={clsx(styles.personalityButton, {
                    [styles.selected]: filters.personalityTraits.includes(trait.id),
                    [styles[`color${trait.color.charAt(0).toUpperCase() + trait.color.slice(1)}`]]: true
                  })}
                >
                  {trait.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className={styles.activeFilters}>
          {filters.location && (
            <Badge 
              variant="secondary" 
              onRemove={() => updateFilter('location', '')}
            >
              📍 {filters.location}
            </Badge>
          )}
          {filters.isNeutered !== null && (
            <Badge 
              variant="secondary" 
              onRemove={() => updateFilter('isNeutered', null)}
            >
              {filters.isNeutered ? '✂️ Castrado' : '🐾 Não castrado'}
            </Badge>
          )}
          {filters.isVaccinated !== null && (
            <Badge 
              variant="secondary" 
              onRemove={() => updateFilter('isVaccinated', null)}
            >
              {filters.isVaccinated ? '💉 Vacinado' : '🏥 Não vacinado'}
            </Badge>
          )}
          {filters.personalityTraits.length > 0 && (
            <Badge 
              variant="secondary" 
              onRemove={() => updateFilter('personalityTraits', [])}
            >
              🎭 {filters.personalityTraits.length} traço{filters.personalityTraits.length !== 1 ? 's' : ''}
            </Badge>
          )}
          {filters.healthNeeds.length > 0 && (
            <Badge 
              variant="secondary" 
              onRemove={() => updateFilter('healthNeeds', [])}
            >
              ⚕️ {filters.healthNeeds.length} need{filters.healthNeeds.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className={styles.actions}>
        <Button
          variant="primary"
          size="large"
          onClick={applySearch}
          disabled={isLoading}
          className={styles.searchButton}
        >
          <SearchIcon size={20} />
          {isLoading ? 'Buscando...' : 'Buscar'}
        </Button>

        {onSaveSearch && (
          <Button
            variant="outline"
            onClick={saveCurrentSearch}
            disabled={!hasActiveFilters}
            className={styles.saveButton}
          >
            💾 Salvar Busca
          </Button>
        )}
      </div>

      {/* Saved Searches */}
      {savedSearches && savedSearches.length > 0 && (
        <div className={styles.savedSearches}>
          <h4 className={styles.savedSearchesTitle}>Buscas Salvas</h4>
          <div className={styles.savedSearchesList}>
            {savedSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => setFilters(search.filters)}
                className={styles.savedSearchItem}
              >
                <span>{search.name}</span>
                <span className={styles.savedSearchDate}>
                  {new Date(search.timestamp).toLocaleDateString('pt-BR')}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
