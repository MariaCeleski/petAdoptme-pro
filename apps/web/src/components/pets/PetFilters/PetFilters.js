'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useDebounce } from '@/hooks/useDebounce';
import { Input, Select, Button, Card, Badge } from '@/components/ui';
import { 
  SearchIcon, 
  FilterIcon, 
  XIcon, 
  MapPinIcon,
  SlidersHorizontalIcon 
} from 'lucide-react';
import styles from './PetFilters.module.css';
import { clsx } from 'clsx';

// Dynamic import para evitar problemas de SSR
const AdvancedSearch = dynamic(() => import('../AdvancedSearch/AdvancedSearch'), {
  ssr: false,
  loading: () => <div className={styles.loading}>Carregando busca avançada...</div>
});

/**
 * PetFilters Client Component
 * Implements interactive filters with real-time search
 * Requirements: 4.1-4.6 (Public catalog filters), 4.7 (Real-time updates)
 */
export default function PetFilters({
  filters = {},
  onFiltersChange,
  onSearch,
  isLoading = false,
  resultCount = 0,
  className,
  showResultCount = true,
  expanded = false,
  onExpandToggle,
  layout = 'horizontal' // 'horizontal' | 'vertical' | 'compact'
}) {
  
  // Internal state for search input (to avoid lag during typing)
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  
  // Debounce search input to avoid too many API calls
  const debouncedSearch = useDebounce(searchInput, 300);

  // Species options (Requirement 4.2)
  const speciesOptions = [
    { value: '', label: 'Todas as espécies' },
    { value: 'DOG', label: 'Cachorro' },
    { value: 'CAT', label: 'Gato' }
  ];

  // Size options (Requirement 4.3)  
  const sizeOptions = [
    { value: '', label: 'Todos os tamanhos' },
    { value: 'SMALL', label: 'Pequeno' },
    { value: 'MEDIUM', label: 'Médio' },
    { value: 'LARGE', label: 'Grande' }
  ];

  // Gender options (Requirement 4.5)
  const genderOptions = [
    { value: '', label: 'Todos os gêneros' },
    { value: 'MALE', label: 'Macho' },
    { value: 'FEMALE', label: 'Fêmea' }
  ];

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    onFiltersChange?.(newFilters);
  }, [filters, onFiltersChange]);

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchInput(value);
  }, []);

  // Effect to trigger search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== (filters.search || '')) {
      onSearch?.(debouncedSearch);
    }
  }, [debouncedSearch, filters.search, onSearch]);

  // Sync search input with external filters
  useEffect(() => {
    if (filters.search !== searchInput) {
      setSearchInput(filters.search || '');
    }
  }, [filters.search]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    onFiltersChange?.({
      species: '',
      size: '',
      gender: '',
      location: '',
      search: ''
    });
  }, [onFiltersChange]);

  // Toggle expanded state
  const handleExpandToggle = useCallback(() => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpandToggle?.(newExpanded);
  }, [isExpanded, onExpandToggle]);

  // Check if any filters are active
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    key !== 'page' && key !== 'limit' && value && value !== ''
  );

  // Count active filters
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => 
    key !== 'page' && key !== 'limit' && value && value !== ''
  ).length;

  // Render search bar
  const renderSearchBar = () => (
    <div className={styles.searchContainer}>
      <Input
        type="text"
        placeholder="Buscar por nome ou raça..."
        value={searchInput}
        onChange={handleSearchChange}
        disabled={isLoading}
        leftIcon={<SearchIcon size={18} />}
        rightElement={searchInput && (
          <Button
            variant="ghost"
            size="small"
            onClick={() => setSearchInput('')}
            className={styles.clearSearchButton}
          >
            <XIcon size={16} />
          </Button>
        )}
        className={styles.searchInput}
      />
      
      <Button
        variant="outline"
        onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
        className={styles.advancedSearchButton}
        title="Abrir busca avançada"
      >
        <SlidersHorizontalIcon size={16} />
      </Button>
      
      {layout === 'compact' && (
        <Button
          variant="outline"
          onClick={handleExpandToggle}
          className={styles.expandButton}
          aria-expanded={isExpanded}
        >
          <FilterIcon size={16} />
          {activeFilterCount > 0 && (
            <Badge variant="primary" size="small" className={styles.filterBadge}>
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      )}
    </div>
  );

  // Render filter controls
  const renderFilters = () => (
    <div className={clsx(
      styles.filtersRow,
      styles[layout],
      { [styles.expanded]: isExpanded }
    )}>
      <div className={styles.selectWrapper}>
        <Select
          value={filters.species || ''}
          onChange={(value) => handleFilterChange('species', value)}
          options={speciesOptions}
          disabled={isLoading}
          placeholder="Espécie"
          className={styles.filterSelect}
        />
      </div>

      <div className={styles.selectWrapper}>
        <Select
          value={filters.size || ''}
          onChange={(value) => handleFilterChange('size', value)}
          options={sizeOptions}
          disabled={isLoading}
          placeholder="Tamanho"
          className={styles.filterSelect}
        />
      </div>

      <div className={styles.selectWrapper}>
        <Select
          value={filters.gender || ''}
          onChange={(value) => handleFilterChange('gender', value)}
          options={genderOptions}
          disabled={isLoading}
          placeholder="Gênero"
          className={styles.filterSelect}
        />
      </div>

      <div className={styles.selectWrapper}>
        <Input
          type="text"
          placeholder="Localização"
          value={filters.location || ''}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          disabled={isLoading}
          leftIcon={<MapPinIcon size={18} />}
          className={styles.locationInput}
        />
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          onClick={handleClearFilters}
          disabled={isLoading}
          className={styles.clearButton}
        >
          <XIcon size={16} />
          Limpar
        </Button>
      )}
    </div>
  );

  // Render active filter tags
  const renderActiveFilters = () => {
    if (!hasActiveFilters) return null;

    return (
      <div className={styles.activeFilters}>
        {filters.species && (
          <Badge 
            variant="secondary" 
            className={styles.filterTag}
            onRemove={() => handleFilterChange('species', '')}
          >
            {speciesOptions.find(opt => opt.value === filters.species)?.label}
          </Badge>
        )}
        
        {filters.size && (
          <Badge 
            variant="secondary" 
            className={styles.filterTag}
            onRemove={() => handleFilterChange('size', '')}
          >
            {sizeOptions.find(opt => opt.value === filters.size)?.label}
          </Badge>
        )}
        
        {filters.gender && (
          <Badge 
            variant="secondary" 
            className={styles.filterTag}
            onRemove={() => handleFilterChange('gender', '')}
          >
            {genderOptions.find(opt => opt.value === filters.gender)?.label}
          </Badge>
        )}
        
        {filters.location && (
          <Badge 
            variant="secondary" 
            className={styles.filterTag}
            onRemove={() => handleFilterChange('location', '')}
          >
            📍 {filters.location}
          </Badge>
        )}
        
        {filters.search && (
          <Badge 
            variant="secondary" 
            className={styles.filterTag}
            onRemove={() => {
              setSearchInput('');
              handleFilterChange('search', '');
            }}
          >
            🔍 {filters.search}
          </Badge>
        )}
      </div>
    );
  };

  // Render result count
  const renderResultCount = () => {
    if (!showResultCount) return null;
    
    return (
      <div className={styles.resultCount}>
        {isLoading ? (
          <span className={styles.loading}>Buscando...</span>
        ) : (
          <span>
            {resultCount > 0 
              ? `${resultCount} pet${resultCount !== 1 ? 's' : ''} encontrado${resultCount !== 1 ? 's' : ''}`
              : 'Nenhum pet encontrado'
            }
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      <div className={clsx(styles.petFiltersWrapper, className)}>
        <Card className={clsx(styles.petFilters, styles[layout])}>
          <Card.Body>
            {/* Search Bar */}
            {renderSearchBar()}

            {/* Filter Controls */}
            {(layout !== 'compact' || isExpanded) && renderFilters()}

            {/* Active Filter Tags */}
            {renderActiveFilters()}

            {/* Result Count */}
            {renderResultCount()}
          </Card.Body>
        </Card>
      </div>

      {/* Advanced Search Modal/Panel */}
      {showAdvancedSearch && (
        <div className={styles.advancedSearchContainer}>
          <AdvancedSearch 
            onSearch={(advancedFilters) => {
              onFiltersChange?.(advancedFilters);
              setShowAdvancedSearch(false);
            }}
            isLoading={isLoading}
          />
        </div>
      )}
    </>
  );
}

// Layout variants
PetFilters.Horizontal = function PetFiltersHorizontal(props) {
  return <PetFilters {...props} layout="horizontal" />;
};

PetFilters.Vertical = function PetFiltersVertical(props) {
  return <PetFilters {...props} layout="vertical" />;
};

PetFilters.Compact = function PetFiltersCompact(props) {
  return <PetFilters {...props} layout="compact" />;
};