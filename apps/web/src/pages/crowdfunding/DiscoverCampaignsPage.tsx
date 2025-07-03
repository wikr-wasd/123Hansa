import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  TrendingUp, 
  Clock,
  DollarSign,
  Users,
  ChevronDown,
  X
} from 'lucide-react';
import CampaignCard from '../../components/crowdfunding/CampaignCard';
import { demoCampaigns, campaignCategories } from '../../data/crowdfundingData';

type SortOption = 'trending' | 'newest' | 'ending-soon' | 'most-funded' | 'most-backers';
type ViewMode = 'grid' | 'list';

const DiscoverCampaignsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000000 });
  const [progressRange, setProgressRange] = useState({ min: 0, max: 100 });

  // Update URL when filters change
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    setSearchParams(params);
  }, [searchQuery, selectedCategory, setSearchParams]);

  // Filter and sort campaigns
  const filteredCampaigns = useMemo(() => {
    let filtered = demoCampaigns.filter(campaign => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!campaign.title.toLowerCase().includes(query) && 
            !campaign.description.toLowerCase().includes(query) &&
            !campaign.creator.name.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all') {
        const categoryMap: { [key: string]: string[] } = {
          'tech-startup': ['Tech Startup', 'HealthTech', 'EdTech', 'AgriTech', 'Green Tech'],
          'restaurants': ['Kaféer & Restauranger', 'Restauranger'],
          'physical': ['Gym & Wellness', 'Retail'],
          'innovation': ['Innovation', 'EdTech', 'AgriTech', 'HealthTech', 'Green Tech'],
          'expansion': ['Expansion', 'Fashion']
        };
        
        const allowedCategories = categoryMap[selectedCategory] || [];
        if (!allowedCategories.some(cat => campaign.category.includes(cat))) {
          return false;
        }
      }

      // Price range filter
      if (campaign.fundingGoal < priceRange.min || campaign.fundingGoal > priceRange.max) {
        return false;
      }

      // Progress range filter
      const progress = (campaign.currentAmount / campaign.fundingGoal) * 100;
      if (progress < progressRange.min || progress > progressRange.max) {
        return false;
      }

      return true;
    });

    // Sort campaigns
    switch (sortBy) {
      case 'trending':
        filtered.sort((a, b) => b.backers - a.backers);
        break;
      case 'newest':
        filtered.sort((a, b) => b.daysLeft - a.daysLeft);
        break;
      case 'ending-soon':
        filtered.sort((a, b) => a.daysLeft - b.daysLeft);
        break;
      case 'most-funded':
        filtered.sort((a, b) => b.currentAmount - a.currentAmount);
        break;
      case 'most-backers':
        filtered.sort((a, b) => b.backers - a.backers);
        break;
      default:
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy, priceRange, progressRange]);

  const sortOptions = [
    { value: 'trending', label: 'Trending', icon: TrendingUp },
    { value: 'newest', label: 'Nyast', icon: Clock },
    { value: 'ending-soon', label: 'Slutar snart', icon: Clock },
    { value: 'most-funded', label: 'Mest finansierat', icon: DollarSign },
    { value: 'most-backers', label: 'Flest supporters', icon: Users }
  ];

  return (
    <>
      <Helmet>
        <title>Upptäck Kampanjer - Tubba Crowdfunding</title>
        <meta name="description" content="Bläddra bland hundratals affärsidéer och hitta projekt att stötta. Filtrera efter kategori, finansieringsmål och progress." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Upptäck Kampanjer</h1>
                <p className="text-gray-600 mt-1">
                  {filteredCampaigns.length} projekt att utforska
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Sök kampanjer, företag eller skapare..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6">
            {/* Sidebar Filters */}
            <div className={`lg:w-80 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Filter</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Kategorier</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value="all"
                        checked={selectedCategory === 'all'}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-gray-700">Alla kategorier</span>
                      <span className="ml-auto text-gray-500 text-sm">({demoCampaigns.length})</span>
                    </label>
                    {campaignCategories.map(category => (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category.id}
                          checked={selectedCategory === category.id}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="ml-2 text-gray-700 flex items-center">
                          <span className="mr-2">{category.icon}</span>
                          {category.name}
                        </span>
                        <span className="ml-auto text-gray-500 text-sm">({category.count})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Funding Goal Range */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Finansieringsmål</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Minimum</label>
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Maximum</label>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="5000000"
                      />
                    </div>
                  </div>
                </div>

                {/* Progress Range */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Progress</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Alla projekt', min: 0, max: 100 },
                      { label: 'Precis startade (0-25%)', min: 0, max: 25 },
                      { label: 'På väg (25-75%)', min: 25, max: 75 },
                      { label: 'Nästan klara (75-100%)', min: 75, max: 100 },
                      { label: 'Överfinansierade (100%+)', min: 100, max: 1000 }
                    ].map(option => (
                      <label key={option.label} className="flex items-center">
                        <input
                          type="radio"
                          name="progress"
                          checked={progressRange.min === option.min && progressRange.max === option.max}
                          onChange={() => setProgressRange({ min: option.min, max: option.max })}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="ml-2 text-gray-700 text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Reset Filters */}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setPriceRange({ min: 0, max: 5000000 });
                    setProgressRange({ min: 0, max: 100 });
                  }}
                  className="w-full px-4 py-2 text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  Rensa filter
                </button>
              </div>
            </div>

            {/* Campaign Grid/List */}
            <div className="flex-1">
              {filteredCampaigns.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Inga kampanjer hittades</h3>
                  <p className="text-gray-600 mb-4">Prova att justera dina filter eller söktermer.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setPriceRange({ min: 0, max: 5000000 });
                      setProgressRange({ min: 0, max: 100 });
                    }}
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    Rensa alla filter
                  </button>
                </div>
              ) : (
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-6'
                }>
                  {filteredCampaigns.map(campaign => (
                    <CampaignCard 
                      key={campaign.id} 
                      campaign={campaign}
                      size={viewMode === 'list' ? 'large' : 'medium'}
                      className={viewMode === 'list' ? 'flex flex-row h-64' : ''}
                    />
                  ))}
                </div>
              )}

              {/* Load More Button (for future pagination) */}
              {filteredCampaigns.length > 0 && (
                <div className="mt-12 text-center">
                  <button className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    Ladda fler kampanjer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filter Overlay */}
        {showFilters && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
              {/* Filter content would go here - same as sidebar */}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DiscoverCampaignsPage;