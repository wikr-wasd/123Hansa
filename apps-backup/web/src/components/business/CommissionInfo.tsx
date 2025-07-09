import React from 'react';
import { Calculator, Heart, Shield, CheckCircle } from 'lucide-react';

interface CommissionInfoProps {
  salePrice: number;
  className?: string;
}

const CommissionInfo: React.FC<CommissionInfoProps> = ({ salePrice, className = '' }) => {
  const commissionRate = 0.03; // 3%
  const commission = salePrice * commissionRate;
  const sellerReceives = salePrice - commission;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <Calculator className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Mäklararvode & Villkor</h3>
      </div>

      <div className="space-y-4">
        {/* Commission Breakdown */}
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Försäljningspris</div>
              <div className="text-xl font-bold text-gray-900">{formatPrice(salePrice)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Mäklararvode (3%)</div>
              <div className="text-lg font-bold text-red-600">-{formatPrice(commission)}</div>
            </div>
            <div className="text-center border-t pt-3">
              <div className="text-sm text-gray-600 mb-1">Du får</div>
              <div className="text-xl font-bold text-green-600">{formatPrice(sellerReceives)}</div>
            </div>
          </div>
        </div>

        {/* Heart Integration */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Heart className="w-5 h-5 text-purple-600 mr-2" />
            <h4 className="font-semibold text-purple-900">Säkra Avtal med Heart</h4>
          </div>
          <p className="text-sm text-purple-800 mb-3">
            Alla avtal hanteras via vår partner-app <strong>Heart</strong> för maximal säkerhet och transparens.
          </p>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-purple-700">
              <CheckCircle className="w-4 h-4 mr-2 text-purple-600" />
              Digital signering med juridisk giltighet
            </div>
            <div className="flex items-center text-sm text-purple-700">
              <CheckCircle className="w-4 h-4 mr-2 text-purple-600" />
              Automatisk escrow-hantering
            </div>
            <div className="flex items-center text-sm text-purple-700">
              <CheckCircle className="w-4 h-4 mr-2 text-purple-600" />
              Realtidsuppföljning av avtalsprocess
            </div>
          </div>
        </div>

        {/* Service Information */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Shield className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="font-semibold text-green-900">Vad ingår i mäklartjänsten</h4>
          </div>
          <div className="space-y-2 text-sm text-green-800">
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
              <span>Professionell marknadsföring</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
              <span>Kvalificering av köpare</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
              <span>Förhandlingshjälp</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
              <span>Juridisk support</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
              <span>Due diligence-assistance</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
              <span>Heart avtalsstöd</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-4">
          <p>
            * Mäklararvode på 3% tas ut vid genomförd transaktion. Inga dolda avgifter. 
            Juridiska kostnader kan tillkomma beroende på affärens komplexitet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommissionInfo;