import React, { useState } from 'react';
import { 
  FileText, 
  Building2, 
  Lock, 
  TrendingUp,
  Shield,
  Eye,
  Edit3,
  Plus
} from 'lucide-react';
import { ContractTemplate, ContractType } from '../../types/contracts';

interface ContractTemplatesProps {
  onSelectTemplate: (template: ContractTemplate) => void;
  contractType?: ContractType;
}

const PROFESSIONAL_TEMPLATES: ContractTemplate[] = [
  {
    id: 'business_purchase_standard',
    name: 'Standardavtal för företagsförvärv',
    description: 'Komplett avtal för köp och försäljning av aktiebolag eller enskild firma',
    type: 'business_purchase',
    clauses: [
      {
        id: 'parties',
        title: 'Parter',
        content: 'Detta avtal träffas mellan [KÖPARE] ("Köparen") och [SÄLJARE] ("Säljaren") avseende överlåtelse av [FÖRETAG].',
        required: true,
        category: 'grundläggande'
      },
      {
        id: 'purchase_object',
        title: 'Köpeobjekt',
        content: 'Säljaren överlåter härmed till Köparen samtliga aktier i [FÖRETAG], organisationsnummer [ORG_NR], omfattande [ANTAL_AKTIER] aktier motsvarande [PROCENT]% av aktiekapitalet.',
        required: true,
        category: 'köpeobjekt'
      },
      {
        id: 'purchase_price',
        title: 'Köpeskilling',
        content: 'Köpeskillingen för aktierna uppgår till [BELOPP] [VALUTA] och betalas kontant vid tillträde.',
        required: true,
        category: 'ekonomisk'
      },
      {
        id: 'conditions_precedent',
        title: 'Villkor för genomförande',
        content: 'Avtalets genomförande är villkorat av:\n1. Godkännande från 123Hansa-plattformen\n2. Slutförd due diligence\n3. Verifiering av båda parter\n4. Escrow-säkring av köpeskilling',
        required: true,
        category: 'villkor'
      },
      {
        id: 'warranties',
        title: 'Garantier och försäkringar',
        content: 'Säljaren garanterar att företaget är skuldfritt och att alla uppgifter i datarummet är korrekta.',
        required: true,
        category: 'garantier'
      },
      {
        id: 'escrow_clause',
        title: 'Escrow-hantering',
        content: 'Köpeskillingen deponeras hos 123Hansa som escrow-agent och frigörs när båda parter och plattformen godkänt transaktionen.',
        required: true,
        category: 'säkerhet'
      },
      {
        id: 'dispute_resolution',
        title: 'Tvistelösning',
        content: 'Tvister avgörs genom skiljeförfarande enligt Stockholms Handelskammares regler.',
        required: false,
        category: 'juridisk'
      }
    ],
    customFields: [
      { id: 'company_name', name: 'Företagsnamn', type: 'text', required: true },
      { id: 'org_number', name: 'Organisationsnummer', type: 'text', required: true },
      { id: 'share_count', name: 'Antal aktier', type: 'number', required: true },
      { id: 'share_percentage', name: 'Andel (%)', type: 'number', required: true },
      { id: 'due_diligence_period', name: 'Due diligence-period (dagar)', type: 'number', required: false },
      { id: 'closing_date', name: 'Tillträdesdatum', type: 'date', required: false }
    ]
  },
  {
    id: 'asset_transfer_premium',
    name: 'Premiumavtal för tillgångsöverlåtelse',
    description: 'Avtal för överlåtelse av digitala tillgångar som webbsidor, domäner eller appar',
    type: 'asset_transfer',
    clauses: [
      {
        id: 'asset_description',
        title: 'Tillgångsbeskrivning',
        content: 'Överlåtelsen avser följande digitala tillgångar: [TILLGÅNGAR] inklusive alla immateriella rättigheter.',
        required: true,
        category: 'grundläggande'
      },
      {
        id: 'ip_rights',
        title: 'Immateriella rättigheter',
        content: 'Säljaren överlåter samtliga upphovsrätter, varumärken och andra immateriella rättigheter kopplade till tillgångarna.',
        required: true,
        category: 'juridisk'
      },
      {
        id: 'technical_transfer',
        title: 'Teknisk överlåtelse',
        content: 'Överlåtelsen inkluderar alla tekniska komponenter, databaser, användardata (i enlighet med GDPR) och administrativ åtkomst.',
        required: true,
        category: 'teknisk'
      },
      {
        id: 'revenue_guarantee',
        title: 'Intäktsgarantier',
        content: 'Säljaren garanterar att uppgiven intäktsinformation är korrekt för de senaste [PERIOD] månaderna.',
        required: false,
        category: 'ekonomisk'
      }
    ],
    customFields: [
      { id: 'asset_type', name: 'Typ av tillgång', type: 'select', required: true, options: ['Webbsida', 'Mobilapp', 'Domän', 'E-handelssajt', 'SaaS-plattform'] },
      { id: 'monthly_revenue', name: 'Månadsintäkt (SEK)', type: 'number', required: false },
      { id: 'transfer_method', name: 'Överlåtelsemetod', type: 'select', required: true, options: ['Komplett överföring', 'Gradvis överlåtelse', 'Licensavtal'] }
    ]
  },
  {
    id: 'partnership_agreement',
    name: 'Partnerskapsavtal',
    description: 'Avtal för strategiska partnerskap och samarbeten',
    type: 'partnership',
    clauses: [
      {
        id: 'partnership_purpose',
        title: 'Syfte med partnerskapet',
        content: 'Parterna ingår detta partnerskap i syfte att [SYFTE] under perioden [PERIOD].',
        required: true,
        category: 'grundläggande'
      },
      {
        id: 'responsibilities',
        title: 'Ansvar och skyldigheter',
        content: 'Vardera part ansvarar för [ANSVAR] och förbinder sig att tillhandahålla [RESURSER].',
        required: true,
        category: 'ansvar'
      },
      {
        id: 'revenue_sharing',
        title: 'Intäktsdelning',
        content: 'Intäkter från partnerskapet fördelas enligt följande: [FÖRDELNING].',
        required: false,
        category: 'ekonomisk'
      }
    ],
    customFields: [
      { id: 'partnership_duration', name: 'Partnerskapets längd (månader)', type: 'number', required: true },
      { id: 'revenue_split', name: 'Intäktsfördelning (%)', type: 'text', required: false }
    ]
  },
  {
    id: 'investment_agreement',
    name: 'Investeringsavtal',
    description: 'Professionellt avtal för investeringar i företag',
    type: 'investment',
    clauses: [
      {
        id: 'investment_amount',
        title: 'Investeringsbelopp',
        content: 'Investeraren investerar [BELOPP] [VALUTA] i företaget mot [ANDEL]% av aktierna.',
        required: true,
        category: 'ekonomisk'
      },
      {
        id: 'valuation',
        title: 'Värdering',
        content: 'Investeringen baseras på en företagsvärdering om [VÄRDERING] [VALUTA] pre-money.',
        required: true,
        category: 'ekonomisk'
      },
      {
        id: 'board_rights',
        title: 'Styrelseplats',
        content: 'Investeraren erhåller rätt till [ANTAL] platser i företagets styrelse.',
        required: false,
        category: 'styrning'
      },
      {
        id: 'exit_rights',
        title: 'Exit-rättigheter',
        content: 'Investeraren har rätt till förköp och medföljning vid framtida försäljningar.',
        required: true,
        category: 'juridisk'
      }
    ],
    customFields: [
      { id: 'investment_round', name: 'Investeringsrunda', type: 'select', required: true, options: ['Seed', 'Serie A', 'Serie B', 'Serie C', 'Övrigt'] },
      { id: 'liquidation_preference', name: 'Likvidationsföreträde', type: 'text', required: false },
      { id: 'anti_dilution', name: 'Utspädningsskydd', type: 'select', required: false, options: ['Ingen', 'Weighted average', 'Full ratchet'] }
    ]
  },
  {
    id: 'nda_comprehensive',
    name: 'Omfattande sekretessavtal (NDA)',
    description: 'Detaljerat sekretessavtal för känslig affärsinformation',
    type: 'nda',
    clauses: [
      {
        id: 'confidential_info',
        title: 'Konfidentiell information',
        content: 'Konfidentiell information inkluderar all affärs-, teknisk- och finansiell information som delas mellan parterna.',
        required: true,
        category: 'definition'
      },
      {
        id: 'obligations',
        title: 'Sekretesskyldighet',
        content: 'Mottagande part förbinder sig att hålla all konfidentiell information hemlig under [PERIOD] år.',
        required: true,
        category: 'skyldighet'
      },
      {
        id: 'permitted_use',
        title: 'Tillåten användning',
        content: 'Konfidentiell information får endast användas för [SYFTE] och får inte delas med tredje part.',
        required: true,
        category: 'användning'
      },
      {
        id: 'return_obligation',
        title: 'Återlämningsskyldighet',
        content: 'Vid avtalets upphörande ska all konfidentiell information återlämnas eller förstöras.',
        required: true,
        category: 'skyldighet'
      }
    ],
    customFields: [
      { id: 'disclosure_purpose', name: 'Syfte med informationsdelning', type: 'text', required: true },
      { id: 'confidentiality_period', name: 'Sekretessperiod (år)', type: 'number', required: true }
    ]
  }
];

