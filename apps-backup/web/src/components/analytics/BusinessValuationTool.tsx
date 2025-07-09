import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { TrendingUp, Calculator, Target, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ValuationFormData {
  revenue: string;
  ebitda: string;
  assets: string;
  employees: string;
  sector: string;
  location: string;
  yearEstablished: string;
  businessModel: string;
  growthRate: string;
}

interface ValuationResult {
  valuation: {
    estimatedValue: {
      low: number;
      mid: number;
      high: number;
      currency: string;
    };
    confidence: number;
    marketPosition: 'PREMIUM' | 'MARKET' | 'DISCOUNT';
  };
  methodology: {
    methodsUsed: Array<{
      method: string;
      weight: number;
      confidence: number;
    }>;
    primaryMethod: string;
  };
  benchmarks: {
    sector: string;
    sampleSize: number;
    medianRevMultiple: number;
    medianEbitdaMultiple: number;
  };
  comparables: Array<{
    name: string;
    similarity: number;
    valuation: number;
    matchFactors: string[];
  }>;
  factors: Array<{
    factor: string;
    impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    description: string;
  }>;
  recommendations: string[];
}

const BusinessValuationTool: React.FC = () => {
  const [formData, setFormData] = useState<ValuationFormData>({
    revenue: '',
    ebitda: '',
    assets: '',
    employees: '',
    sector: '',
    location: '',
    yearEstablished: '',
    businessModel: 'B2B',
    growthRate: '0',
  });

  const [result, setResult] = useState<ValuationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sectors = [
    'Technology',
    'Manufacturing',
    'Retail',
    'Services',
    'Healthcare',
    'Construction',
    'Finance',
    'Education',
    'Real Estate',
    'Transportation',
  ];

  const swedishCities = [
    'Stockholm',
    'Göteborg',
    'Malmö',
    'Uppsala',
    'Västerås',
    'Örebro',
    'Linköping',
    'Helsingborg',
    'Jönköping',
    'Norrköping',
  ];

  const businessModels = [
    { value: 'B2B', label: 'Business-to-Business (B2B)' },
    { value: 'B2C', label: 'Business-to-Consumer (B2C)' },
    { value: 'B2B2C', label: 'Business-to-Business-to-Consumer (B2B2C)' },
    { value: 'MARKETPLACE', label: 'Marketplace' },
  ];

  const handleInputChange = (field: keyof ValuationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M SEK`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k SEK`;
    } else {
      return `${amount.toLocaleString()} SEK`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.revenue || !formData.sector || !formData.location || !formData.yearEstablished) {
        throw new Error('Vänligen fyll i alla obligatoriska fält');
      }

      if (Number(formData.revenue) <= 0) {
        throw new Error('Omsättning måste vara större än 0');
      }

      const currentYear = new Date().getFullYear();
      if (Number(formData.yearEstablished) < 1900 || Number(formData.yearEstablished) > currentYear) {
        throw new Error('Ange ett giltigt grundningsår');
      }

      // Mock API call - in production, this would call the actual API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay

      // Mock response - in production, replace with actual API call
      const mockResult: ValuationResult = {
        valuation: {
          estimatedValue: {
            low: Math.round(Number(formData.revenue) * 1.5),
            mid: Math.round(Number(formData.revenue) * 2.8),
            high: Math.round(Number(formData.revenue) * 4.2),
            currency: 'SEK',
          },
          confidence: 78,
          marketPosition: 'MARKET',
        },
        methodology: {
          methodsUsed: [
            { method: 'REVENUE_MULTIPLE', weight: 0.4, confidence: 75 },
            { method: 'EBITDA_MULTIPLE', weight: 0.35, confidence: 85 },
            { method: 'MARKET_COMP', weight: 0.25, confidence: 70 },
          ],
          primaryMethod: 'REVENUE_MULTIPLE',
        },
        benchmarks: {
          sector: formData.sector,
          sampleSize: 145,
          medianRevMultiple: 2.8,
          medianEbitdaMultiple: 12.5,
        },
        comparables: [
          {
            name: `${formData.sector} Nordic AB`,
            similarity: 87,
            valuation: Number(formData.revenue) * 3.2,
            matchFactors: ['Same sector', 'Similar size', 'Geographic proximity'],
          },
          {
            name: `Swedish ${formData.sector} Solutions`,
            similarity: 82,
            valuation: Number(formData.revenue) * 2.6,
            matchFactors: ['Same sector', 'Similar revenue', 'Similar business model'],
          },
        ],
        factors: [
          {
            factor: 'Established Business',
            impact: 'POSITIVE',
            description: `${currentYear - Number(formData.yearEstablished)} års verksamhet ger stabilitet`,
          },
          {
            factor: 'Growth Rate',
            impact: Number(formData.growthRate) > 10 ? 'POSITIVE' : 'NEUTRAL',
            description: `${formData.growthRate}% tillväxttakt påverkar värderingen`,
          },
        ],
        recommendations: [
          'Genomför professionell due diligence för exakt värdering',
          'Överväg att förbättra lönsamheten innan försäljning',
          'Dokumentera alla finansiella data för transparent process',
        ],
      };

      setResult(mockResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett oväntat fel inträffade');
    } finally {
      setLoading(false);
    }
  };

  const getMarketPositionColor = (position: string) => {
    switch (position) {
      case 'PREMIUM': return 'bg-green-100 text-green-800';
      case 'DISCOUNT': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'POSITIVE': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'NEGATIVE': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Företagsvärderingsverktyg
          </CardTitle>
          <p className="text-sm text-gray-600">
            Få en preliminär värdering av ditt företag baserat på marknadsjämförelser
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Revenue */}
              <div className="space-y-2">
                <Label htmlFor="revenue">Årsomsättning (SEK) *</Label>
                <Input
                  id="revenue"
                  type="number"
                  placeholder="5000000"
                  value={formData.revenue}
                  onChange={(e) => handleInputChange('revenue', e.target.value)}
                  required
                />
              </div>

              {/* EBITDA */}
              <div className="space-y-2">
                <Label htmlFor="ebitda">EBITDA (SEK)</Label>
                <Input
                  id="ebitda"
                  type="number"
                  placeholder="1000000"
                  value={formData.ebitda}
                  onChange={(e) => handleInputChange('ebitda', e.target.value)}
                />
              </div>

              {/* Sector */}
              <div className="space-y-2">
                <Label htmlFor="sector">Bransch *</Label>
                <Select value={formData.sector} onValueChange={(value) => handleInputChange('sector', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Välj bransch" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Ort *</Label>
                <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Välj ort" />
                  </SelectTrigger>
                  <SelectContent>
                    {swedishCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Employees */}
              <div className="space-y-2">
                <Label htmlFor="employees">Antal anställda</Label>
                <Input
                  id="employees"
                  type="number"
                  placeholder="25"
                  value={formData.employees}
                  onChange={(e) => handleInputChange('employees', e.target.value)}
                />
              </div>

              {/* Year Established */}
              <div className="space-y-2">
                <Label htmlFor="yearEstablished">Grundningsår *</Label>
                <Input
                  id="yearEstablished"
                  type="number"
                  placeholder="2010"
                  value={formData.yearEstablished}
                  onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                  required
                />
              </div>

              {/* Assets */}
              <div className="space-y-2">
                <Label htmlFor="assets">Tillgångar (SEK)</Label>
                <Input
                  id="assets"
                  type="number"
                  placeholder="2000000"
                  value={formData.assets}
                  onChange={(e) => handleInputChange('assets', e.target.value)}
                />
              </div>

              {/* Growth Rate */}
              <div className="space-y-2">
                <Label htmlFor="growthRate">Tillväxttakt (%)</Label>
                <Input
                  id="growthRate"
                  type="number"
                  placeholder="15"
                  value={formData.growthRate}
                  onChange={(e) => handleInputChange('growthRate', e.target.value)}
                />
              </div>
            </div>

            {/* Business Model */}
            <div className="space-y-2">
              <Label htmlFor="businessModel">Affärsmodell</Label>
              <Select value={formData.businessModel} onValueChange={(value) => handleInputChange('businessModel', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {businessModels.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Beräknar värdering...' : 'Beräkna värdering'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Valuation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Värderingsresultat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Lägsta värdering</p>
                  <p className="text-xl font-bold">{formatCurrency(result.valuation.estimatedValue.low)}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <p className="text-sm text-gray-600">Förväntad värdering</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(result.valuation.estimatedValue.mid)}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Högsta värdering</p>
                  <p className="text-xl font-bold">{formatCurrency(result.valuation.estimatedValue.high)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Tillförlitlighet:</span>
                  <Badge variant="outline">{result.valuation.confidence}%</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Marknadsposition:</span>
                  <Badge className={getMarketPositionColor(result.valuation.marketPosition)}>
                    {result.valuation.marketPosition === 'PREMIUM' ? 'Premium' : 
                     result.valuation.marketPosition === 'DISCOUNT' ? 'Rabatt' : 'Marknad'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Methodology */}
          <Card>
            <CardHeader>
              <CardTitle>Värderingsmetodik</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.methodology.methodsUsed.map((method, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {method.method === 'REVENUE_MULTIPLE' ? 'Omsättningsmultipel' :
                         method.method === 'EBITDA_MULTIPLE' ? 'EBITDA-multipel' :
                         method.method === 'MARKET_COMP' ? 'Marknadsjämförelse' :
                         method.method}
                      </p>
                      <p className="text-sm text-gray-600">Vikt: {Math.round(method.weight * 100)}%</p>
                    </div>
                    <Badge variant="outline">{method.confidence}% tillförlitlighet</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Benchmarks */}
          <Card>
            <CardHeader>
              <CardTitle>Marknadsjämförelser</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Branschdata</p>
                  <p className="font-medium">{result.benchmarks.sector} ({result.benchmarks.sampleSize} företag)</p>
                  <p className="text-sm">Median omsättningsmultipel: {result.benchmarks.medianRevMultiple}x</p>
                  <p className="text-sm">Median EBITDA-multipel: {result.benchmarks.medianEbitdaMultiple}x</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Jämförbara företag</p>
                  {result.comparables.slice(0, 2).map((comp, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded">
                      <p className="font-medium text-sm">{comp.name}</p>
                      <p className="text-xs text-gray-600">
                        {comp.similarity}% matchning • {formatCurrency(comp.valuation)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Valuation Factors */}
          <Card>
            <CardHeader>
              <CardTitle>Värderingsfaktorer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.factors.map((factor, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    {getImpactIcon(factor.impact)}
                    <div className="flex-1">
                      <p className="font-medium">{factor.factor}</p>
                      <p className="text-sm text-gray-600">{factor.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Rekommendationer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Viktigt:</strong> Denna värdering är en preliminär uppskattning baserad på marknadsjämförelser. 
              För transaktioner rekommenderas professionell värderingsexpertis och due diligence.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default BusinessValuationTool;