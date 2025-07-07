import React, { useState } from 'react';
import { X, Mail, Phone, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'email' | 'phone';
  newValue: string;
  onVerificationComplete: (verified: boolean) => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  type,
  newValue,
  onVerificationComplete
}) => {
  const [step, setStep] = useState<'send' | 'verify' | 'completed'>('send');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  if (!isOpen) return null;

  const handleSendCode = async () => {
    setLoading(true);
    try {
      // Simulate API call to send verification code
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, we'll show the verification code
      const demoCode = Math.floor(100000 + Math.random() * 900000).toString();
      toast.success(`Verifieringskod skickad! Demo-kod: ${demoCode}`);
      
      setStep('verify');
      
      // Start countdown
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      toast.error('Kunde inte skicka verifieringskod');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    try {
      // Simulate API call to verify code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, accept any 6-digit code
      if (verificationCode.length === 6) {
        setStep('completed');
        toast.success(`${type === 'email' ? 'E-post' : 'Telefonnummer'} verifierad!`);
        setTimeout(() => {
          onVerificationComplete(true);
          onClose();
        }, 2000);
      } else {
        toast.error('Ogiltig verifieringskod');
      }
    } catch (error) {
      toast.error('Verifiering misslyckades');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              {type === 'email' ? (
                <Mail className="w-5 h-5 text-blue-600" />
              ) : (
                <Phone className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Verifiera {type === 'email' ? 'E-post' : 'Telefonnummer'}
              </h2>
              <p className="text-sm text-gray-600">{newValue}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {step === 'send' && (
          <div className="space-y-4">
            <div className="text-center">
              <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">
                Vi kommer att skicka en verifieringskod till ditt nya{' '}
                {type === 'email' ? 'e-postadress' : 'telefonnummer'} för att bekräfta ändringen.
              </p>
            </div>
            
            <button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Skickar...' : `Skicka verifieringskod`}
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Ange den 6-siffriga kod vi skickade till {newValue}
              </p>
              {timeLeft > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Kod upphör om {formatTime(timeLeft)}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verifieringskod
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                maxLength={6}
              />
            </div>
            
            <button
              onClick={handleVerifyCode}
              disabled={loading || verificationCode.length !== 6}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifierar...' : 'Verifiera kod'}
            </button>
            
            <button
              onClick={handleSendCode}
              disabled={timeLeft > 0 || loading}
              className="w-full text-blue-600 hover:text-blue-700 py-2 text-sm"
            >
              {timeLeft > 0 ? `Skicka ny kod om ${formatTime(timeLeft)}` : 'Skicka ny kod'}
            </button>
          </div>
        )}

        {step === 'completed' && (
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">Verifiering lyckades!</h3>
            <p className="text-gray-600">
              Ditt {type === 'email' ? 'e-postadress' : 'telefonnummer'} har verifierats framgångsrikt.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationModal;