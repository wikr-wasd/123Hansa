import React, { useState, useEffect } from 'react';
import { paymentService, PaymentMethodInfo } from '../../services/paymentService';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface PaymentMethodSelectorProps {
  selectedMethod: string | null;
  onMethodSelect: (method: string) => void;
  amount: number;
  currency: string;
  userCountry?: string;
  disabled?: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodSelect,
  amount,
  currency,
  userCountry = 'SE',
  disabled = false,
}) => {
  const [availableMethods, setAvailableMethods] = useState<PaymentMethodInfo[]>([]);
  const [methodFees, setMethodFees] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAvailableMethods();
  }, [userCountry, currency]);

  useEffect(() => {
    if (availableMethods.length > 0 && amount > 0) {
      loadPaymentFees();
    }
  }, [availableMethods, amount, currency]);

  const loadAvailableMethods = async () => {
    try {
      setIsLoading(true);
      const methods = paymentService.getAvailablePaymentMethods(userCountry);
      
      // Filter methods that support the current currency
      const supportedMethods = methods.filter(method => 
        method.currencies.includes(currency)
      );
      
      setAvailableMethods(supportedMethods);
      
      // Auto-select first available method if none selected
      if (!selectedMethod && supportedMethods.length > 0) {
        onMethodSelect(supportedMethods[0].id);
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentFees = async () => {
    const fees: Record<string, any> = {};
    
    for (const method of availableMethods) {
      try {
        const feeInfo = await paymentService.calculatePaymentFees(
          amount,
          method.id,
          currency
        );
        fees[method.id] = feeInfo;
      } catch (error) {
        console.error(`Failed to calculate fees for ${method.id}:`, error);
        fees[method.id] = { baseAmount: amount, feeAmount: 0, totalAmount: amount };
      }
    }
    
    setMethodFees(fees);
  };

  const handleMethodSelect = (methodId: string) => {
    if (disabled) return;
    onMethodSelect(methodId);
  };

  if (isLoading) {
    return (
      <div className=\"flex items-center justify-center py-8\">
        <LoadingSpinner size=\"md\" />
        <span className=\"ml-2 text-nordic-gray-600\">Laddar betalningsmetoder...</span>
      </div>
    );
  }

  if (availableMethods.length === 0) {
    return (
      <div className=\"text-center py-8\">
        <div className=\"text-nordic-gray-400 mb-2\">🚫</div>
        <p className=\"text-nordic-gray-600\">
          Inga betalningsmetoder tillgängliga för {currency}
        </p>
      </div>
    );
  }

  return (
    <div className=\"space-y-3\">
      <h3 className=\"text-lg font-semibold text-nordic-gray-900 mb-4\">
        Välj betalningsmetod
      </h3>
      
      {availableMethods.map((method) => {
        const isSelected = selectedMethod === method.id;
        const fees = methodFees[method.id];
        
        return (
          <div
            key={method.id}
            onClick={() => handleMethodSelect(method.id)}
            className={`
              relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
              ${isSelected 
                ? 'border-nordic-blue-500 bg-nordic-blue-50' 
                : 'border-nordic-gray-200 hover:border-nordic-gray-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {/* Selection indicator */}
            <div className={`
              absolute top-4 right-4 w-5 h-5 rounded-full border-2 transition-all
              ${isSelected 
                ? 'border-nordic-blue-500 bg-nordic-blue-500' 
                : 'border-nordic-gray-300'
              }
            `}>
              {isSelected && (
                <div className=\"w-full h-full flex items-center justify-center\">
                  <div className=\"w-2 h-2 bg-white rounded-full\"></div>
                </div>
              )}
            </div>

            <div className=\"flex items-start space-x-4 pr-8\">
              {/* Method icon */}
              <div className=\"text-2xl\">{method.icon}</div>
              
              {/* Method details */}
              <div className=\"flex-1\">
                <div className=\"flex items-center space-x-2 mb-1\">
                  <h4 className=\"font-semibold text-nordic-gray-900\">
                    {method.name}
                  </h4>
                  {method.type === 'mobile' && (
                    <span className=\"text-xs bg-nordic-green-100 text-nordic-green-800 px-2 py-1 rounded-full\">
                      Mobil
                    </span>
                  )}
                </div>
                
                <p className=\"text-sm text-nordic-gray-600 mb-2\">
                  {method.description}
                </p>
                
                {/* Fee information */}
                {fees && (
                  <div className=\"text-sm\">
                    <div className=\"flex justify-between items-center text-nordic-gray-700\">
                      <span>Belopp:</span>
                      <span>{paymentService.formatCurrency(fees.baseAmount, currency)}</span>
                    </div>
                    {fees.feeAmount > 0 && (
                      <div className=\"flex justify-between items-center text-nordic-gray-600\">
                        <span>Avgift:</span>
                        <span>{paymentService.formatCurrency(fees.feeAmount, currency)}</span>
                      </div>
                    )}
                    <div className=\"flex justify-between items-center font-semibold text-nordic-gray-900 border-t pt-1 mt-1\">
                      <span>Totalt:</span>
                      <span>{paymentService.formatCurrency(fees.totalAmount, currency)}</span>
                    </div>
                  </div>
                )}
                
                {/* Setup required indicator */}
                {method.requiresSetup && (
                  <div className=\"mt-2 text-xs text-nordic-orange-600 bg-nordic-orange-50 px-2 py-1 rounded\">
                    ⚠️ Kräver konfiguration
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Payment security note */}
      <div className=\"mt-6 p-3 bg-nordic-gray-50 rounded-lg\">
        <div className=\"flex items-start space-x-2\">
          <div className=\"text-nordic-green-600 mt-0.5\">🔒</div>
          <div className=\"text-sm text-nordic-gray-700\">
            <p className=\"font-medium mb-1\">Säker betalning</p>
            <p>
              Alla betalningar krypteras och skyddas enligt PCI DSS-standarder. 
              Dina kortuppgifter lagras aldrig på våra servrar.
            </p>
          </div>
        </div>
      </div>
      
      {/* 3D Secure note for card payments */}
      {selectedMethod === 'STRIPE_CARD' && (
        <div className=\"mt-3 p-3 bg-nordic-blue-50 rounded-lg\">
          <div className=\"flex items-start space-x-2\">
            <div className=\"text-nordic-blue-600 mt-0.5\">🛡️</div>
            <div className=\"text-sm text-nordic-blue-800\">
              <p className=\"font-medium mb-1\">3D Secure autentisering</p>
              <p>
                Du kan behöva bekräfta betalningen med din banks app eller SMS-kod 
                för extra säkerhet.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;