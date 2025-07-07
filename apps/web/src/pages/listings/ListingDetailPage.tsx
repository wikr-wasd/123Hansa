import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Globe,
  FileText,
  Briefcase,
  Calendar,
  Eye,
  Users,
  Star,
  Shield,
  CheckCircle,
  Heart,
  Share2,
  MessageCircle,
  TrendingUp,
  DollarSign,
  Clock,
  Award,
  Phone,
  Mail,
  ExternalLink,
  Send,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PremiumEmblem, PremiumEmblemType } from '../../components/listings/PremiumEmblem';
import ContactSellerModal from '../../components/listings/ContactSellerModal';
import { useAuthStore } from '../../stores/authStore';

// Types
interface Listing {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  askingPrice: number;
  currency: string;
  location: string;
  description: string;
  highlights: string[];
  images: string[];
  seller: {
    name: string;
    verified: boolean;
    joinedDate: string;
  };
  status: 'ACTIVE' | 'PENDING' | 'SOLD';
  createdAt: string;
  viewCount: number;
  interestedBuyers: number;
  [key: string]: any;
}

// Enhanced Category mappings
const CATEGORY_INFO = {
  companies: { name: 'Företag & Bolag', icon: Building2, color: 'blue' },
  ecommerce: { name: 'E-handel & Webshops', icon: Globe, color: 'green' },
  domains: { name: 'Domäner & Webbplatser', icon: Globe, color: 'purple' },
  content: { name: 'Content & Media', icon: FileText, color: 'orange' },
  social: { name: 'Social Media', icon: Users, color: 'pink' },
  affiliate: { name: 'Affiliate & Passive Income', icon: TrendingUp, color: 'indigo' },
  digital: { name: 'Digitala Tillgångar', icon: Building2, color: 'cyan' },
  documents: { name: 'Dokument & Rättigheter', icon: FileText, color: 'gray' },
  properties: { name: 'Fastigheter & Lokaler', icon: MapPin, color: 'yellow' },
  services: { name: 'Företagstjänster', icon: Briefcase, color: 'red' }
};

const STATUS_INFO = {
  ACTIVE: { name: 'Aktiv', color: 'green' },
  PENDING: { name: 'Under förhandling', color: 'yellow' },
  SOLD: { name: 'Såld', color: 'gray' }
};

