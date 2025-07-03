import React, { useState } from 'react';
import { 
  Send, 
  X, 
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  User,
  Star,
  Calendar
} from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  wouldRecommend: boolean;
  tags: string[];
  createdAt: string;
  client: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  booking?: {
    serviceType: string;
    completedAt: string;
  };
}

interface ReviewResponseProps {
  review: Review;
  onSubmit: (response: string) => void;
  onClose: () => void;
  existingResponse?: string;
}

const RESPONSE_TEMPLATES = [
  {
    title: "Tack för positiv feedback",
    content: "Tack så mycket för dina vänliga ord! Det var en glädje att arbeta med dig och jag är glad att du är nöjd med resultatet. Tveka inte att höra av dig igen om du behöver mer hjälp."
  },
  {
    title: "Tacksam för konstruktiv feedback",
    content: "Tack för din ärliga feedback. Jag uppskattar att du tog dig tid att dela din upplevelse. Din feedback hjälper mig att förbättra mina tjänster och jag ser fram emot att leverera ännu bättre resultat i framtiden."
  },
  {
    title: "Adressera bekymmer",
    content: "Tack för din feedback. Jag beklagar att din upplevelse inte motsvarade dina förväntningar. Jag tar dina synpunkter på allvar och kommer att använda dem för att förbättra mina tjänster. Kontakta mig gärna direkt om du vill diskutera detta vidare."
  },
  {
    title: "Allmän respons",
    content: "Tack för att du tog dig tid att lämna en recension. Din feedback är värdefull för mig och hjälper mig att förbättra mina tjänster kontinuerligt. Jag ser fram emot möjligheten att arbeta tillsammans igen."
  }
];

export const ReviewResponse: React.FC<ReviewResponseProps> = ({
  review,
  onSubmit,
  onClose,
  existingResponse
}) => {
  const [response, setResponse] = useState(existingResponse || '');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(!existingResponse);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const useTemplate = (templateIndex: number) => {
    setResponse(RESPONSE_TEMPLATES[templateIndex].content);
    setSelectedTemplate(templateIndex);
    setShowTemplates(false);
    setErrors({});
  };

  const validateResponse = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!response.trim()) {
      newErrors.response = 'Skriv ett svar till recensionen';
    } else if (response.length < 10) {
      newErrors.response = 'Svaret måste vara minst 10 tecken';
    } else if (response.length > 1000) {
      newErrors.response = 'Svaret får inte vara längre än 1000 tecken';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateResponse()) return;

    try {
      setLoading(true);
      await onSubmit(response);
    } catch (error) {
      console.error('Error submitting response:', error);
      setErrors({ submit: 'Kunde inte skicka svaret. Försök igen.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {existingResponse ? 'Redigera svar' : 'Svara på recension'}
            </h2>
            <p className="text-sm text-gray-600">
              Visa professionalism genom att svara på kundens feedback
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Review Display */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-start gap-4">
            {review.client.avatar ? (
              <img
                src={review.client.avatar}
                alt={`${review.client.firstName} ${review.client.lastName}`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {review.client.firstName} {review.client.lastName}
                  </span>
                  {renderStars(review.rating)}
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(review.createdAt)}
                </span>
              </div>
              
              {review.title && (
                <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
              )}
              
              <p className="text-gray-700 text-sm leading-relaxed mb-2">
                {review.comment}
              </p>
              
              {review.wouldRecommend && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600">Rekommenderar</span>
                </div>
              )}
              
              {review.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {review.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Response Templates */}
          {showTemplates && !existingResponse && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Välj en mall eller skriv eget svar
              </h4>
              <div className="space-y-2">
                {RESPONSE_TEMPLATES.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => useTemplate(index)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <p className="font-medium text-gray-900 text-sm mb-1">
                      {template.title}
                    </p>
                    <p className="text-gray-600 text-xs line-clamp-2">
                      {template.content}
                    </p>
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="text-sm text-gray-500">eller</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>
            </div>
          )}

          {/* Response Text Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Ditt svar
              </label>
              {showTemplates && response && (
                <button
                  onClick={() => setShowTemplates(true)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Visa mallar igen
                </button>
              )}
            </div>
            <textarea
              value={response}
              onChange={(e) => {
                setResponse(e.target.value);
                if (errors.response) {
                  setErrors(prev => ({ ...prev, response: '' }));
                }
              }}
              rows={6}
              placeholder="Skriv ett professionellt och trevligt svar till kundens recension..."
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.response ? 'border-red-300' : 'border-gray-300'
              }`}
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1">
              <div>
                {errors.response && (
                  <p className="text-sm text-red-600">{errors.response}</p>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {response.length}/1000 tecken
              </p>
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  Tips för ett bra svar
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Tacka kunden för deras feedback</li>
                  <li>• Var professionell och vänlig i tonen</li>
                  <li>• Adressera specifika punkter som nämnts</li>
                  <li>• Visa att du tar feedback på allvar</li>
                  <li>• Bjud in till fortsatt dialog vid behov</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Warning for negative reviews */}
          {review.rating <= 3 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-orange-800 mb-1">
                    Hantera negativ feedback professionellt
                  </h4>
                  <p className="text-sm text-orange-700">
                    Visa empati, ta ansvar där det är lämpligt, och fokusera på hur du kan förbättra framtida upplevelser.
                  </p>
                </div>
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Avbryt
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading || !response.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Skickar...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {existingResponse ? 'Uppdatera svar' : 'Skicka svar'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};