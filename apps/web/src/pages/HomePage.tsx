import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  Building2, 
  Globe, 
  FileText, 
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
  Star,
  Timer,
  Shield
} from 'lucide-react';
import CategoryIcons from '../components/search/CategoryIcons';
import { useTranslation } from '../hooks/useTranslation';
import SentryTest from '../components/SentryTest';

// Enhanced asset category definitions with new digital categories
const ASSET_CATEGORIES = [
  {
    id: 'companies',
    title: 'Företag & Bolag',
    icon: Building2,
    color: 'blue',
    items: [
      { name: 'Aktiebolag (AB)', description: 'Kompletta företag med anställda och verksamhet' },
      { name: 'Handelsbolag', description: 'Partnership-baserade företag' },
      { name: 'Enskilda firmor', description: 'Enmansföretag' },
      { name: 'Kommanditbolag', description: 'Begränsade partnership' }
    ]
  },
  {
    id: 'ecommerce',
    title: 'E-handel & Webshops',
    icon: Globe,
    color: 'green',
    items: [
      { name: 'Webshops', description: 'Etablerade e-handelsplattformar' },
      { name: 'Dropshipping', description: 'Dropshipping-verksamheter' },
      { name: 'Marketplace', description: 'Multi-vendor plattformar' },
      { name: 'Subscription', description: 'Prenumerationsbaserade tjänster' }
    ]
  },
  {
    id: 'domains',
    title: 'Domäner & Webbplatser',
    icon: Globe,
    color: 'purple',
    items: [
      { name: 'Premium domäner', description: 'Värdefulla .se, .com domäner' },
      { name: 'Utvecklade sajter', description: 'Färdigbyggda webbplatser' },
      { name: 'Parked domains', description: 'Domäner med trafik' },
      { name: 'Brandable domains', description: 'Unika varumärkesdomäner' }
    ]
  },
  {
    id: 'content',
    title: 'Content & Media',
    icon: FileText,
    color: 'orange',
    items: [
      { name: 'Bloggar', description: 'Etablerade bloggar med trafik' },
      { name: 'YouTube-kanaler', description: 'Monetiserade YouTube-kanaler' },
      { name: 'Podcasts', description: 'Podcast-serier med audience' },
      { name: 'Nyhetssajter', description: 'Nischade nyhetssajter' }
    ]
  },
  {
    id: 'social',
    title: 'Social Media',
    icon: Users,
    color: 'pink',
    items: [
      { name: 'Instagram-konton', description: 'Konton med stora följarbaser' },
      { name: 'TikTok-konton', description: 'Virala TikTok-konton' },
      { name: 'Facebook-sidor', description: 'Etablerade Facebook-sidor' },
      { name: 'LinkedIn-sidor', description: 'B2B LinkedIn-närvaro' }
    ]
  },
  {
    id: 'affiliate',
    title: 'Affiliate & Passive Income',
    icon: TrendingUp,
    color: 'indigo',
    items: [
      { name: 'Affiliate-sajter', description: 'Sajter med passiva inkomster' },
      { name: 'Recensionssajter', description: 'Produktrecensioner med intäkter' },
      { name: 'Email-listor', description: 'Stora, engagerade email-listor' },
      { name: 'Online-kurser', description: 'Monetiserade online-kurser' }
    ]
  }
];

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { t, isEnglish } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const navigate = useNavigate();

  // Company valuation state
  const [revenue, setRevenue] = useState('');
  const [profit, setProfit] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('tech');
  const [employees, setEmployees] = useState('');
  const [yearsFounded, setYearsFounded] = useState('');
  const [assets, setAssets] = useState('');
  const [valuationMethod, setValuationMethod] = useState('multiple');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Enhanced industry data with multiple metrics
  const industryData = {
    tech: { 
      multiple: 12, 
      revenueMultiple: 4.5, 
      name: 'Teknik/IT', 
      growth: '+15%',
      risk: 'Medel',
      description: 'Hög värdering tack vare skalbarhet och tillväxtpotential'
    },
    ecommerce: { 
      multiple: 8, 
      revenueMultiple: 3.2, 
      name: 'E-handel', 
      growth: '+12%',
      risk: 'Medel-Hög',
      description: 'Stark digital närvaro med återkommande kunder'
    },
    consulting: { 
      multiple: 6, 
      revenueMultiple: 2.1, 
      name: 'Konsulting', 
      growth: '+8%',
      risk: 'Låg',
      description: 'Stabil affärsmodell med långsiktiga kundrelationer'
    },
    restaurant: { 
      multiple: 3.5, 
      revenueMultiple: 1.2, 
      name: 'Restaurang/Café', 
      growth: '+3%',
      risk: 'Hög',
      description: 'Platsbaserad verksamhet med återkommande lokala kunder'
    },
    manufacturing: { 
      multiple: 5.8, 
      revenueMultiple: 1.8, 
      name: 'Tillverkning', 
      growth: '+6%',
      risk: 'Medel',
      description: 'Fysiska tillgångar och etablerade leveranskedjor'
    },
    healthcare: { 
      multiple: 9.2, 
      revenueMultiple: 3.8, 
      name: 'Hälsovård/Medicin', 
      growth: '+10%',
      risk: 'Låg',
      description: 'Stabil efterfrågan och reglerad miljö'
    },
    finance: { 
      multiple: 7.1, 
      revenueMultiple: 2.9, 
      name: 'Finansiella tjänster', 
      growth: '+7%',
      risk: 'Medel',
      description: 'Återkommande intäkter och stark kapitalbas'
    },
    retail: { 
      multiple: 4.2, 
      revenueMultiple: 1.5, 
      name: 'Detaljhandel', 
      growth: '+4%',
      risk: 'Medel-Hög',
      description: 'Varierande lönsamhet beroende på läge och koncept'
    }
  };

  // Calculate company valuation with multiple methods
  const valuationResults = React.useMemo(() => {
    const revenueNumber = parseFloat(revenue) || 0;
    const profitNumber = parseFloat(profit) || 0;
    const assetsNumber = parseFloat(assets) || 0;
    const employeesNumber = parseFloat(employees) || 0;
    const yearsNumber = parseFloat(yearsFounded) || 0;
    
    const industry = industryData[selectedIndustry];
    
    // Different valuation methods
    const profitMultiple = profitNumber * industry.multiple;
    const revenueMultiple = revenueNumber * industry.revenueMultiple;
    const assetBased = assetsNumber * 0.8; // 80% of book value
    const employeeBased = employeesNumber * 1500000; // 1.5M SEK per employee average
    
    // Weighted average based on company maturity
    const maturityWeight = Math.min(yearsNumber / 10, 1); // Max weight at 10+ years
    const mainValue = profitNumber > 0 ? profitMultiple : revenueMultiple;
    const finalValue = mainValue * (0.7 + maturityWeight * 0.3);
    
    return {
      main: finalValue,
      profit: profitMultiple,
      revenue: revenueMultiple,
      assets: assetBased,
      employee: employeeBased,
      range: {
        low: finalValue * 0.7,
        high: finalValue * 1.3
      }
    };
  }, [revenue, profit, assets, employees, yearsFounded, selectedIndustry]);

  const currentIndustry = industryData[selectedIndustry];

  // Get localized categories
  const getLocalizedCategories = () => {
    if (isEnglish) {
      return [
        {
          id: 'companies',
          title: 'Companies & Corporations',
          icon: Building2,
          color: 'blue',
          items: [
            { name: 'Limited Companies (AB)', description: 'Complete companies with employees and operations' },
            { name: 'Partnerships', description: 'Partnership-based companies' },
            { name: 'Sole Proprietorships', description: 'Single-person businesses' },
            { name: 'Limited Partnerships', description: 'Limited liability partnerships' }
          ]
        },
        {
          id: 'ecommerce',
          title: 'E-commerce & Webshops',
          icon: Globe,
          color: 'green',
          items: [
            { name: 'Webshops', description: 'Established e-commerce platforms' },
            { name: 'Dropshipping', description: 'Dropshipping businesses' },
            { name: 'Marketplace', description: 'Multi-vendor platforms' },
            { name: 'Subscription', description: 'Subscription-based services' }
          ]
        },
        {
          id: 'domains',
          title: 'Domains & Websites',
          icon: Globe,
          color: 'purple',
          items: [
            { name: 'Premium domains', description: 'Valuable .se, .com domains' },
            { name: 'Developed sites', description: 'Ready-made websites' },
            { name: 'Parked domains', description: 'Domains with traffic' },
            { name: 'Brandable domains', description: 'Unique brand domains' }
          ]
        },
        {
          id: 'content',
          title: 'Content & Media',
          icon: FileText,
          color: 'orange',
          items: [
            { name: 'Blogs', description: 'Established blogs with traffic' },
            { name: 'YouTube channels', description: 'Monetized YouTube channels' },
            { name: 'Podcasts', description: 'Podcast series with audience' },
            { name: 'News sites', description: 'Niche news websites' }
          ]
        },
        {
          id: 'social',
          title: 'Social Media',
          icon: Users,
          color: 'pink',
          items: [
            { name: 'Instagram accounts', description: 'Accounts with large followings' },
            { name: 'TikTok accounts', description: 'Viral TikTok accounts' },
            { name: 'Facebook pages', description: 'Established Facebook pages' },
            { name: 'LinkedIn pages', description: 'B2B LinkedIn presence' }
          ]
        },
        {
          id: 'affiliate',
          title: 'Affiliate & Passive Income',
          icon: TrendingUp,
          color: 'indigo',
          items: [
            { name: 'Affiliate sites', description: 'Sites with passive income' },
            { name: 'Review sites', description: 'Product reviews with revenue' },
            { name: 'Email lists', description: 'Large, engaged email lists' },
            { name: 'Online courses', description: 'Monetized online courses' }
          ]
        }
      ];
    }
    return ASSET_CATEGORIES;
  };

  // Get localized deals
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    navigate(`/listings?${params.toString()}`);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
      orange: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
      red: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <>
      <Helmet>
        <title>{t('homepage.title')}</title>
        <meta name="description" content={t('homepage.meta-description')} />
        <meta name="keywords" content={t('homepage.meta-keywords')} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Sentry Test Component - Development Only */}
        {import.meta.env.DEV && (
          <div className="container mx-auto px-4 pt-4">
            <SentryTest />
          </div>
        )}
        
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-indigo-500/5 to-purple-600/5"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6">
                <span className="block">{t('homepage.hero.title.line1')}</span>
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {t('homepage.hero.title.line2')}
                </span>
              </h1>
              
              <p className="max-w-3xl mx-auto text-xl sm:text-2xl text-slate-600 mb-8 leading-relaxed">
                {t('homepage.hero.subtitle')}
              </p>
              
              {/* Prominent Search Bar */}
              <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSearch} className="relative">
                  <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl shadow-xl p-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('homepage.search.placeholder')}
                        className="w-full pl-12 pr-4 py-4 text-lg border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-4 border-0 rounded-xl bg-slate-50 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">{t('homepage.search.all-categories')}</option>
                      {getLocalizedCategories().map(category => (
                        <option key={category.id} value={category.id}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      type="submit"
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {t('homepage.search.button')}
                    </button>
                  </div>
                </form>
                
                {/* Category Icons */}
                <div className="mt-8">
                  <CategoryIcons />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Asset Categories */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                {t('homepage.categories.title')}
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                {t('homepage.categories.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {getLocalizedCategories().map((category) => {
                const IconComponent = category.icon;
                return (
                  <div
                    key={category.id}
                    className={`${getColorClasses(category.color)} border-2 rounded-2xl p-8 transition-all duration-200 cursor-pointer transform hover:scale-105`}
                    onClick={() => navigate(`/listings?category=${category.id}`)}
                  >
                    <div className="flex items-center mb-6">
                      <IconComponent className="w-8 h-8 mr-3" />
                      <h3 className="text-xl font-bold">{category.title}</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {category.items.map((item, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-sm">{item.name}</div>
                            <div className="text-xs opacity-75">{item.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <Link
                to="/listings"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Utforska alla kategorier
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Så fungerar 123Hansa — gränsen mot förmedling, se docs/BUSINESS.md */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Så fungerar 123Hansa
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                En marknadsplats där köpare och säljare av bolag hittar varandra
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Säljaren annonserar</h3>
                <p className="text-slate-600">
                  Bolaget beskrivs med de uppgifter säljaren väljer att visa. Känsligt material delas först senare, med den säljaren godkänt.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Köparen tar kontakt</h3>
                <p className="text-slate-600">
                  Intresserade köpare kontaktar säljaren via plattformen. Säljaren väljer själv vem som går vidare.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Parterna gör upp själva</h3>
                <p className="text-slate-600">
                  Förhandling, avtal och betalning sköts direkt mellan köpare och säljare, gärna med egna rådgivare. 123Hansa är inte part i affären.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ROI Calculator Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-3xl shadow-2xl overflow-hidden">
              <div className="px-8 py-16 lg:px-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                      💰 Beräkna värdet på ditt företag
                    </h2>
                    <p className="text-blue-100 text-lg mb-8">
                      Använd vår professionella värderingsverktyg för att få en uppskattning 
                      av ditt företags marknadsvärde helt gratis.
                    </p>
                    
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">Professionell värdering</h4>
                          <p className="text-blue-200 text-sm">Baserat på branschstandard och marknadsdata</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Timer className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">Snabb bedömning</h4>
                          <p className="text-blue-200 text-sm">Få din uppskattning på bara 2 minuter</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">Marknadsanpassad</h4>
                          <p className="text-blue-200 text-sm">Uppdaterad med aktuella marknadsförhållanden</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                    <div className="text-center mb-8">
                      <h3 className="text-3xl font-bold text-slate-900 mb-3">
                        💰 Professionell Företagsvärdering
                      </h3>
                      <p className="text-gray-600">
                        En grov uppskattning utifrån branschmultiplar
                      </p>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Årsomsättning (SEK) *
                          </label>
                          <input
                            type="number"
                            placeholder="2,500,000"
                            value={revenue}
                            onChange={(e) => setRevenue(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Nettovinst (SEK) *
                          </label>
                          <input
                            type="number"
                            placeholder="500,000"
                            value={profit}
                            onChange={(e) => setProfit(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Bransch & Sektor
                        </label>
                        <select 
                          value={selectedIndustry} 
                          onChange={(e) => setSelectedIndustry(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                        >
                          {Object.entries(industryData).map(([key, data]) => (
                            <option key={key} value={key}>
                              {data.name} - Tillväxt: {data.growth}
                            </option>
                          ))}
                        </select>
                        <p className="text-sm text-gray-600 mt-2">
                          {currentIndustry.description}
                        </p>
                      </div>

                      {/* Advanced Options Toggle */}
                      <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center justify-center w-full py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-700">
                          {showAdvanced ? 'Dölj avancerade alternativ' : 'Visa avancerade alternativ'}
                        </span>
                        <ArrowRight className={`w-4 h-4 ml-2 transform transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
                      </button>

                      {/* Advanced Fields */}
                      {showAdvanced && (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Antal anställda
                              </label>
                              <input
                                type="number"
                                placeholder="15"
                                value={employees}
                                onChange={(e) => setEmployees(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">
                                År sedan grundades
                              </label>
                              <input
                                type="number"
                                placeholder="8"
                                value={yearsFounded}
                                onChange={(e) => setYearsFounded(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Tillgångar/Bokfört värde (SEK)
                            </label>
                            <input
                              type="number"
                              placeholder="1,200,000"
                              value={assets}
                              onChange={(e) => setAssets(e.target.value)}
                              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      )}

                      {/* Industry Information */}
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
                        <h4 className="font-semibold text-indigo-900 mb-3">Branschanalys: {currentIndustry.name}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                            <span className="text-gray-700">Tillväxt: <strong>{currentIndustry.growth}</strong></span>
                          </div>
                          <div className="flex items-center">
                            <Shield className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="text-gray-700">Risk: <strong>{currentIndustry.risk}</strong></span>
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-600 mr-2" />
                            <span className="text-gray-700">P/E: <strong>{currentIndustry.multiple}x</strong></span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Valuation Results */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-200">
                        <div className="text-center mb-6">
                          <p className="text-sm font-semibold text-blue-700 mb-2">Uppskattat företagsvärde:</p>
                          <p className="text-4xl font-bold text-blue-600 mb-2">
                            {valuationResults.main.toLocaleString('sv-SE')} SEK
                          </p>
                          <div className="flex items-center justify-center space-x-4 text-sm text-blue-600">
                            <span>Span: {valuationResults.range.low.toLocaleString('sv-SE')} - {valuationResults.range.high.toLocaleString('sv-SE')} SEK</span>
                          </div>
                        </div>

                        {/* Multiple Valuation Methods */}
                        {showAdvanced && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg border border-blue-100">
                              <h5 className="font-semibold text-gray-900 mb-2">Vinstbaserad värdering</h5>
                              <p className="text-2xl font-bold text-green-600">
                                {valuationResults.profit.toLocaleString('sv-SE')} SEK
                              </p>
                              <p className="text-xs text-gray-600">Baserat på {currentIndustry.multiple}x vinst-multipel</p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg border border-blue-100">
                              <h5 className="font-semibold text-gray-900 mb-2">Omsättningsbaserad</h5>
                              <p className="text-2xl font-bold text-blue-600">
                                {valuationResults.revenue.toLocaleString('sv-SE')} SEK
                              </p>
                              <p className="text-xs text-gray-600">Baserat på {currentIndustry.revenueMultiple}x omsättningsmultipel</p>
                            </div>
                            
                            {parseFloat(assets) > 0 && (
                              <div className="bg-white p-4 rounded-lg border border-blue-100">
                                <h5 className="font-semibold text-gray-900 mb-2">Tillgångsbaserad</h5>
                                <p className="text-2xl font-bold text-purple-600">
                                  {valuationResults.assets.toLocaleString('sv-SE')} SEK
                                </p>
                                <p className="text-xs text-gray-600">80% av bokförda tillgångar</p>
                              </div>
                            )}
                            
                            {parseFloat(employees) > 0 && (
                              <div className="bg-white p-4 rounded-lg border border-blue-100">
                                <h5 className="font-semibold text-gray-900 mb-2">Per anställd</h5>
                                <p className="text-2xl font-bold text-orange-600">
                                  {valuationResults.employee.toLocaleString('sv-SE')} SEK
                                </p>
                                <p className="text-xs text-gray-600">1.5M SEK per anställd (branschsnitt)</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Accuracy & Disclaimer */}
                        <div className="bg-white p-4 rounded-lg border border-blue-100 text-center">
                          <p className="text-xs text-gray-600">
                            En schablonberäkning, inte en värdering. Anlita en rådgivare inför en affär.
                          </p>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <Link
                          to="/valuation"
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-center block text-lg"
                        >
                          📊 Få detaljerad professionell värdering
                        </Link>
                        
                        <button
                          onClick={() => {
                            const valuationData = {
                              revenue,
                              profit,
                              industry: selectedIndustry,
                              employees,
                              yearsFounded,
                              assets,
                              valuation: valuationResults.main,
                              timestamp: new Date().toISOString()
                            };
                            localStorage.setItem('latestValuation', JSON.stringify(valuationData));
                            toast.success('Värdering sparad! Du kan komma åt den i din profil.');
                          }}
                          className="w-full bg-white border-2 border-blue-600 text-blue-600 font-bold py-3 px-6 rounded-xl hover:bg-blue-50 transition-all duration-200 text-center"
                        >
                          💾 Spara värdering
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Redo att börja din affärsresa?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Lägg upp ditt bolag eller hitta nästa förvärv.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/create-listing"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors duration-200 shadow-lg"
              >
                Sälj ditt företag
              </Link>
              <Link
                to="/listings"
                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                Köp ett företag
              </Link>
            </div>
          </div>
        </section>
      </div>

    </>
  );
};

export default HomePage;