// Mock data for development - alla 30 listings
const getMockListing = (id: string) => {
  const mockListings = [
    {
      id: '1',
      title: '🚀 TechStartup AB - Revolutionerande AI & Maskininlärning',
      category: 'companies',
      subcategory: 'tech',
      askingPrice: 2500000,
      currency: 'SEK',
      location: 'Stockholm',
      description: '✨ Banbrytande teknikföretag som transformerar branschen med cutting-edge AI-lösningar! Etablerat 2020 och redan lönsamt med 450k SEK månadsintäkter. Stabila B2B-kontrakt med Fortune 500-företag och en prestigefylld kundportfölj. Detta är din chans att förvärva nästa unicorn! 🦄',
      highlights: ['🤖 Banbrytande AI-teknik', '📈 300% tillväxt senaste året', '💎 Erfaret världsklass-team', '👥 15 expertanställda', '💰 Lönsamt från dag 1'],
      images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop'],
      seller: { name: 'Anna Karlsson', verified: true, joinedDate: '2024-06-20' },
      status: 'ACTIVE',
      createdAt: '2024-06-20',
      viewCount: 156,
      interestedBuyers: 8,
      owner: { firstName: 'Anna', lastName: 'Karlsson' },
      monthlyRevenue: 450000,
      monthlyProfit: 180000,
      employees: 15,
      isNegotiable: true,
      businessType: 'AB'
    },
    {
      id: '2',
      title: '👗 Nordic Fashion Empire - Lyxig E-handel med Eget Varumärke',
      category: 'ecommerce',
      subcategory: 'fashion',
      askingPrice: 850000,
      currency: 'SEK',
      location: 'Göteborg',
      description: '🌟 Exklusiv modeboutique online som dominerar den nordiska marknaden! Med ett starkt varumärke och lojala kunder som återkommer gång på gång. Perfekt positionerat för internationell expansion. Drömköp för någon som vill träda in i den lukrativa modebranschen! 💎',
      highlights: ['👑 Exklusivt eget varumärke', '💝 Superlojala återkommande kunder', '🏆 Etablerat premium-brand', '📊 Konstant växande försäljning', '🌍 Redo för global expansion'],
      images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop'],
      seller: { name: 'Erik Johansson', verified: true, joinedDate: '2024-05-15' },
      status: 'ACTIVE',
      createdAt: '2024-05-15',
      viewCount: 234,
      interestedBuyers: 12,
      owner: { firstName: 'Erik', lastName: 'Johansson' },
      isNegotiable: true
    },
    {
      id: '3',
      title: '⚡ ProjectFlow SaaS - Marknadsledande Projekthantering',
      category: 'digital',
      subcategory: 'saas',
      askingPrice: 4200000,
      currency: 'SEK',
      location: 'Malmö',
      description: '🏅 Branschens #1 SaaS-plattform som revolutionerat projekthantering för 500+ betalande företag! Automatiserade återkommande intäkter på 350k SEK/månad. Skalbar cloud-arkitektur redo att hantera 10x tillväxt. Detta är en guldgruva för den rätta köparen! 💰',
      highlights: ['🎯 500+ betalande premiumkunder', '💎 Garanterade återkommande intäkter', '🚀 Infinit skalbar teknikstack', '📈 85% kundretention', '⭐ 4.9/5 i kundnöjdhet'],
      images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'],
      seller: { name: 'Sara Lindberg', verified: true, joinedDate: '2024-04-10' },
      status: 'ACTIVE',
      createdAt: '2024-04-10',
      viewCount: 412,
      interestedBuyers: 23,
      owner: { firstName: 'Sara', lastName: 'Lindberg' },
      isNegotiable: false
    },
    {
      id: '4',
      title: '☕ Café Crown - Stockholms Mest Instagrammade Hotspot',
      category: 'companies',
      subcategory: 'restaurant',
      askingPrice: 1200000,
      currency: 'SEK',
      location: 'Stockholm',
      description: '🌟 Legendarisk café som blivit Stockholms hjärta! Kändisbesökt och älskad av tusentals stamgäster. Prime location med enorma marginaler och kö utanför dörren varje dag. Perfekt investering för food & beverage-entusiasten! 👑',
      highlights: ['🏙️ Premium central Stockholm-läge', '❤️ Kultföljarskap bland stockholmare', '💰 Exceptionella vinstmarginaler', '📸 Social media-magnet', '⭐ 500+ 5-stjärniga recensioner'],
      images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'],
      seller: { name: 'Maria Andersson', verified: true, joinedDate: '2024-05-28' },
      status: 'ACTIVE',
      createdAt: '2024-05-28',
      viewCount: 189,
      interestedBuyers: 15,
      owner: { firstName: 'Maria', lastName: 'Andersson' },
      isNegotiable: true
    },
    {
      id: '5',
      title: '💻 WebMasters Pro - Digital Powerhouse med 25+ Premiumkunder',
      category: 'services',
      subcategory: 'webdesign',
      askingPrice: 950000,
      currency: 'SEK',
      location: 'Uppsala',
      description: '🔥 Uppsalas mest respekterade webbyrå som skapat digitala mästerverk för 25+ exklusiva kunder! Specialister på high-end WordPress & e-handel med garanterade månadsavtal. Award-winning portfölj och väntelista av potentiella kunder. Ren passiv inkomstmaskin! 💎',
      highlights: ['👑 25+ premium långtidskunder', '💰 Förutsägbara månadsintäkter', '🏆 Award-winning designportfölj', '📈 Väntelista av nya kunder', '⚡ Turnkey-affärsmodell'],
      images: ['https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=300&fit=crop'],
      seller: { name: 'Johan Nilsson', verified: true, joinedDate: '2024-04-22' },
      status: 'ACTIVE',
      createdAt: '2024-04-22',
      viewCount: 298,
      interestedBuyers: 18,
      owner: { firstName: 'Johan', lastName: 'Nilsson' },
      isNegotiable: true
    },
    {
      id: '6',
      title: '💪 FitLife Pro - Viral Fitness-App med 10k+ Aktiva Superfans',
      category: 'digital',
      subcategory: 'mobile-app',
      askingPrice: 1800000,
      currency: 'SEK',
      location: 'Västerås',
      description: '🔥 Sveriges mest engagerande fitness-app som förändrat 10,000+ liv! Premium freemium-modell med 35% konverteringsgrad till betalande prenumeranter. Står för launch i Norge & Danmark. App Store featured och 4.8/5 rating. Nästa stora health-tech exit! 🌟',
      highlights: ['🏅 10k+ dagligt aktiva användare', '💵 35% freemium-till-premium konvertering', '🚀 4.8/5 App Store betyg', '🌍 International expansion klar', '📈 150% user retention'],
      images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'],
      seller: { name: 'Lisa Borg', verified: true, joinedDate: '2024-05-01' },
      status: 'ACTIVE',
      createdAt: '2024-05-01',
      viewCount: 367,
      interestedBuyers: 29,
      owner: { firstName: 'Lisa', lastName: 'Borg' },
      isNegotiable: true
    },
    {
      id: '7',
      title: '📸 @NordicLifestyle - Viral Instagram Empire (45k Följare)',
      category: 'social',
      subcategory: 'instagram',
      askingPrice: 320000,
      currency: 'SEK',
      location: 'Online',
      description: '✨ Verified lifestyle-imperium som dominerar nordisk Instagram! 45k superfans med 8.5% engagement (bransch-ledande!). Lukrativa brand partnerships med stora Nordic brands. Ready-made influencer-business som genererar 25k SEK/månad passivt! 👑',
      highlights: ['✔️ Verifierat blue-checkmark konto', '🔥 8.5% engagement rate (branschbäst)', '💰 25k SEK/månad i sponsorintakter', '🌟 Premium Nordic lifestyle-nisch', '📈 Konstant organisk tillväxt'],
      images: ['https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=300&fit=crop'],
      seller: { name: 'Emma Svensson', verified: true, joinedDate: '2024-06-05' },
      status: 'ACTIVE',
      createdAt: '2024-06-05',
      viewCount: 445,
      interestedBuyers: 34,
      owner: { firstName: 'Emma', lastName: 'Svensson' },
      isNegotiable: true
    },
    {
      id: '8',
      title: '🎓 CodeMaster Academy - Skandinaviens #1 Kodplattform',
      category: 'digital',
      subcategory: 'education',
      askingPrice: 3500000,
      currency: 'SEK',
      location: 'Linköping',
      description: '🚀 Skandinaviens ledande e-learning imperium för kodning! 1000+ betalande premium-studenter genererar 280k SEK/månad i återkommande intäkter. Komplett LMS med AI-driven personalisering. Redo att skala internationellt - nästa Coursera! 🌟',
      highlights: ['🏆 1000+ betalande premiumstudenter', '💰 280k SEK/månad garanterad revenue', '🤖 AI-driven lärplattform', '🌍 International scalability klar', '📈 94% student completion rate'],
      images: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop'],
      seller: { name: 'David Olsson', verified: true, joinedDate: '2024-03-15' },
      status: 'ACTIVE',
      createdAt: '2024-03-15',
      viewCount: 578,
      interestedBuyers: 41,
      owner: { firstName: 'David', lastName: 'Olsson' },
      isNegotiable: false
    },
    {
      id: '9',
      title: '🔥 NordicTech.se - Ultimate Premium Tech-Domän',
      category: 'domains',
      subcategory: 'premium',
      askingPrice: 125000,
      currency: 'SEK',
      location: 'Online',
      description: '💎 Den mest värdefulla tech-domänen i Norden! NordicTech.se - perfekt för startup-unicorns och etablerade tech-giganter. Superkort, brandable och med inbyggd SEO-juice. Endast 2 ord, max impact! 🎆',
      highlights: ['🏅 Premium .se TLD (högst förtroende)', '🔍 Instant SEO-boost för tech', '💪 Superkort & minnesvärd', '🌍 Nordic tech market leader', '🚀 Unicorn-potential brand'],
      images: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop'],
      seller: { name: 'Peter Gustafsson', verified: true, joinedDate: '2024-06-12' },
      status: 'ACTIVE',
      createdAt: '2024-06-12',
      viewCount: 167,
      interestedBuyers: 12,
      owner: { firstName: 'Peter', lastName: 'Gustafsson' },
      isNegotiable: true
    },
    {
      id: '10',
      title: '🎮 GameLegend - Viral YouTube Gaming Empire (120k Fans)',
      category: 'content',
      subcategory: 'youtube',
      askingPrice: 890000,
      currency: 'SEK',
      location: 'Online',
      description: '🔥 Skandinaviens hetaste gaming-kanal med 120k fanatiska fans! Monetiserad maskin som genererar 65k SEK/månad via sponsorships + AdSense. Verified YouTube Partner med exclusive brand deals. Ready för Twitch + TikTok expansion! 🏆',
      highlights: ['✔️ YouTube Partner Program verified', '💰 65k SEK/månad passive income', '🔥 120k loyala gaming-fans', '🌟 Exclusive brand partnerships', '🚀 Multi-platform expansion ready'],
      images: ['https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=300&fit=crop'],
      seller: { name: 'Alexander Berg', verified: true, joinedDate: '2024-04-30' },
      status: 'ACTIVE',
      createdAt: '2024-04-30',
      viewCount: 634,
      interestedBuyers: 47,
      owner: { firstName: 'Alexander', lastName: 'Berg' },
      isNegotiable: true
    },
    {
      id: '11',
      title: 'Redovisningsbyrå med 80 kunder',
      category: 'services',
      subcategory: 'accounting',
      askingPrice: 2100000,
      currency: 'SEK',
      location: 'Örebro',
      description: 'Välkänd redovisningsbyrå med 80 fasta kunder. Lång erfarenhet och stark lokal reputation.',
      highlights: ['80 fasta kunder', 'Lokal reputation', 'Stabil affär'],
      images: ['https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop'],
      seller: { name: 'Margareta Lind', verified: true, joinedDate: '2024-03-22' },
      status: 'ACTIVE',
      createdAt: '2024-03-22',
      viewCount: 245,
      interestedBuyers: 19,
      owner: { firstName: 'Margareta', lastName: 'Lind' },
      isNegotiable: true
    },
    {
      id: '12',
      title: 'Affiliate-sajt inom Husdjur (50k SEK/mån)',
      category: 'affiliate',
      subcategory: 'pets',
      askingPrice: 750000,
      currency: 'SEK',
      location: 'Online',
      description: 'Lönsam affiliate-sajt inom husdjursnischen. Genererar 50,000 SEK per månad i passiv inkomst.',
      highlights: ['50k SEK/mån', 'Passiv inkomst', 'Etablerad trafik'],
      images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop'],
      seller: { name: 'Caroline Hedström', verified: true, joinedDate: '2024-05-18' },
      status: 'ACTIVE',
      createdAt: '2024-05-18',
      viewCount: 523,
      interestedBuyers: 38,
      owner: { firstName: 'Caroline', lastName: 'Hedström' },
      isNegotiable: true
    },
    // Lägg till fler listings här för att få alla 30...
    {
      id: '13',
      title: 'Hårfrisör-salong Centrala Göteborg',
      category: 'companies',
      subcategory: 'beauty',
      askingPrice: 680000,
      currency: 'SEK',
      location: 'Göteborg',
      description: 'Modern hårfrisör-salong i centrala Göteborg. Lojal kundkrets och fullt bokad 3 månader framåt.',
      highlights: ['Central lokalisering', 'Lojala kunder', 'Fullt bokad'],
      images: ['https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop'],
      seller: { name: 'Jessica Palmqvist', verified: true, joinedDate: '2024-04-08' },
      status: 'ACTIVE',
      createdAt: '2024-04-08',
      viewCount: 312,
      interestedBuyers: 22,
      owner: { firstName: 'Jessica', lastName: 'Palmqvist' },
      isNegotiable: true
    },
    {
      id: '14',
      title: 'CRM-system för Småföretag (SaaS)',
      category: 'digital',
      subcategory: 'saas',
      askingPrice: 2800000,
      currency: 'SEK',
      location: 'Helsingborg',
      description: 'Enkelt CRM-system speciellt utvecklat för småföretag. 300+ betalande kunder och växande.',
      highlights: ['300+ kunder', 'SMB-fokus', 'Återkommande intäkter'],
      images: ['https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop'],
      seller: { name: 'Thomas Rydberg', verified: true, joinedDate: '2024-02-14' },
      status: 'ACTIVE',
      createdAt: '2024-02-14',
      viewCount: 467,
      interestedBuyers: 31,
      owner: { firstName: 'Thomas', lastName: 'Rydberg' },
      isNegotiable: true
    },
    {
      id: '15',
      title: 'E-handel Hemtextil & Inredning',
      category: 'ecommerce',
      subcategory: 'home',
      askingPrice: 1450000,
      currency: 'SEK',
      location: 'Växjö',
      description: 'Välsorterad e-handel inom hemtextil och inredning. Stark tillväxt under senaste året.',
      highlights: ['Bred produktsortiment', 'Stark tillväxt', 'Etablerade leverantörer'],
      images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'],
      seller: { name: 'Helena Åkerlund', verified: true, joinedDate: '2024-03-09' },
      status: 'ACTIVE',
      createdAt: '2024-03-09',
      viewCount: 389,
      interestedBuyers: 26,
      owner: { firstName: 'Helena', lastName: 'Åkerlund' },
      isNegotiable: true
    },
    {
      id: '16',
      title: 'Podcast Network (5 podcasts, 500k lyssnare)',
      category: 'content',
      subcategory: 'podcast',
      askingPrice: 1200000,
      currency: 'SEK',
      location: 'Online',
      description: 'Podcastnätverk med 5 etablerade podcasts och sammanlagt över 500,000 månatliga lyssnare.',
      highlights: ['5 podcasts', '500k lyssnare/mån', 'Monetiserat'],
      images: ['https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=300&fit=crop'],
      seller: { name: 'Marcus Engström', verified: true, joinedDate: '2024-01-25' },
      status: 'ACTIVE',
      createdAt: '2024-01-25',
      viewCount: 721,
      interestedBuyers: 52,
      owner: { firstName: 'Marcus', lastName: 'Engström' }
    },
    {
      id: '17',
      title: 'Bilverkstad & Däckhotell Malmö',
      category: 'companies',
      subcategory: 'automotive',
      askingPrice: 1850000,
      currency: 'SEK',
      location: 'Malmö',
      description: 'Välrenommerad bilverkstad med däckhotell. Fasta kunder och serviceavtal med företag.',
      highlights: ['Däckhotell', 'Företagskunder', 'Välrenommerad'],
      images: ['https://images.unsplash.com/photo-1632823471565-1ecdf09bb0b7?w=400&h=300&fit=crop'],
      seller: { name: 'Ronny Persson', verified: true, joinedDate: '2024-02-28' },
      status: 'ACTIVE',
      createdAt: '2024-02-28',
      viewCount: 278,
      interestedBuyers: 17,
      owner: { firstName: 'Ronny', lastName: 'Persson' }
    },
    {
      id: '18',
      title: 'TikTok-konto @swedishfood (200k följare)',
      category: 'social',
      subcategory: 'tiktok',
      askingPrice: 450000,
      currency: 'SEK',
      location: 'Online',
      description: 'Populärt TikTok-konto om svensk matkultur. Viral potential och stark engagement från unga användare.',
      highlights: ['200k följare', 'Mat-nisch', 'Hög engagement'],
      images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'],
      seller: { name: 'Sofia Lundgren', verified: true, joinedDate: '2024-05-12' },
      status: 'ACTIVE',
      createdAt: '2024-05-12',
      viewCount: 612,
      interestedBuyers: 43,
      owner: { firstName: 'Sofia', lastName: 'Lundgren' }
    },
    {
      id: '19',
      title: 'Yoga-studio Central Stockholm',
      category: 'companies',
      subcategory: 'fitness',
      askingPrice: 920000,
      currency: 'SEK',
      location: 'Stockholm',
      description: 'Prisad yoga-studio i centrala Stockholm. Månadsmedlemskap och populära klasser.',
      highlights: ['Central läge', 'Månadsmedlemmar', 'Prisad studio'],
      images: ['https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=300&fit=crop'],
      seller: { name: 'Annika Rosén', verified: true, joinedDate: '2024-04-16' },
      status: 'ACTIVE',
      createdAt: '2024-04-16',
      viewCount: 354,
      interestedBuyers: 25,
      owner: { firstName: 'Annika', lastName: 'Rosén' }
    },
    {
      id: '20',
      title: 'E-bokförlag med 50+ titlar',
      category: 'content',
      subcategory: 'publishing',
      askingPrice: 1680000,
      currency: 'SEK',
      location: 'Sundsvall',
      description: 'Digitalt bokförlag med över 50 publicerade titlar. Återkommande royalty-intäkter.',
      highlights: ['50+ titlar', 'Royalty-intäkter', 'Digital distribution'],
      images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'],
      seller: { name: 'Gunnar Holmberg', verified: true, joinedDate: '2024-01-08' },
      status: 'ACTIVE',
      createdAt: '2024-01-08',
      viewCount: 432,
      interestedBuyers: 28,
      owner: { firstName: 'Gunnar', lastName: 'Holmberg' }
    },
    {
      id: '21',
      title: 'Fastighetsförvaltning Västerås (45 objekt)',
      category: 'properties',
      subcategory: 'management',
      askingPrice: 3200000,
      currency: 'SEK',
      location: 'Västerås',
      description: 'Etablerat fastighetsförvaltningsbolag med 45 förvaltningsobjekt. Återkommande månadsavtal.',
      highlights: ['45 objekt', 'Månadsavtal', 'Etablerat företag'],
      images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'],
      seller: { name: 'Lars-Erik Nyström', verified: true, joinedDate: '2024-02-05' },
      status: 'ACTIVE',
      createdAt: '2024-02-05',
      viewCount: 298,
      interestedBuyers: 21,
      owner: { firstName: 'Lars-Erik', lastName: 'Nyström' }
    },
    {
      id: '22',
      title: 'Mobilapp-utvecklingsbyrå',
      category: 'services',
      subcategory: 'mobile-development',
      askingPrice: 1750000,
      currency: 'SEK',
      location: 'Karlstad',
      description: 'Specialiserad mobilapp-utvecklingsbyrå med fokus på iOS och Android. 8 anställda utvecklare.',
      highlights: ['iOS & Android', '8 utvecklare', 'Etablerade kunder'],
      images: ['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop'],
      seller: { name: 'Daniel Wikström', verified: true, joinedDate: '2024-03-30' },
      status: 'ACTIVE',
      createdAt: '2024-03-30',
      viewCount: 456,
      interestedBuyers: 32,
      owner: { firstName: 'Daniel', lastName: 'Wikström' }
    },
    {
      id: '23',
      title: 'Nischad E-handel Sportfiske',
      category: 'ecommerce',
      subcategory: 'sports',
      askingPrice: 780000,
      currency: 'SEK',
      location: 'Kiruna',
      description: 'Specialiserad e-handel inom sportfiske-utrustning. Stark position i nischad marknad.',
      highlights: ['Nischad marknad', 'Lojala kunder', 'Höga marginaler'],
      images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop'],
      seller: { name: 'Björn Sandström', verified: true, joinedDate: '2024-05-22' },
      status: 'ACTIVE',
      createdAt: '2024-05-22',
      viewCount: 267,
      interestedBuyers: 16,
      owner: { firstName: 'Björn', lastName: 'Sandström' }
    },
    {
      id: '24',
      title: 'LinkedIn-konto B2B Coach (25k följare)',
      category: 'social',
      subcategory: 'linkedin',
      askingPrice: 380000,
      currency: 'SEK',
      location: 'Online',
      description: 'Välkänt LinkedIn-konto inom B2B-coaching. Hög engagement från företagsledare och säljare.',
      highlights: ['25k följare', 'B2B-fokus', 'Företagskunder'],
      images: ['https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=400&h=300&fit=crop'],
      seller: { name: 'Robert Hägg', verified: true, joinedDate: '2024-04-25' },
      status: 'ACTIVE',
      createdAt: '2024-04-25',
      viewCount: 389,
      interestedBuyers: 27,
      owner: { firstName: 'Robert', lastName: 'Hägg' }
    },
    {
      id: '25',
      title: 'Städfirma Göteborg (12 anställda)',
      category: 'services',
      subcategory: 'cleaning',
      askingPrice: 1350000,
      currency: 'SEK',
      location: 'Göteborg',
      description: 'Välkänd städfirma med 12 anställda och kontrakt med lokala företag och bostadsrättsföreningar.',
      highlights: ['12 anställda', 'Fasta kontrakt', 'Lokal marknad'],
      images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop'],
      seller: { name: 'Amira Hassan', verified: true, joinedDate: '2024-01-18' },
      status: 'ACTIVE',
      createdAt: '2024-01-18',
      viewCount: 234,
      interestedBuyers: 18,
      owner: { firstName: 'Amira', lastName: 'Hassan' }
    },
    {
      id: '26',
      title: 'Premium Domän: FinTechSweden.com',
      category: 'domains',
      subcategory: 'premium',
      askingPrice: 85000,
      currency: 'SEK',
      location: 'Online',
      description: 'Stark domän för fintech-företag med Sverige-fokus. Perfekt för startup inom finanssektorn.',
      highlights: ['.com TLD', 'FinTech-nisch', 'Sverige-fokus'],
      images: ['https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop'],
      seller: { name: 'Fredrik Morén', verified: true, joinedDate: '2024-06-18' },
      status: 'ACTIVE',
      createdAt: '2024-06-18',
      viewCount: 145,
      interestedBuyers: 9,
      owner: { firstName: 'Fredrik', lastName: 'Morén' }
    },
    {
      id: '27',
      title: 'Hudvårdsklinik & Spa Malmö',
      category: 'companies',
      subcategory: 'beauty',
      askingPrice: 2400000,
      currency: 'SEK',
      location: 'Malmö',
      description: 'Exklusiv hudvårdsklinik och spa. Certifierade behandlare och högkvalitativ utrustning.',
      highlights: ['Certifierade behandlare', 'Exklusiv klientel', 'Modern utrustning'],
      images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=300&fit=crop'],
      seller: { name: 'Camilla Ek', verified: true, joinedDate: '2024-02-12' },
      status: 'ACTIVE',
      createdAt: '2024-02-12',
      viewCount: 378,
      interestedBuyers: 24,
      owner: { firstName: 'Camilla', lastName: 'Ek' }
    },
    {
      id: '28',
      title: 'Nyhetsblogg Lokala Nyheter (100k läsare/mån)',
      category: 'content',
      subcategory: 'blog',
      askingPrice: 650000,
      currency: 'SEK',
      location: 'Umeå',
      description: 'Välkänd nyhetsblogg för lokala nyheter i Umeå-regionen. Stark läsarkrets och annonsintäkter.',
      highlights: ['100k läsare/mån', 'Lokala nyheter', 'Annonsintäkter'],
      images: ['https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=300&fit=crop'],
      seller: { name: 'Ingrid Blomqvist', verified: true, joinedDate: '2024-03-06' },
      status: 'ACTIVE',
      createdAt: '2024-03-06',
      viewCount: 487,
      interestedBuyers: 35,
      owner: { firstName: 'Ingrid', lastName: 'Blomqvist' }
    },
    {
      id: '29',
      title: 'E-handel Babyprodukter & Leksaker',
      category: 'ecommerce',
      subcategory: 'kids',
      askingPrice: 1150000,
      currency: 'SEK',
      location: 'Jönköping',
      description: 'Omfattande e-handel inom babyprodukter och leksaker. Välkända varumärken och snabb leverans.',
      highlights: ['Välkända varumärken', 'Snabb leverans', 'Återkommande kunder'],
      images: ['https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=300&fit=crop'],
      seller: { name: 'Eva Isaksson', verified: true, joinedDate: '2024-04-02' },
      status: 'ACTIVE',
      createdAt: '2024-04-02',
      viewCount: 423,
      interestedBuyers: 31,
      owner: { firstName: 'Eva', lastName: 'Isaksson' }
    },
    {
      id: '30',
      title: 'IT-support & Molntjänster',
      category: 'services',
      subcategory: 'it-support',
      askingPrice: 1950000,
      currency: 'SEK',
      location: 'Kalmar',
      description: 'IT-supportföretag specialiserat på molntjänster för småföretag. Månatliga supportavtal.',
      highlights: ['Molnspecialist', 'Månatliga avtal', 'SMB-fokus'],
      images: ['https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'],
      seller: { name: 'Mikael Strand', verified: true, joinedDate: '2024-01-12' },
      status: 'ACTIVE',
      createdAt: '2024-01-12',
      viewCount: 345,
      interestedBuyers: 23,
      owner: { firstName: 'Mikael', lastName: 'Strand' }
    }
  ];

  const listing = mockListings.find(l => l.id === id);
  if (!listing) return null;

  // Create recommended listings (excluding current one)
  const recommended = mockListings.filter(l => l.id !== id).slice(0, 3);

  return {
    listing: {
      ...listing,
      subcategory: listing.subcategory || '',
      highlights: listing.highlights || [],
      images: listing.images || [],
      seller: {
        name: listing.owner?.firstName ? `${listing.owner.firstName} ${listing.owner.lastName}` : 'Anonym säljare',
        verified: true,
        joinedDate: listing.createdAt
      },
      viewCount: listing.viewCount || 0,
      interestedBuyers: listing.interestedBuyers || 0
    },
    recommended
  };
};

