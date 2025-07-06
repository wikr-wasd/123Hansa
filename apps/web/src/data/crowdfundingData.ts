import { Campaign } from '../components/crowdfunding/CampaignCard';

export const demoCampaigns: Campaign[] = [
  // Tech Startups
  {
    id: 'foodtech-ai-1',
    title: 'FoodTech AI - Smart Restaurang Ordering',
    description: 'Vår revolutionerande AI-plattform transformerar restaurangbranschen genom att automatisera beställningsprocessen och öka försäljningen med upp till 30%. Med maskininlärning analyserar systemet kundbeteenden, optimerar menyer i realtid och föreslår personliga rekommendationer. Redan testat på 15 restauranger i Stockholm med fantastiska resultat - genomsnittlig orderökning på 28% och kundnöjdhet över 95%. Nu behöver vi din hjälp för att skala till hela Norden och hjälpa tusentals restauranger att maximera sin potential.',
    fundingGoal: 750000,
    currentAmount: 425000,
    daysLeft: 23,
    backers: 89,
    category: 'Tech Startup',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=400&fit=crop'
    ],
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
    description: 'Revolutionera ditt företags energiförbrukning med våra skräddarsydda solcellslösningar! Vi erbjuder kompletta solcellspaket specifikt designade för svenska småföretag - från design och installation till långsiktig service och garantier. Våra kunder sparar i genomsnitt 40-60% på sina elräkningar redan första året, samtidigt som de bidrar till en hållbar framtid. Med över 200 lyckade installationer och 98% kundnöjdhet är vi redo att expandera till fler regioner. Bli en del av den gröna revolutionen och hjälp oss göra förnybar energi tillgänglig för alla svenska företag!',
    fundingGoal: 1200000,
    currentAmount: 890000,
    daysLeft: 31,
    backers: 156,
    category: 'Green Tech',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1624397640148-949b1732bb0a?w=600&h=400&fit=crop'
    ],
    creator: {
      name: 'Anna Karlsson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c917?w=100&h=100&fit=crop&crop=face'
    },
    location: 'Göteborg'
  },
  {
    id: 'healthtech-app-3',
    title: 'HealthTech Wellness - Mental Hälsa App',
    description: 'Mental hälsa har aldrig varit viktigare - nu gör vi professionell hjälp tillgänglig för alla! Vår innovativa app kopplar användare direkt med certifierade psykologer och terapeuter genom säkra videosamtal, chatt och självhjälpsverktyg. Med AI-driven matchmaking hittar vi rätt terapeut baserat på dina behov, språk och tillgänglighet. Över 15,000 användare har redan fått hjälp genom vår betaversion, med 94% som rapporterar förbättrad mental hälsa inom 30 dagar. Din investering hjälper oss att göra mental hälsovård tillgänglig, prisvärd och avidentifierad för alla i Norden.',
    fundingGoal: 500000,
    currentAmount: 523000,
    daysLeft: 12,
    backers: 267,
    category: 'HealthTech',
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=600&h=400&fit=crop'
    ],
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
    description: 'Drömmen om det perfekta kaffet blir verklighet! Vi öppnar Stockholms första riktiga nordiska rostboutique där varje kopp berättar en historia om hållbarhet och kvalitet. I partnerskap med lokala odlare från Island, Norge och norra Sverige skapar vi unika blandningar som fångar den nordiska naturens essens. Vår 120 kvm flaggskeppsbutik i Gamla Stan kommer att kombinera traditionell rostning med modern teknik, erbjuda kaffeupplevelser och utbildningar. Med 8 års erfarenhet av specialkaffe och en växande kundkrets på 3,000+ kaffeeentusiaster är vi redo för nästa steg. Hjälp oss skapa en plats där kaffekulturen blomstrar!',
    fundingGoal: 1200000,
    currentAmount: 890000,
    daysLeft: 12,
    backers: 156,
    category: 'Kaféer & Restauranger',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop'
    ],
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
    description: 'Smaken av äkta nordisk mat på hjul! I tre år har vår food truck "Nordisk Kök" serverat autentisk skandinavisk streetfood gjord på lokala, säsongsbetonade råvaror. Från renskav-tacos till gravlax-wraps och köttbullar med lingonsylt - vi har skapat en ny generation nordisk comfort food. Med över 50,000 nöjda kunder och konstant slutsålda evenemang är efterfrågan enorm. Nu vill vi expandera med två nya, specialdesignade food trucks som kan täcka hela Västsverige och ge fler människor chansen att uppleva vår unika kulinariska resa. Bli en del av vår vision att göra nordisk mat tillgänglig överallt!',
    fundingGoal: 800000,
    currentAmount: 445000,
    daysLeft: 28,
    backers: 89,
    category: 'Restauranger',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop'
    ],
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
    description: 'Välkommen till framtidens gym! Nordic Fitness blir Nordens första helt klimatneutrala träningsanläggning där hållbarhet möter toppmodern fitness. Vår 800 kvm anläggning drivs av solceller, använder återvunnen träningsutrustning av högsta kvalitet och erbjuder ekologiska amenities. Vi kombinerar traditionell styrketräning med yoga, mindfulness och nutritionsrådgivning i en inspirerande miljö. Vårt koncept har redan testats med 500+ medlemmar som rapporterar 85% högre motivation än på traditionella gym. Nu tar vi steget mot en fullskalig anläggning som visar att man kan träna både kropp och samvete samtidigt!',
    fundingGoal: 2000000,
    currentAmount: 1250000,
    daysLeft: 45,
    backers: 234,
    category: 'Gym & Wellness',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&h=400&fit=crop'
    ],
    creator: {
      name: 'Lisa Nordström',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face'
    },
    location: 'Uppsala'
  },
  {
    id: 'eco-store-7',
    title: 'Zero Waste Store - Helt förpackningsfri butik',
    description: 'Säg adjö till onödig förpackning! Vi öppnar Stockholms första helt förpackningsfria butik där kunderna får köpa precis så mycket de behöver och tar med sina egna behållare. Från ekologiska basvaror och kryddor till naturliga skönhetsprodukter och hushållsartiklar - allt säljs i bulk för att minimera avfall och maximera kvalitet. Vårt koncept har testats i pop-up format med otrolig respons - 92% av testkunderna ändrade sina shoppingvanor och minskade sitt hushållsavfall med i genomsnitt 60%. Nu behöver vi finansiering för att etablera en permanent 150 kvm butik som kan inspirera en hel stad att leva mer hållbart.',
    fundingGoal: 650000,
    currentAmount: 378000,
    daysLeft: 19,
    backers: 145,
    category: 'Retail',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop'
    ],
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
    description: 'Från Stockholms framgångssaga till nordisk dominans! GreenClean har revolutionerat städbranschen i Sverige med våra 100% ekologiska rengöringsprodukter och CO2-neutrala tjänster. På bara 4 år har vi vuxit från en ensam entreprenör till 180 anställda och omsätter 45 miljoner kronor årligen med 23% vinstmarginal. Våra företagskunder rapporterar 40% bättre inomhusluft och 60% minskning av allergirelaterda sjukfrånvaro. Nu är det dags för nästa steg - expansion till Oslo och Köpenhamn där efterfrågan på miljövänliga städtjänster exploderar. Bli en del av den gröna vågen som sveper över Norden!',
    fundingGoal: 2000000,
    currentAmount: 1250000,
    daysLeft: 31,
    backers: 234,
    category: 'Expansion',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop'
    ],
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
    description: 'Mode med mening! Vi lanserar Nordens första helt transparenta klädmärke där varje plagg berättar sin historia från fiber till färdig design. Tillverkat i Sverige av återvunna och ekologiska material med fair trade-certifiering och full lönetransparens. Våra första kollektioner har redan sålt slut på förbeställning med 2,500 kunder som väntar på nästa drop. Vi använder revolutionerande färgningsmetoder som sparar 90% vatten och innovativa material som hampasilke och återvunnen ull. Hjälp oss bevisa att svensk mode kan vara både vackert, hållbart och etiskt - och sätta nya standarder för hela branschen!',
    fundingGoal: 900000,
    currentAmount: 567000,
    daysLeft: 22,
    backers: 178,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=400&fit=crop'
    ],
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
    description: 'Revolutionen mot plastföroreningar börjar här! Vårt forskarteam vid Umeå universitet har utvecklat en banbrytande bioplast gjord 100% av svenska skogsrester som bryts ned naturligt inom 6 månader. Efter 8 års forskning och 3 beviljad patent står vi redo att kommersialisera teknologin som kan ersätta traditionell plast i förpackningar, engageorter och konsumentprodukter. Våra tester visar att materialet är 30% starkare än konventionell plast men kostar bara 15% mer att producera. Stora företag som IKEA och Tetra Pak har redan visat intresse. Med din hjälp bygger vi en pilotfabrik som kan producera 50 ton per månad och visa vägen mot en plastfri framtid!',
    fundingGoal: 3000000,
    currentAmount: 1890000,
    daysLeft: 67,
    backers: 312,
    category: 'Innovation',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop'
    ],
    creator: {
      name: 'Dr. Anders Holm',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    location: 'Umeå'
  },
  {
    id: 'edtech-platform-11',
    title: 'EdTech Learning - AI-Driven Utbildningsplattform',
    description: 'Utbildning som anpassar sig efter DIG! Vår revolutionerande AI-plattform skapar personliga lärpläner för svenska småföretagare baserat på bransch, erfarenhet och mål. Med maskininlärning analyserar systemet hur du lär bäst och anpassar innehåll, tempo och format i realtid. Våra 2,500 beta-användare har genomsnittligt ökat sina kunskaper med 340% jämfört med traditionella kurser, och 78% har implementerat nya strategier som ökat deras företags omsättning. Från digital marknadsföring till ekonomisk planering - vi täcker alla områden som småföretagare behöver för att lyckas i dagens digitala värld!',
    fundingGoal: 1500000,
    currentAmount: 789000,
    daysLeft: 38,
    backers: 145,
    category: 'EdTech',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop'
    ],
    creator: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=100&h=100&fit=crop&crop=face'
    },
    location: 'Stockholm'
  },
  {
    id: 'agritech-farming-12',
    title: 'AgriTech Nordic - Smart Odling för Framtiden',
    description: 'Framtidens jordbruk är redan här! Vårt intelligenta odlingssystem kombinerar IoT-sensorer, AI-analys och precision agriculture för att revolutionera hur vi odlar mat. Med realtidsdata om jordmån, väder och växternas hhälsa hjälper vi bönder att öka skördarna med 40% samtidigt som de minskar vattenanvändningen med 55% och bekepningsmedel med 60%. Våra 25 pilotgårdar i Skåne har redan ökat sin lnsamhet med genomsnittligt 180,000 kr per år. Nu skalar vi upp teknologin för att hjälpa tusentals nordiska bönder att producera mer mat på ett hållbart sätt. Välkommen till jordbrukets digitala revolution!',
    fundingGoal: 2200000,
    currentAmount: 1344000,
    daysLeft: 44,
    backers: 189,
    category: 'AgriTech',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop'
    ],
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