export const ContractTemplates: React.FC<ContractTemplatesProps> = ({
  onSelectTemplate,
  contractType
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Filter templates by contract type if specified
  const filteredTemplates = contractType 
    ? PROFESSIONAL_TEMPLATES.filter(t => t.type === contractType)
    : PROFESSIONAL_TEMPLATES;

  const getTypeIcon = (type: ContractType) => {
    switch (type) {
      case 'business_purchase': return Building2;
      case 'asset_transfer': return FileText;
      case 'partnership': return FileText;
      case 'investment': return TrendingUp;
      case 'nda': return Lock;
      default: return FileText;
    }
  };

  const getTypeColor = (type: ContractType) => {
    switch (type) {
      case 'business_purchase': return 'text-blue-600 bg-blue-100';
      case 'asset_transfer': return 'text-green-600 bg-green-100';
      case 'partnership': return 'text-purple-600 bg-purple-100';
      case 'investment': return 'text-orange-600 bg-orange-100';
      case 'nda': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleSelectTemplate = (template: ContractTemplate) => {
    onSelectTemplate(template);
  };

  const previewTemplate = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Välj avtalsmall</h3>
        <p className="text-gray-600">Professionella avtalsmallar skapade av juridiska experter</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const IconComponent = getTypeIcon(template.type);
          const colorClasses = getTypeColor(template.type);
          
          return (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => previewTemplate(template)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Förhandsgranska"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {template.name}
              </h4>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {template.description}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center text-xs text-gray-500">
                  <FileText className="w-4 h-4 mr-2" />
                  {template.clauses.length} klausuler
                </div>
                
                <div className="flex items-center text-xs text-gray-500">
                  <Edit3 className="w-4 h-4 mr-2" />
                  {template.customFields.length} anpassningsbara fält
                </div>
                
                <div className="flex items-center text-xs text-gray-500">
                  <Shield className="w-4 h-4 mr-2" />
                  Juridiskt granskad
                </div>
              </div>
              
              <button
                onClick={() => handleSelectTemplate(template)}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Använd denna mall
              </button>
            </div>
          );
        })}
      </div>

      {/* Custom Template Option */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Skapa anpassat avtal</h4>
          <p className="text-gray-600 text-sm mb-4">
            Behöver du ett avtal som inte finns i våra mallar? Skapa ditt eget från grunden.
          </p>
          <button
            onClick={() => handleSelectTemplate({
              id: 'custom',
              name: 'Anpassat avtal',
              description: 'Skapa ditt eget avtal från grunden',
              type: contractType || 'business_purchase',
              clauses: [],
              customFields: []
            })}
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
          >
            Skapa anpassat avtal
          </button>
        </div>
      </div>

      {/* Template Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedTemplate.name}</h3>
                  <p className="text-gray-600 mt-1">{selectedTemplate.description}</p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Avtalsklausuler</h4>
                  <div className="space-y-4">
                    {selectedTemplate.clauses.map((clause) => (
                      <div key={clause.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{clause.title}</h5>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              clause.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {clause.required ? 'Obligatorisk' : 'Valfri'}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {clause.category}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm whitespace-pre-line">{clause.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedTemplate.customFields.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Anpassningsbara fält</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedTemplate.customFields.map((field) => (
                        <div key={field.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{field.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                {field.type}
                              </span>
                              {field.required && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                                  Obligatorisk
                                </span>
                              )}
                            </div>
                          </div>
                          {field.options && (
                            <div className="mt-2 text-xs text-gray-500">
                              Alternativ: {field.options.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Stäng
                </button>
                <button
                  onClick={() => {
                    handleSelectTemplate(selectedTemplate);
                    setShowPreview(false);
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Använd denna mall
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};