const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: authUser } = useAuthStore();
  const [listing, setListing] = useState<Listing | null>(null);
  const [recommendedListings, setRecommendedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidComment, setBidComment] = useState('');
  const [contactInfo, setContactInfo] = useState({ name: '', email: '', phone: '' });
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 20);

  // Check if listing is favorited on component load
  useEffect(() => {
    if (listing && authUser) {
      const existingFavorites = JSON.parse(localStorage.getItem(`userFavorites_${authUser.id}`) || '[]');
      const isFavorited = existingFavorites.some((fav: any) => fav.id === listing.id);
      setIsLiked(isFavorited);
    }
  }, [listing, authUser]);

  // Fetch listing details
  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Always try mock data first for reliable functionality
        const mockResponse = getMockListing(id);
        if (mockResponse) {
          console.log('Using mock data for listing:', id);
          setListing(mockResponse.listing);
          if (mockResponse.recommended) {
            setRecommendedListings(mockResponse.recommended);
          }
          setLoading(false);
          return;
        }

        // Fallback to API if mock data not available
        const API_URL = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
        console.log('Fetching listing details from:', `${API_URL}/listings/${id}`);
        
        const response = await fetch(`${API_URL}/listings/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Annonsen hittades inte');
          }
          throw new Error('Kunde inte ladda annonsen');
        }
        
        const data = await response.json();
        
        if (data.success && data.data?.listing) {
          // Transform API data to match component interface
          const apiListing = data.data.listing;
          const transformedListing = {
            ...apiListing,
            subcategory: apiListing.subcategory || '',
            highlights: apiListing.highlights || [],
            images: apiListing.images || [],
            seller: {
              name: apiListing.owner?.firstName ? `${apiListing.owner.firstName} ${apiListing.owner.lastName}` : 'Anonym säljare',
              verified: true,
              joinedDate: apiListing.createdAt
            },
            viewCount: apiListing.viewCount || 0,
            interestedBuyers: apiListing.interestedBuyers || 0
          };
          setListing(transformedListing);
          
          // Set recommended listings if available
          if (data.data?.recommended) {
            setRecommendedListings(data.data.recommended);
          }
        } else {
          throw new Error('Ogiltig data från servern');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ett okänt fel inträffade');
        console.error('Error fetching listing:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  // Handle interest submission
  const handleInterest = async () => {
    if (!listing) return;
    
    try {
      // Send interest message via our messages API
      const API_URL = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          listingId: listing.id,
          sellerId: `seller_${listing.id}`,
          inquiryType: 'GENERAL',
          message: `Hej ${listing.seller.name},

Jag är intresserad av ditt företag "${listing.title}" och skulle vilja veta mer.

Kan du kontakta mig för att diskutera möjligheterna?

Med vänliga hälsningar`,
          name: 'Intresserad köpare',
          email: 'interested@example.com'
        })
      });
      
      if (response.ok) {
        toast.success('Ditt intresse har registrerats! Säljaren kommer att kontakta dig.');
        setShowInterestModal(false);
        // Update interested buyers count
        setListing(prev => prev ? { ...prev, interestedBuyers: prev.interestedBuyers + 1 } : null);
      } else {
        toast.error('Kunde inte skicka intresse');
      }
    } catch (err) {
      toast.error('Ett fel inträffade');
      console.error('Error submitting interest:', err);
    }
  };

  // Enhanced email validation
  const validateEmail = (email: string) => {
    // RFC 5322 compliant regex for email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'E-post är obligatorisk' };
    }
    
    if (email.length > 254) {
      return { valid: false, error: 'E-post är för lång' };
    }
    
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Ogiltig e-postadress format' };
    }
    
    // Check for common disposable email domains
    const disposableDomains = [
      '10minutemail.com', 'temp-mail.org', 'guerrillamail.com', 
      'mailinator.com', 'throwaway.email', 'tempmail.com',
      'sharklasers.com', 'yopmail.com'
    ];
    
    const domain = email.split('@')[1]?.toLowerCase();
    if (disposableDomains.includes(domain)) {
      return { valid: false, error: 'Temporära e-postadresser är inte tillåtna' };
    }
    
    return { valid: true };
  };

  // Legacy function for backward compatibility
  const isValidEmail = (email: string) => {
    return validateEmail(email).valid;
  };

  // Handle like functionality
  const handleLike = () => {
    if (!listing) return;
    
    setIsLiked(prev => {
      const newLiked = !prev;
      setLikeCount(prevCount => newLiked ? prevCount + 1 : prevCount - 1);
      
      // Save to or remove from favorites
      if (newLiked) {
        // Add to favorites
        if (!authUser) {
          toast.error('Du måste vara inloggad för att spara favoriter');
          return false;
        }
        const currentUserId = authUser.id;
        const favoriteData = {
          ...listing,
          savedAt: new Date().toISOString(),
          userId: currentUserId
        };
        
        const existingFavorites = JSON.parse(localStorage.getItem(`userFavorites_${currentUserId}`) || '[]');
        const updatedFavorites = [...existingFavorites, favoriteData];
        localStorage.setItem(`userFavorites_${currentUserId}`, JSON.stringify(updatedFavorites));
        
        toast.success(`${listing.title} tillagd i favoriter!`, {
          icon: '❤️',
          duration: 2000,
        });
      } else {
        // Remove from favorites
        if (!authUser) return false;
        const currentUserId = authUser.id;
        const existingFavorites = JSON.parse(localStorage.getItem(`userFavorites_${currentUserId}`) || '[]');
        const updatedFavorites = existingFavorites.filter((fav: any) => fav.id !== listing.id);
        localStorage.setItem(`userFavorites_${currentUserId}`, JSON.stringify(updatedFavorites));
        
        toast.success('Borttagen från favoriter');
      }
      
      return newLiked;
    });
  };

  // Handle share functionality
  const handleListingShare = (platform?: string) => {
    const url = window.location.href;
    const text = `Kolla in denna annons: ${listing?.title} - ${formatPrice(listing?.askingPrice || 0, listing?.currency || 'SEK')}`;
    
    if (platform === 'whatsapp') {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
      window.open(whatsappUrl, '_blank');
    } else if (platform === 'facebook') {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      window.open(facebookUrl, '_blank');
    } else if (platform === 'twitter') {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, '_blank');
    } else if (platform === 'linkedin') {
      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
      window.open(linkedinUrl, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(() => {
        alert('Länk kopierad till urklipp!');
        setShowShareModal(false);
      });
    }
  };

  // Handle location click - open Google Maps
  const handleLocationClick = () => {
    if (listing?.location) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.location)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  // Handle bid submission
  const handleBid = async () => {
    if (!listing || !bidAmount) {
      toast.error('Ange ett budbelopp');
      return;
    }
    
    // Validate required fields
    if (!contactInfo.name.trim()) {
      toast.error('Ange ditt namn');
      return;
    }
    
    if (!contactInfo.email.trim()) {
      toast.error('Ange din email-adress');
      return;
    }
    
    if (!isValidEmail(contactInfo.email)) {
      toast.error('Ange en giltig email-adress');
      return;
    }
    
    const amount = parseFloat(bidAmount.replace(/\s/g, '').replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      toast.error('Ange ett giltigt budbelopp');
      return;
    }
    
    try {
      // Send bid via our messages API
      const API_URL = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
      const bidMessage = `Hej ${listing.seller.name},

Jag vill lämna ett bud på "${listing.title}".

BUDDETALJER:
• Budbelopp: ${formatPrice(amount, listing.currency)}
• Utgångspris: ${formatPrice(listing.askingPrice, listing.currency)}
• Budratio: ${((amount / listing.askingPrice) * 100).toFixed(1)}%

${bidComment ? `KOMMENTAR:
${bidComment}

` : ''}KONTAKTINFORMATION:
• Namn: ${contactInfo.name}
• E-post: ${contactInfo.email}
${contactInfo.phone ? `• Telefon: ${contactInfo.phone}` : ''}

Jag är seriöst intresserad och redo att gå vidare med köpprocessen.

Med vänliga hälsningar,
${contactInfo.name}`;

      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          listingId: listing.id,
          sellerId: `seller_${listing.id}`,
          inquiryType: 'FINANCIAL',
          message: bidMessage,
          name: contactInfo.name,
          email: contactInfo.email,
          phone: contactInfo.phone || undefined
        })
      });
      
      if (response.ok) {
        toast.success('Ditt bud har skickats! Säljaren kommer att kontakta dig inom kort.');
        setShowBidModal(false);
        setBidAmount('');
        setBidComment('');
        setContactInfo({ name: '', email: '', phone: '' });
        // Update interested buyers count
        setListing(prev => prev ? { ...prev, interestedBuyers: prev.interestedBuyers + 1 } : null);
      } else {
        toast.error('Kunde inte skicka bud');
      }
    } catch (err) {
      toast.error('Ett fel inträffade');
      console.error('Error submitting bid:', err);
    }
  };

  // Share functions
  const shareToWhatsApp = () => {
    const url = window.location.href;
    const text = `Kolla in denna annons: ${listing?.title} - ${formatPrice(listing?.askingPrice || 0, listing?.currency || 'SEK')}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToMessenger = () => {
    const url = window.location.href;
    const messengerUrl = `https://www.facebook.com/dialog/send?app_id=YOUR_APP_ID&link=${encodeURIComponent(url)}&redirect_uri=${encodeURIComponent(url)}`;
    window.open(messengerUrl, '_blank');
  };

  const shareToTelegram = () => {
    const url = window.location.href;
    const text = `Kolla in denna annons: ${listing?.title}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank');
  };

  const shareToEmail = () => {
    const url = window.location.href;
    const subject = `Intressant annons: ${listing?.title}`;
    const body = `Hej!\n\nJag hittade denna intressanta annons som jag tänkte du skulle vara intresserad av:\n\n${listing?.title}\nPris: ${formatPrice(listing?.askingPrice || 0, listing?.currency || 'SEK')}\n\n${url}\n\nMvh`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = emailUrl;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Länk kopierad till urklipp!');
    } catch (err) {
      toast.error('Kunde inte kopiera länk');
    }
  };


  // Handle share listing
  const handleShare = async (platform?: string) => {
    if (!listing) return;
    
    try {
      const response = await fetch(`/api/listings/${listing.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ platform })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Copy link to clipboard
        const shareUrl = `${window.location.origin}/listings/${listing.id}`;
        navigator.clipboard.writeText(shareUrl);
        toast.success('Länk kopierad till urklipp!');
      }
    } catch (err) {
      // Fallback: just copy current URL
      navigator.clipboard.writeText(window.location.href);
      toast.success('Länk kopierad till urklipp!');
    }
  };

  // Format price
  const formatPrice = (price: number, currency: string = 'SEK') => {
    return price.toLocaleString('sv-SE') + ' ' + currency;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get category info
  const getCategoryInfo = (category: string) => {
    return CATEGORY_INFO[category as keyof typeof CATEGORY_INFO] || CATEGORY_INFO.companies;
  };

  // Get category color classes
  const getCategoryColorClasses = (category: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800',
      pink: 'bg-pink-100 text-pink-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      cyan: 'bg-cyan-100 text-cyan-800',
      gray: 'bg-gray-100 text-gray-800',
      yellow: 'bg-yellow-100 text-yellow-800'
    };
    const color = getCategoryInfo(category).color;
    return colorMap[color as keyof typeof colorMap];
  };

  // Get status color classes
  const getStatusColorClasses = (status: string) => {
    const colorMap = {
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      gray: 'bg-gray-100 text-gray-800'
    };
    const color = STATUS_INFO[status as keyof typeof STATUS_INFO]?.color || 'gray';
    return colorMap[color as keyof typeof colorMap];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Laddar annons...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Annonsen hittades inte</h2>
          <p className="text-gray-600 mb-4">{error || 'Annonsen du söker efter finns inte längre.'}</p>
          <Link 
            to="/listings"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka till annonser
          </Link>
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(listing.category);
  const IconComponent = categoryInfo.icon;

  return (
    <>
      <Helmet>
        <title>{listing.title} - 123Hansa</title>
        <meta name="description" content={listing.description} />
        <meta property="og:title" content={listing.title} />
        <meta property="og:description" content={listing.description} />
        {listing.images.length > 0 && (
          <meta property="og:image" content={listing.images[0]} />
        )}
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link 
              to="/listings"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tillbaka till annonser
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images and Details */}
            <div className="lg:col-span-2">
              {/* Image Gallery */}
              {listing.images && listing.images.length > 0 && (
                <div className="mb-8">
                  <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden mb-4">
                    <img 
                      src={listing.images[selectedImageIndex]} 
                      alt={listing.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop';
                      }}
                    />
                  </div>
                  {listing.images.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto">
                      {listing.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                            index === selectedImageIndex ? 'border-blue-500' : 'border-gray-300'
                          }`}
                        >
                          <img 
                            src={image} 
                            alt={`${listing.title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Basic Info */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColorClasses(listing.category)}`}>
                      <IconComponent className="w-4 h-4 mr-1 inline" />
                      {categoryInfo.name}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColorClasses(listing.status)}`}>
                      {STATUS_INFO[listing.status as keyof typeof STATUS_INFO]?.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {listing.viewCount} visningar
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {listing.interestedBuyers} intresserade
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={handleLike}
                      className={`p-2 transition-colors flex items-center space-x-1 ${
                        isLiked 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                      title={isLiked ? 'Ta bort från favoriter' : 'Lägg till i favoriter'}
                    >
                      <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium">{likeCount}</span>
                    </button>
                    <button 
                      onClick={() => setShowShareModal(true)}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Dela annons"
                    >
                      <Share2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={handleLocationClick}
                  className="flex items-center text-gray-600 mb-6 hover:text-emerald-600 transition-colors cursor-pointer"
                  title="Visa på Google Maps"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  <span className="underline">{listing.location}</span>
                </button>
                
                <p className="text-gray-700 leading-relaxed">{listing.description}</p>
              </div>

              {/* Highlights */}
              {listing.highlights && listing.highlights.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Höjdpunkter</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {listing.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category-specific details */}
              {listing.category === 'companies' && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Företagsinformation</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {listing.employees && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Antal anställda</div>
                        <div className="text-lg font-semibold">{listing.employees}</div>
                      </div>
                    )}
                    {listing.foundedYear && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Grundat år</div>
                        <div className="text-lg font-semibold">{listing.foundedYear}</div>
                      </div>
                    )}
                    {listing.monthlyRevenue && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Månadsomsättning</div>
                        <div className="text-lg font-semibold">{formatPrice(listing.monthlyRevenue)} / mån</div>
                      </div>
                    )}
                    {listing.monthlyProfit && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Månadsvinst</div>
                        <div className="text-lg font-semibold text-green-600">{formatPrice(listing.monthlyProfit)} / mån</div>
                      </div>
                    )}
                    {listing.businessType && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Bolagsform</div>
                        <div className="text-lg font-semibold">{listing.businessType}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Digital assets specific details */}
              {listing.category === 'digital' && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Digital tillgång</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {listing.monthlyRevenue && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Månadsinkomst</div>
                        <div className="text-lg font-semibold">{formatPrice(listing.monthlyRevenue)} / mån</div>
                      </div>
                    )}
                    {listing.traffic?.monthly && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Månadstrafik</div>
                        <div className="text-lg font-semibold">{listing.traffic.monthly.toLocaleString('sv-SE')} besökare</div>
                      </div>
                    )}
                    {listing.downloads && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Nedladdningar</div>
                        <div className="text-lg font-semibold">{listing.downloads.toLocaleString('sv-SE')}</div>
                      </div>
                    )}
                    {listing.activeUsers && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Aktiva användare</div>
                        <div className="text-lg font-semibold">{listing.activeUsers.toLocaleString('sv-SE')}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Seller Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Säljare</h2>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-900">{listing.seller.name}</span>
                      {listing.seller.verified && (
                        <Shield className="w-4 h-4 text-green-500 ml-2" title="Verifierad säljare" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Medlem sedan {formatDate(listing.seller.joinedDate)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Price and Actions */}
            <div className="lg:col-span-1">
              {/* Premium Bid Section - Not Sticky */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
                <div className="text-center mb-6">
                  <div className="text-sm font-medium text-gray-500 mb-1">Utgångspris</div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatPrice(listing.askingPrice, listing.currency)}
                  </div>
                  {listing.isNegotiable && (
                    <div className="text-sm text-gray-600">Förhandlingsbart</div>
                  )}
                </div>
                
                
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => setShowBidModal(true)}
                    disabled={listing.status !== 'ACTIVE'}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                      listing.status === 'ACTIVE'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <DollarSign className="w-5 h-5 mr-2 inline" />
                    {listing.status === 'ACTIVE' ? 'Lämna bud' : 'Ej tillgänglig'}
                  </button>
                  
                  <button
                    onClick={() => setShowContactModal(true)}
                    disabled={listing.status !== 'ACTIVE'}
                    className={`w-full py-3 px-4 border border-gray-300 rounded-lg font-semibold transition-colors ${
                      listing.status === 'ACTIVE'
                        ? 'text-gray-700 hover:bg-gray-50'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <MessageCircle className="w-5 h-5 mr-2 inline" />
                    Kontakta säljare
                  </button>
                  
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-5 h-5 mr-2 inline" />
                    Dela annons
                  </button>
                  
                  <button
                    onClick={() => setShowInterestModal(true)}
                    disabled={listing.status !== 'ACTIVE'}
                    className={`w-full py-2 px-4 border border-gray-300 rounded-lg font-medium transition-colors ${
                      listing.status === 'ACTIVE'
                        ? 'text-gray-600 hover:bg-gray-50'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Heart className="w-4 h-4 mr-2 inline" />
                    Visa intresse
                  </button>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span>Publicerad:</span>
                      <span>{formatDate(listing.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kategori:</span>
                      <span>{categoryInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annons-ID:</span>
                      <span className="font-mono text-xs">{listing.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Listings Section */}
              {recommendedListings.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Rekommenderade annonser
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">Andra annonser som våra kunder kan finna intressanta</p>
                  <div className="space-y-4">
                    {recommendedListings.map((rec) => {
                      const recCategoryInfo = getCategoryInfo(rec.category);
                      const RecIconComponent = recCategoryInfo.icon;
                      return (
                        <Link
                          key={rec.id}
                          to={`/listings/${rec.id}`}
                          className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                        >
                          <div className="flex space-x-3">
                            <div className="flex-shrink-0">
                              <img
                                src={rec.images[0]}
                                alt={rec.title}
                                className="w-16 h-16 object-cover rounded-lg"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColorClasses(rec.category)}`}>
                                  <RecIconComponent className="w-3 h-3 mr-1 inline" />
                                  {recCategoryInfo.name}
                                </span>
                              </div>
                              <h4 className="font-semibold text-gray-900 truncate mb-1">{rec.title}</h4>
                              <div className="flex items-center justify-between">
                                <div className="text-lg font-bold text-blue-600">
                                  {formatPrice(rec.askingPrice, rec.currency)}
                                </div>
                                <div className="flex items-center space-x-3 text-xs text-gray-500">
                                  <div className="flex items-center">
                                    <Eye className="w-3 h-3 mr-1" />
                                    {rec.viewCount}
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="w-3 h-3 mr-1" />
                                    {rec.interestedBuyers}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <MapPin className="w-3 h-3 mr-1" />
                                {rec.location}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link
                      to="/listings"
                      className="flex items-center justify-center w-full py-2 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Se alla annonser
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      {showBidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Lämna bud</h3>
            <p className="text-gray-600 mb-6">
              Lämna ett seriöst bud på {listing?.title}. Säljaren kommer att svara inom 48 timmar.
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budbelopp (SEK) *
                </label>
                <input
                  type="text"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`t.ex. ${listing?.askingPrice.toLocaleString('sv-SE')}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kommentar (valfritt)
                </label>
                <textarea
                  value={bidComment}
                  onChange={(e) => setBidComment(e.target.value)}
                  placeholder="Motivera ditt bud eller ställ frågor..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={contactInfo.name}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ditt namn *"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="E-post *"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBidModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Avbryt
              </button>
              <button
                onClick={handleBid}
                disabled={!bidAmount || !contactInfo.name || !contactInfo.email}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Skicka bud
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {listing && (
        <ContactSellerModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          listing={{
            id: listing.id,
            title: listing.title,
            seller: {
              name: listing.seller.name,
              verified: listing.seller.verified,
              rating: 4.8,
              totalTransactions: 12
            },
            sellerId: `seller_${listing.id}`
          }}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Dela annons</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Dela denna annons med dina kontakter på sociala medier eller kopiera länken.
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => {
                  handleListingShare('whatsapp');
                  setShowShareModal(false);
                }}
                className="flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp
              </button>
              
              <button
                onClick={() => {
                  handleListingShare('facebook');
                  setShowShareModal(false);
                }}
                className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <div className="w-5 h-5 mr-2 bg-white rounded text-blue-600 flex items-center justify-center text-xs font-bold">f</div>
                Facebook
              </button>
              
              <button
                onClick={() => {
                  handleListingShare('twitter');
                  setShowShareModal(false);
                }}
                className="flex items-center justify-center px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
              >
                <div className="w-5 h-5 mr-2 bg-white rounded text-sky-500 flex items-center justify-center text-xs font-bold">𝕏</div>
                Twitter
              </button>
              
              <button
                onClick={() => {
                  handleListingShare('linkedin');
                  setShowShareModal(false);
                }}
                className="flex items-center justify-center px-4 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                <div className="w-5 h-5 mr-2 bg-white rounded text-blue-700 flex items-center justify-center text-xs font-bold">in</div>
                LinkedIn
              </button>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  onClick={() => {
                    handleListingShare('copy');
                    setShowShareModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Kopiera
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interest Modal */}
      {showInterestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Visa intresse</h3>
            <p className="text-gray-600 mb-6">
              Genom att visa intresse kommer säljaren att kontakta dig med mer information inom 24 timmar.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowInterestModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Avbryt
              </button>
              <button
                onClick={handleInterest}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Skicka intresse
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ListingDetailPage;