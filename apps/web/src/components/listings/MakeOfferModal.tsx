import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  FileText, 
  CheckCircle,
  AlertTriangle,
  Info,
  Calculator,
  Gavel,
  HandHeart,
  AlertCircle
} from 'lucide-react';
import { BusinessListing } from '../../types/business';

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: BusinessListing;
  currentUser?: {
    id: string;
    name: string;
    email: string;
  };
}

const MakeOfferModal: React.FC<MakeOfferModalProps> = ({
  isOpen,
  onClose,
  listing,
  currentUser,
}) => {
  const [formData, setFormData] = useState({
    offerAmount: '',
    message: '',
    conditions: [] as string[],
    financingDetails: '',
    closingTimeframe: '60',
    earnestMoney: '',
    contingencies: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showValuation, setShowValuation] = useState(false);

  const availableConditions = [
    { id: 'due_diligence', label: 'Due diligence-granskning (30 dagar)', recommended: true },
    { id: 'financing', label: 'Förbehåll för finansiering', recommended: true },
    { id: 'key_employees', label: 'Nyckelpersoner stannar kvar (6 månader)', recommended: false },
    { id: 'non_compete', label: 'Konkurrensklausul för säljare (2 år)', recommended: false },
    { id: 'inventory_review', label: 'Lagervärdering vid övergång', recommended: false },
    { id: 'lease_assignment', label: 'Överlåtelse av lokalhyresavtal', recommended: false },
  ];

  const availableContingencies = [
    { id: 'accounting_review', label: 'Granskning av bokföring och ekonomi' },
    { id: 'legal_review', label: 'Juridisk granskning av kontrakt' },
    { id: 'operational_review', label: 'Operationell due diligence' },
    { id: 'environmental', label: 'Miljöutredning (om tillämpligt)' },
    { id: 'permits_licenses', label: 'Kontroll av tillstånd och licenser' },
    { id: 'customer_contracts', label: 'Verifiering av kundkontrakt' },
  ];

  const timeframes = [
    { value: '30', label: '30 dagar (snabbt avslut)' },
    { value: '45', label: '45 dagar (standard)' },
    { value: '60', label: '60 dagar (rekommenderat)' },
    { value: '90', label: '90 dagar (omfattande DD)' },
    { value: 'custom', label: 'Anpassad tidsram' },
  ];

  useEffect(() => {
    if (listing.price.type === 'NEGOTIABLE') {
      // Start with 85% of asking price for negotiable listings
      const suggestedOffer = Math.round(listing.price.amount * 0.85);
      setFormData(prev => ({ ...prev, offerAmount: suggestedOffer.toString() }));
    }
  }, [listing]);

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('sv-SE') + ' SEK';
  };

  const getOfferAnalysis = () => {
    const offerAmount = Number(formData.offerAmount);
    const askingPrice = listing.price.amount;
    
    if (!offerAmount || offerAmount <= 0) return null;

    const percentage = (offerAmount / askingPrice) * 100;
    let analysis = '';
    let color = '';

    if (percentage >= 95) {
      analysis = 'Mycket konkurrenskraftigt bud - hög sannolikhet för acceptans';
      color = 'text-green-600';
    } else if (percentage >= 85) {
      analysis = 'Starkt bud - god chans för acceptans eller motbud';
      color = 'text-blue-600';
    } else if (percentage >= 75) {
      analysis = 'Rimligt bud - kan leda till förhandlingar';
      color = 'text-yellow-600';
    } else if (percentage >= 65) {
      analysis = 'Lågt bud - förhandlingar krävs troligen';
      color = 'text-orange-600';
    } else {
      analysis = 'Mycket lågt bud - låg sannolikhet för acceptans';
      color = 'text-red-600';
    }

    return { percentage, analysis, color };
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleConditionToggle = (conditionId: string) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.includes(conditionId)
        ? prev.conditions.filter(id => id !== conditionId)
        : [...prev.conditions, conditionId]
    }));
  };

  const handleContingencyToggle = (contingencyId: string) => {
    setFormData(prev => ({
      ...prev,
      contingencies: prev.contingencies.includes(contingencyId)
        ? prev.contingencies.filter(id => id !== contingencyId)
        : [...prev.contingencies, contingencyId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      const offerAmount = Number(formData.offerAmount);
      if (!offerAmount || offerAmount <= 0) {
        throw new Error('Budbelopp är obligatoriskt och måste vara större än 0');
      }

      if (offerAmount < listing.price.amount * 0.5) {
        throw new Error('Budet är för lågt. Minimum 50% av utropspriset krävs.');
      }

      if (!formData.message.trim()) {
        throw new Error('Meddelande till säljare är obligatoriskt');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock success
      console.log('Offer submitted:', {
        listingId: listing.id,
        sellerId: listing.sellerId,
        buyerId: currentUser?.id,
        ...formData,
        offerAmount: offerAmount,
        submittedAt: new Date(),
      });

      setSubmitSuccess(true);

      // Auto-close after success
      setTimeout(() => {
        onClose();
        setSubmitSuccess(false);
        setFormData({
          offerAmount: '',
          message: '',
          conditions: [],
          financingDetails: '',
          closingTimeframe: '60',
          earnestMoney: '',
          contingencies: [],
        });
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett oväntat fel inträffade');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Bud skickat!</h3>
              <p className="text-gray-600">
                Ditt bud på <strong>{formatCurrency(Number(formData.offerAmount))}</strong> har skickats till säljaren.
              </p>
              <p className="text-sm text-gray-500">
                Du kommer att få en bekräftelse via e-post och kan följa budets status i din profil.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const offerAnalysis = getOfferAnalysis();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel className="w-5 h-5" />
            Lägg bud på "{listing.title}"
          </DialogTitle>
          <DialogDescription>
            Skapa ett professionellt bud med villkor och tidsram
          </DialogDescription>
        </DialogHeader>

        {/* Listing summary */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{listing.title}</h4>
                <p className="text-sm text-gray-600">{listing.location.city}, {listing.location.region}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{formatCurrency(listing.price.amount)}</div>
                <Badge variant={listing.price.type === 'FIXED' ? 'default' : 'secondary'}>
                  {listing.price.type === 'FIXED' ? 'Fast pris' : 'Förhandlingsbart'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column - Offer details */}
            <div className="space-y-6">
              {/* Offer amount */}
              <div className="space-y-2">
                <Label htmlFor="offerAmount">Budbelopp (SEK) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="offerAmount"
                    type="number"
                    placeholder="8500000"
                    value={formData.offerAmount}
                    onChange={(e) => handleInputChange('offerAmount', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                {offerAnalysis && (
                  <div className={`text-sm ${offerAnalysis.color}`}>
                    {offerAnalysis.percentage.toFixed(0)}% av utropspris - {offerAnalysis.analysis}
                  </div>
                )}
              </div>

              {/* Earnest money */}
              <div className="space-y-2">
                <Label htmlFor="earnestMoney">Handpenning (SEK)</Label>
                <Input
                  id="earnestMoney"
                  type="number"
                  placeholder="500000"
                  value={formData.earnestMoney}
                  onChange={(e) => handleInputChange('earnestMoney', e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Vanligtvis 5-10% av budbeloppet. Betalas vid signering av köpeavtal.
                </p>
              </div>

              {/* Closing timeframe */}
              <div className="space-y-2">
                <Label>Tidsram för avslut</Label>
                <div className="space-y-2">
                  {timeframes.map(timeframe => (
                    <div key={timeframe.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`timeframe-${timeframe.value}`}
                        name="closingTimeframe"
                        value={timeframe.value}
                        checked={formData.closingTimeframe === timeframe.value}
                        onChange={(e) => handleInputChange('closingTimeframe', e.target.value)}
                        className="text-blue-600"
                      />
                      <label htmlFor={`timeframe-${timeframe.value}`} className="text-sm">
                        {timeframe.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financing details */}
              <div className="space-y-2">
                <Label htmlFor="financingDetails">Finansieringsdetaljer</Label>
                <Textarea
                  id="financingDetails"
                  placeholder="Beskriv hur du planerar att finansiera köpet (eget kapital, banklån, etc.)"
                  value={formData.financingDetails}
                  onChange={(e) => handleInputChange('financingDetails', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Right column - Conditions and contingencies */}
            <div className="space-y-6">
              {/* Conditions */}
              <div className="space-y-3">
                <Label>Villkor och förbehåll</Label>
                <div className="space-y-2">
                  {availableConditions.map(condition => (
                    <div key={condition.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={condition.id}
                        checked={formData.conditions.includes(condition.id)}
                        onCheckedChange={() => handleConditionToggle(condition.id)}
                      />
                      <div className="flex-1">
                        <label htmlFor={condition.id} className="text-sm font-medium leading-tight">
                          {condition.label}
                          {condition.recommended && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Rekommenderat
                            </Badge>
                          )}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Due diligence contingencies */}
              <div className="space-y-3">
                <Label>Due diligence-områden</Label>
                <div className="space-y-2">
                  {availableContingencies.map(contingency => (
                    <div key={contingency.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={contingency.id}
                        checked={formData.contingencies.includes(contingency.id)}
                        onCheckedChange={() => handleContingencyToggle(contingency.id)}
                      />
                      <label htmlFor={contingency.id} className="text-sm leading-tight">
                        {contingency.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Message to seller */}
          <div className="space-y-2">
            <Label htmlFor="message">Meddelande till säljare *</Label>
            <Textarea
              id="message"
              placeholder="Beskriv din bakgrund, varför du är intresserad av företaget och dina planer för verksamheten..."
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={5}
              required
            />
            <p className="text-xs text-gray-500">
              Ett personligt meddelande ökar chanserna för att ditt bud accepteras.
            </p>
          </div>

          {/* Important notices */}
          <div className="space-y-3">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Juridisk rådgivning:</strong> Vi rekommenderar starkt att du konsulterar en jurist innan du lägger ett bindande bud på ett företag.
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Bindande bud:</strong> När ditt bud accepteras av säljaren blir det ett juridiskt bindande avtal. Se till att du är beredd att genomföra köpet.
              </AlertDescription>
            </Alert>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Avbryt
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => setShowValuation(!showValuation)}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Värderingshjälp
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Skickar bud...
                </>
              ) : (
                <>
                  <HandHeart className="w-4 h-4 mr-2" />
                  Skicka bud
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MakeOfferModal;