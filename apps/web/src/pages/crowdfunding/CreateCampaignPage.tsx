import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Upload, 
  X,
  DollarSign,
  Calendar,
  Gift,
  Info,
  Rocket,
  Eye
} from 'lucide-react';
import { campaignCategories } from '../../data/crowdfundingData';

interface CampaignData {
  // Basic Info
  title: string;
  description: string;
  category: string;
  location: string;
  
  // Funding
  fundingGoal: number;
  currency: string;
  duration: number;
  
  // Media
  mainImage: string;
  additionalImages: string[];
  video: string;
  
  // Rewards
  rewards: Array<{
    id: string;
    title: string;
    description: string;
    amount: number;
    estimatedDelivery: string;
    limited: boolean;
    limitCount?: number;
    includes: string[];
  }>;
  
  // Story
  story: string;
  risks: string;
  timeline: string;
}

const CreateCampaignPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    title: '',
    description: '',
    category: '',
    location: '',
    fundingGoal: 0,
    currency: 'SEK',
    duration: 30,
    mainImage: '',
    additionalImages: [],
    video: '',
    rewards: [],
    story: '',
    risks: '',
    timeline: ''
  });

  const steps = [
    { id: 1, title: 'Grundläggande', description: 'Titel, beskrivning och kategori' },
    { id: 2, title: 'Finansiering', description: 'Mål och tidsram' },
    { id: 3, title: 'Media', description: 'Bilder och video' },
    { id: 4, title: 'Belöningar', description: 'Skapa belöningsnivåer' },
    { id: 5, title: 'Berättelse', description: 'Din fullständiga story' },
    { id: 6, title: 'Förhandsvisning', description: 'Granska innan publicering' }
  ];

  const updateCampaignData = (field: keyof CampaignData, value: any) => {
    setCampaignData(prev => ({ ...prev, [field]: value }));
  };

  const addReward = () => {
    const newReward = {
      id: `reward-${Date.now()}`,
      title: '',
      description: '',
      amount: 0,
      estimatedDelivery: '',
      limited: false,
      includes: ['']
    };
    setCampaignData(prev => ({
      ...prev,
      rewards: [...prev.rewards, newReward]
    }));
  };

  const updateReward = (index: number, field: string, value: any) => {
    setCampaignData(prev => ({
      ...prev,
      rewards: prev.rewards.map((reward, i) => 
        i === index ? { ...reward, [field]: value } : reward
      )
    }));
  };

  const removeReward = (index: number) => {
    setCampaignData(prev => ({
      ...prev,
      rewards: prev.rewards.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kampanjtitel *
              </label>
              <input
                type="text"
                value={campaignData.title}
                onChange={(e) => updateCampaignData('title', e.target.value)}
                placeholder="Ge din kampanj en catchy titel..."
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  campaignData.title.length > 0 && campaignData.title.length < 10 
                    ? 'border-red-300 bg-red-50' 
                    : campaignData.title.length >= 10 && campaignData.title.length <= 100
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300'
                }`}
                maxLength={100}
              />
              <div className="flex justify-between items-center mt-1">
                <p className={`text-sm ${
                  campaignData.title.length >= 10 && campaignData.title.length <= 100 
                    ? 'text-green-600' 
                    : campaignData.title.length > 0 
                    ? 'text-red-600' 
                    : 'text-gray-500'
                }`}>
                  {campaignData.title.length < 10 && campaignData.title.length > 0 
                    ? `Minst ${10 - campaignData.title.length} tecken till` 
                    : campaignData.title.length >= 10 
                    ? '✓ Bra längd' 
                    : 'Minst 10 tecken krävs'
                  }
                </p>
                <p className="text-sm text-gray-500">
                  {campaignData.title.length}/100 tecken
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kort beskrivning *
              </label>
              <textarea
                value={campaignData.description}
                onChange={(e) => updateCampaignData('description', e.target.value)}
                placeholder="Beskriv ditt projekt i några meningar..."
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  campaignData.description.length > 0 && campaignData.description.length < 50 
                    ? 'border-red-300 bg-red-50' 
                    : campaignData.description.length >= 50 && campaignData.description.length <= 300
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300'
                }`}
                maxLength={300}
              />
              <div className="flex justify-between items-center mt-1">
                <p className={`text-sm ${
                  campaignData.description.length >= 50 && campaignData.description.length <= 300 
                    ? 'text-green-600' 
                    : campaignData.description.length > 0 
                    ? 'text-red-600' 
                    : 'text-gray-500'
                }`}>
                  {campaignData.description.length < 50 && campaignData.description.length > 0 
                    ? `Minst ${50 - campaignData.description.length} tecken till` 
                    : campaignData.description.length >= 50 
                    ? '✓ Bra längd' 
                    : 'Minst 50 tecken krävs'
                  }
                </p>
                <p className="text-sm text-gray-500">
                  {campaignData.description.length}/300 tecken
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <select
                value={campaignData.category}
                onChange={(e) => updateCampaignData('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Välj kategori</option>
                {campaignCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plats *
              </label>
              <input
                type="text"
                value={campaignData.location}
                onChange={(e) => updateCampaignData('location', e.target.value)}
                placeholder="Stockholm, Sverige"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Finansieringsmål *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={campaignData.fundingGoal || ''}
                  onChange={(e) => updateCampaignData('fundingGoal', Number(e.target.value))}
                  placeholder="500000"
                  min={10000}
                  max={10000000}
                  className={`w-full px-4 py-3 pr-16 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    campaignData.fundingGoal > 0 && (campaignData.fundingGoal < 10000 || campaignData.fundingGoal > 10000000)
                      ? 'border-red-300 bg-red-50' 
                      : campaignData.fundingGoal >= 10000 && campaignData.fundingGoal <= 10000000
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300'
                  }`}
                />
                <span className="absolute right-4 top-3 text-gray-500">SEK</span>
              </div>
              <div className="mt-2 space-y-1">
                <p className={`text-sm ${
                  campaignData.fundingGoal >= 10000 && campaignData.fundingGoal <= 10000000 
                    ? 'text-green-600' 
                    : campaignData.fundingGoal > 0 
                    ? 'text-red-600' 
                    : 'text-gray-600'
                }`}>
                  {campaignData.fundingGoal > 0 && campaignData.fundingGoal < 10000 
                    ? '⚠️ Minimum 10 000 kr krävs' 
                    : campaignData.fundingGoal > 10000000 
                    ? '⚠️ Maximum 10 000 000 kr' 
                    : campaignData.fundingGoal >= 10000 
                    ? '✓ Bra målsättning' 
                    : ''
                  }
                </p>
                <p className="text-sm text-gray-600">
                  <Info className="w-4 h-4 inline mr-1" />
                  Sätt ett realistiskt mål (10 000 - 10 000 000 kr)
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kampanjlängd *
              </label>
              <select
                value={campaignData.duration}
                onChange={(e) => updateCampaignData('duration', Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value={15}>15 dagar</option>
                <option value={30}>30 dagar (rekommenderat)</option>
                <option value={45}>45 dagar</option>
                <option value={60}>60 dagar</option>
              </select>
              <p className="text-sm text-gray-600 mt-2">
                Kortare kampanjer skapar mer urgency och har ofta högre framgångsgrad
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Finansieringsmodell</h4>
              <p className="text-blue-800 text-sm mb-3">
                Tubba använder "allt-eller-inget" modell. Om du inte når ditt mål får supporters tillbaka sina pengar.
              </p>
              <div className="flex items-center text-blue-700 text-sm">
                <Check className="w-4 h-4 mr-2" />
                <span>Säker för supporters</span>
              </div>
              <div className="flex items-center text-blue-700 text-sm mt-1">
                <Check className="w-4 h-4 mr-2" />
                <span>Motiverar till realistiska mål</span>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Huvudbild *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Dra och släpp din bild här, eller klicka för att välja</p>
                <p className="text-sm text-gray-500">Rekommenderat: 1200x800px, JPG eller PNG</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    // File upload logic would go here
                    if (e.target.files?.[0]) {
                      updateCampaignData('mainImage', URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                />
              </div>
              {campaignData.mainImage && (
                <div className="mt-4">
                  <img 
                    src={campaignData.mainImage} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kampanjvideo (valfritt)
              </label>
              <input
                type="url"
                value={campaignData.video}
                onChange={(e) => updateCampaignData('video', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <p className="text-sm text-gray-600 mt-2">
                Kampanjer med video har 85% högre framgångsgrad
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ytterligare bilder (valfritt)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Ladda upp fler bilder för att visa ditt projekt</p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Belöningsnivåer</h3>
                <p className="text-gray-600 text-sm">Skapa attraktiva belöningar för dina supporters</p>
              </div>
              <button
                onClick={addReward}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              >
                + Lägg till belöning
              </button>
            </div>

            {campaignData.rewards.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Du har inga belöningar än</p>
                <button
                  onClick={addReward}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Skapa din första belöning
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {campaignData.rewards.map((reward, index) => (
                  <div key={reward.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-gray-900">Belöning #{index + 1}</h4>
                      <button
                        onClick={() => removeReward(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Titel
                        </label>
                        <input
                          type="text"
                          value={reward.title}
                          onChange={(e) => updateReward(index, 'title', e.target.value)}
                          placeholder="Early Bird Supporter"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Belopp (SEK)
                        </label>
                        <input
                          type="number"
                          value={reward.amount || ''}
                          onChange={(e) => updateReward(index, 'amount', Number(e.target.value))}
                          placeholder="500"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Beskrivning
                      </label>
                      <textarea
                        value={reward.description}
                        onChange={(e) => updateReward(index, 'description', e.target.value)}
                        placeholder="Vad får supporters för denna nivå?"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Leveransdatum
                      </label>
                      <input
                        type="text"
                        value={reward.estimatedDelivery}
                        onChange={(e) => updateReward(index, 'estimatedDelivery', e.target.value)}
                        placeholder="Juni 2024"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={reward.limited}
                          onChange={(e) => updateReward(index, 'limited', e.target.checked)}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Begränsat antal</span>
                      </label>
                      {reward.limited && (
                        <input
                          type="number"
                          value={reward.limitCount || ''}
                          onChange={(e) => updateReward(index, 'limitCount', Number(e.target.value))}
                          placeholder="Antal tillgängliga"
                          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Din fullständiga story *
              </label>
              <textarea
                value={campaignData.story}
                onChange={(e) => updateCampaignData('story', e.target.value)}
                placeholder="Berätta din fullständiga story här. Vad är din vision? Varför ska folk stötta dig? Vad gör ditt projekt unikt?"
                rows={8}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  campaignData.story.length > 0 && campaignData.story.length < 200 
                    ? 'border-red-300 bg-red-50' 
                    : campaignData.story.length >= 200
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between items-center mt-2">
                <p className={`text-sm ${
                  campaignData.story.length >= 200 
                    ? 'text-green-600' 
                    : campaignData.story.length > 0 
                    ? 'text-red-600' 
                    : 'text-gray-600'
                }`}>
                  {campaignData.story.length < 200 && campaignData.story.length > 0 
                    ? `Minst ${200 - campaignData.story.length} tecken till` 
                    : campaignData.story.length >= 200 
                    ? '✓ Bra längd på story' 
                    : 'Minst 200 tecken krävs för en bra story'
                  }
                </p>
                <p className="text-sm text-gray-500">
                  {campaignData.story.length} tecken
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risker och utmaningar *
              </label>
              <textarea
                value={campaignData.risks}
                onChange={(e) => updateCampaignData('risks', e.target.value)}
                placeholder="Vilka risker finns med projektet? Hur planerar du att hantera eventuella utmaningar?"
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  campaignData.risks.length > 0 && campaignData.risks.length < 50 
                    ? 'border-red-300 bg-red-50' 
                    : campaignData.risks.length >= 50
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between items-center mt-2">
                <p className={`text-sm ${
                  campaignData.risks.length >= 50 
                    ? 'text-green-600' 
                    : campaignData.risks.length > 0 
                    ? 'text-red-600' 
                    : 'text-gray-600'
                }`}>
                  {campaignData.risks.length < 50 && campaignData.risks.length > 0 
                    ? `Minst ${50 - campaignData.risks.length} tecken till` 
                    : campaignData.risks.length >= 50 
                    ? '✓ Bra beskrivning av risker' 
                    : 'Minst 50 tecken krävs'
                  }
                </p>
                <p className="text-sm text-gray-500">
                  {campaignData.risks.length} tecken
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Transparens bygger förtroende. Supporters uppskattar ärlighet om potentiella risker.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeline och milstolpar
              </label>
              <textarea
                value={campaignData.timeline}
                onChange={(e) => updateCampaignData('timeline', e.target.value)}
                placeholder="Vad är din plan framåt? Viktiga milstolpar och datum?"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <Eye className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900 mb-1">Förhandsvisning</h4>
                  <p className="text-yellow-800 text-sm">
                    Granska din kampanj noggrant innan du publicerar. Du kan redigera vissa delar efter publicering, men inte alla.
                  </p>
                </div>
              </div>
            </div>

            {/* Campaign Preview */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                <p className="text-white text-center">
                  {campaignData.mainImage ? 'Huvudbild kommer här' : 'Ingen huvudbild uppladdad'}
                </p>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <span className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full mb-2">
                    {campaignCategories.find(c => c.id === campaignData.category)?.name || 'Ingen kategori'}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {campaignData.title || 'Ingen titel'}
                  </h1>
                  <p className="text-gray-600">
                    {campaignData.description || 'Ingen beskrivning'}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center py-4 border-t border-gray-100">
                  <div>
                    <div className="text-lg font-bold text-emerald-600">
                      {campaignData.fundingGoal.toLocaleString('sv-SE')} kr
                    </div>
                    <div className="text-sm text-gray-500">Mål</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-500">Supporters</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">{campaignData.duration}</div>
                    <div className="text-sm text-gray-500">Dagar</div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Belöningar ({campaignData.rewards.length})</h3>
                  {campaignData.rewards.length === 0 ? (
                    <p className="text-gray-500 text-sm">Inga belöningar skapade</p>
                  ) : (
                    <div className="text-sm text-gray-600">
                      Från {Math.min(...campaignData.rewards.map(r => r.amount)).toLocaleString('sv-SE')} kr
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Validation Checklist */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Pre-launch checklista</h4>
              <div className="space-y-3">
                {[
                  { 
                    label: 'Titel (10-100 tecken)', 
                    completed: campaignData.title.length >= 10 && campaignData.title.length <= 100,
                    detail: `${campaignData.title.length}/100 tecken`
                  },
                  { 
                    label: 'Beskrivning (50-300 tecken)', 
                    completed: campaignData.description.length >= 50 && campaignData.description.length <= 300,
                    detail: `${campaignData.description.length}/300 tecken`
                  },
                  { 
                    label: 'Kategori vald', 
                    completed: campaignData.category !== '',
                    detail: campaignData.category ? campaignCategories.find(c => c.id === campaignData.category)?.name : 'Ingen vald'
                  },
                  { 
                    label: 'Finansieringsmål (10k-10M kr)', 
                    completed: campaignData.fundingGoal >= 10000 && campaignData.fundingGoal <= 10000000,
                    detail: campaignData.fundingGoal > 0 ? `${campaignData.fundingGoal.toLocaleString('sv-SE')} kr` : 'Inte satt'
                  },
                  { 
                    label: 'Huvudbild uppladdad', 
                    completed: campaignData.mainImage !== '',
                    detail: campaignData.mainImage ? 'Uppladdad' : 'Saknas'
                  },
                  { 
                    label: 'Fullständig story (200+ tecken)', 
                    completed: campaignData.story.length >= 200,
                    detail: `${campaignData.story.length} tecken`
                  },
                  { 
                    label: 'Risker beskrivna (50+ tecken)', 
                    completed: campaignData.risks.length >= 50,
                    detail: `${campaignData.risks.length} tecken`
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                        item.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {item.completed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      </div>
                      <span className={item.completed ? 'text-gray-900' : 'text-gray-500'}>
                        {item.label}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {item.detail}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Redo för publicering:</span>
                  <span className={`font-bold ${canProceed() ? 'text-emerald-600' : 'text-red-600'}`}>
                    {canProceed() ? '✓ Ja' : '✗ Nej'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepValidation = (step: number) => {
    switch (step) {
      case 1:
        return {
          titleValid: campaignData.title.length >= 10 && campaignData.title.length <= 100,
          descriptionValid: campaignData.description.length >= 50 && campaignData.description.length <= 300,
          categoryValid: campaignData.category !== '',
          locationValid: campaignData.location.length >= 2
        };
      case 2:
        return {
          goalValid: campaignData.fundingGoal >= 10000 && campaignData.fundingGoal <= 10000000,
          durationValid: campaignData.duration > 0
        };
      case 3:
        return {
          imageValid: true // Optional
        };
      case 4:
        return {
          rewardsValid: true // Optional but recommended
        };
      case 5:
        return {
          storyValid: campaignData.story.length >= 200,
          risksValid: campaignData.risks.length >= 50
        };
      case 6:
        return {
          allValid: true
        };
      default:
        return {};
    }
  };

  const canProceed = () => {
    const validation = getStepValidation(currentStep);
    return Object.values(validation).every(valid => valid === true);
  };

  return (
    <>
      <Helmet>
        <title>Skapa Kampanj - Tubba Crowdfunding</title>
        <meta name="description" content="Skapa din crowdfunding-kampanj och få finansiering för ditt företag." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link 
              to="/crowdfunding" 
              className="inline-flex items-center text-gray-600 hover:text-emerald-600 transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Tillbaka till crowdfunding
            </Link>
            
            <h1 className="text-2xl font-bold text-gray-900">Skapa din kampanj</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                    currentStep === step.id 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : currentStep > step.id
                      ? 'bg-emerald-100 text-emerald-600 border-emerald-300'
                      : 'bg-white text-gray-400 border-gray-300'
                  }`}>
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 ml-4 ${
                      currentStep > step.id ? 'bg-emerald-300' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {steps[currentStep - 1].title}
              </h2>
              <p className="text-gray-600">
                {steps[currentStep - 1].description}
              </p>
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ArrowLeft className="w-5 h-5 mr-2 inline" />
              Föregående
            </button>

            {currentStep === steps.length ? (
              <button
                onClick={() => {
                  // Handle campaign submission
                  alert('Kampanj skulle skickas in här!');
                  navigate('/crowdfunding');
                }}
                disabled={!canProceed()}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  canProceed()
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Rocket className="w-5 h-5 mr-2 inline" />
                Publicera kampanj
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  canProceed()
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Nästa
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateCampaignPage;