import { Campaign } from '../components/crowdfunding/CampaignCard';

export const demoCampaigns: Campaign[] = [
  // Tech Startups
  {
    id: 'foodtech-ai-1',
    title: 'FoodTech AI - Smart Restaurang Ordering',
    description: 'AI-driven beställningssystem som ökar restaurangförsäljning med 30%. Hjälp oss revolutionera restaurangbranschen med intelligent teknologi.',
    fundingGoal: 750000,
    currentAmount: 425000,
    daysLeft: 23,
    backers: 89,
    category: 'Tech Startup',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=400&fit=crop',
    creator: {
      name: 'Erik Lundberg',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    location: 'Stockholm',
    featured: true
  },
  {
    id: 'greentech-energy-2',
    title: 'GreenTech Energy - Solcellslösningar för Småföretag',
    description: 'Låt småföretag spara pengar och miljö med våra prisvärda solcellspaket. Komplett installation och service inkluderat.',
    fundingGoal: 1200000,
    currentAmount: 890000,
    daysLeft: 31,
    backers: 156,
    category: 'Green Tech',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop',
    creator: {
      name: 'Anna Karlsson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c917?w=100&h=100&fit=crop&crop=face'
    },
    location: 'Göteborg'
  },
  {
    id: 'healthtech-app-3',
    title: 'HealthTech Wellness - Mental Hälsa App',
    description: 'En app som kopplar ihop användare med certifierade terapeuter för flexibel och prisvärd mentalvård.',
    fundingGoal: 500000,
    currentAmount: 523000,
    daysLeft: 12,
    backers: 267,
    category: 'HealthTech',
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&h=400&fit=crop',
    creator: {
      name: 'David Andersson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    location: 'Malmö'
  },

  // Restaurants & Cafes
  {
    id: 'nordic-coffee-4',
    title: 'Nordic Coffee Roastery - Stockholm Flagship',
    description: 'Öppna vår första rostboutique i Stockholms innerstad. Specialkaffe från nordiska bönder med hållbar profil.',
    fundingGoal: 1200000,
    currentAmount: 890000,
    daysLeft: 12,
    backers: 156,
    category: 'Kaféer & Restauranger',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop',
    creator: {
      name: 'Sofia Bergström',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    },
    location: 'Stockholm',
    featured: true
  },
  {
    id: 'street-food-5',
    title: 'Nordic Street Food - Food Truck Expansion',
    description: 'Utöka vår populära food truck-verksamhet med två nya fordon. Nordisk streetfood med lokala råvaror.',
    fundingGoal: 800000,
    currentAmount: 445000,
    daysLeft: 28,
    backers: 89,
    category: 'Restauranger',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop',
    creator: {
      name: 'Marcus Johansson',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
    },
    location: 'Göteborg'
  },

  // Physical Businesses
  {
    id: 'fitness-studio-6',
    title: 'Nordic Fitness - Boutique Gym & Wellness',
    description: 'Skapa Nordens första helt hållbara gym med solceller, återvunnen utrustning och ekologiska produkter.',
    fundingGoal: 2000000,
    currentAmount: 1250000,
    daysLeft: 45,
    backers: 234,
    category: 'Gym & Wellness',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
    creator: {
      name: 'Lisa Nordström',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face'
    },
    location: 'Uppsala'
  },
  {
    id: 'eco-store-7',
    title: 'Zero Waste Store - Helt förpackningsfri butik',
    description: 'Öppna Stockholms första helt förpackningsfria butik där kunder tar med egna behållare.',
    fundingGoal: 650000,
    currentAmount: 378000,
    daysLeft: 19,
    backers: 145,
    category: 'Retail',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop',
    creator: {
      name: 'Emma Svensson',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face'
    },
    location: 'Stockholm'
  },

  // Expansion Projects
  {
    id: 'greenclean-expansion-8',
    title: 'GreenClean - Expansion till Norge och Danmark',
    description: 'Utöka vår ekologiska städtjänst till hela Norden. Proven business model som redan är lönsam i Sverige.',
    fundingGoal: 2000000,
    currentAmount: 1250000,
    daysLeft: 31,
    backers: 234,
    category: 'Expansion',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=400&fit=crop',
    creator: {
      name: 'Johan Petersson',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face'
    },
    location: 'Stockholm',
    featured: true
  },
  {
    id: 'fashion-brand-9',
    title: 'Sustainable Fashion - Nordisk Klädmärke',
    description: 'Lansera vårt hållbara klädmärke med produktion i Sverige. Ekologiska material och fair trade.',
    fundingGoal: 900000,
    currentAmount: 567000,
    daysLeft: 22,
    backers: 178,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
    creator: {
      name: 'Maja Lindqvist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
    },
    location: 'Malmö'
  },

  // Innovation & R&D
  {
    id: 'biotech-research-10',
    title: 'BioTech Innovation - Miljövänlig Plastersättning',
    description: 'Utveckla och kommersialisera vår patent-pending bioplast från svenska skogsrester.',
    fundingGoal: 3000000,
    currentAmount: 1890000,
    daysLeft: 67,
    backers: 312,
    category: 'Innovation',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=400&fit=crop',
    creator: {
      name: 'Dr. Anders Holm',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    location: 'Umeå'
  },
  {
    id: 'edtech-platform-11',
    title: 'EdTech Learning - AI-Driven Utbildningsplattform',
    description: 'Personaliserad utbildning med AI för svenska småföretagare. Läs på ditt eget tempo, få skräddarsydda kurser.',
    fundingGoal: 1500000,
    currentAmount: 789000,
    daysLeft: 38,
    backers: 145,
    category: 'EdTech',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
    creator: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=100&h=100&fit=crop&crop=face'
    },
    location: 'Stockholm'
  },
  {
    id: 'agritech-farming-12',
    title: 'AgriTech Nordic - Smart Odling för Framtiden',
    description: 'IoT-sensorer och AI för optimerad odling. Hjälp svenska bönder öka skörd med 40% och minska vattenanvändning.',
    fundingGoal: 2200000,
    currentAmount: 1344000,
    daysLeft: 44,
    backers: 189,
    category: 'AgriTech',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop',
    creator: {
      name: 'Nils Gustafsson',
      avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop&crop=face'
    },
    location: 'Skåne'
  }
];

export const campaignCategories = [
  { 
    id: 'tech-startup', 
    name: 'Tech Startups', 
    description: 'SaaS, appar, AI-lösningar',
    icon: '💻',
    count: demoCampaigns.filter(c => c.category.includes('Tech')).length 
  },
  { 
    id: 'restaurants', 
    name: 'Restauranger & Kaféer', 
    description: 'Nya lokaler och koncept',
    icon: '🍽️',
    count: demoCampaigns.filter(c => c.category.includes('Restaurang') || c.category.includes('Kafé')).length 
  },
  { 
    id: 'physical', 
    name: 'Fysiska Verksamheter', 
    description: 'Butiker, gym, wellness',
    icon: '🏪',
    count: demoCampaigns.filter(c => ['Gym & Wellness', 'Retail'].includes(c.category)).length 
  },
  { 
    id: 'innovation', 
    name: 'Innovation & Tech', 
    description: 'Produktutveckling, patent, R&D',
    icon: '💡',
    count: demoCampaigns.filter(c => ['Innovation', 'EdTech', 'AgriTech', 'HealthTech', 'Green Tech'].includes(c.category)).length 
  },
  { 
    id: 'expansion', 
    name: 'Expansion & Tillväxt', 
    description: 'Befintliga företag, nya marknader',
    icon: '🌱',
    count: demoCampaigns.filter(c => ['Expansion', 'Fashion'].includes(c.category)).length 
  }
];

export const getFeaturedCampaigns = () => demoCampaigns.filter(c => c.featured);
export const getTrendingCampaigns = () => demoCampaigns.sort((a, b) => b.backers - a.backers).slice(0, 6);
export const getRecentCampaigns = () => demoCampaigns.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 4);
export const getCampaignsByCategory = (category: string) => demoCampaigns.filter(c => c.category === category);