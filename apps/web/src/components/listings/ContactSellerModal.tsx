import React, { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  MessageCircle, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Verified,
  Star,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { BusinessListing } from '../../types/business';

interface ContactSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: BusinessListing;
  currentUser?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

const ContactSellerModal: React.FC<ContactSellerModalProps> = ({
  isOpen,
  onClose,
  listing,
  currentUser,
}) => {
  const [formData, setFormData] = useState({
    inquiryType: 'GENERAL',
    message: '',
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    company: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inquiryTypes = [
    { value: 'GENERAL', label: 'Allmän förfrågan', description: 'Allmänna frågor om företaget' },
    { value: 'FINANCIAL', label: 'Finansiell information', description: 'Frågor om ekonomi och värdering' },
    { value: 'OPERATIONS', label: 'Verksamhet', description: 'Frågor om drift och processer' },
    { value: 'LEGAL', label: 'Juridiska frågor', description: 'Kontrakt och överlåtelseprocess' },
    { value: 'VIEWING', label: 'Boka visning', description: 'Besök företaget och träffa teamet' },
    { value: 'PARTNERSHIP', label: 'Samarbete', description: 'Partnerskap eller investeringsmöjligheter' },
  ];

  const messageTemplates = {
    GENERAL: `Hej ${listing.seller.name},

Jag är intresserad av ditt företag "${listing.title}" och skulle vilja veta mer om verksamheten.

Kan du berätta mer om:
- Företagets history och utveckling
- Nuvarande marknadssituation
- Framtidsplaner och potential

Tack på förhand!`,

    FINANCIAL: `Hej ${listing.seller.name},

Jag är seriöst intresserad av att förvärva "${listing.title}" och skulle vilja diskutera de finansiella aspekterna.

Skulle det vara möjligt att få tillgång till:
- Detaljerade finansiella rapporter (senaste 3 åren)
- Kassaflödesanalys
- Kundkontrakt och återkommande intäkter
- Värderingsunderlag

Jag är redo att teckna sekretessavtal (NDA) för att få tillgång till känslig information.

Med vänliga hälsningar,`,

    VIEWING: `Hej ${listing.seller.name},

Jag är intresserad av att boka en visning av "${listing.title}" för att få en bättre förståelse av verksamheten.

Skulle det vara möjligt att arrangera ett möte där jag kan:
- Besöka lokalerna
- Träffa nyckelpersoner i teamet
- Se verksamheten i praktiken
- Diskutera övergångsprocessen

Jag är flexibel med tider och kan anpassa mig efter er tillgänglighet.

Tack så mycket!`,
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleInquiryTypeChange = (type: string) => {
    setFormData(prev => ({ 
      ...prev, 
      inquiryType: type,
      message: messageTemplates[type as keyof typeof messageTemplates] || prev.message
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.message.trim()) {
        throw new Error('Meddelande är obligatoriskt');
      }
      if (!formData.name.trim()) {
        throw new Error('Namn är obligatoriskt');
      }
      if (!formData.email.trim()) {
        throw new Error('E-post är obligatorisk');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Ogiltig e-postadress');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock success
      console.log('Contact form submitted:', {
        listingId: listing.id,
        sellerId: listing.sellerId,
        ...formData,
        timestamp: new Date(),
      });

      setSubmitSuccess(true);
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
        setSubmitSuccess(false);
        setFormData({
          inquiryType: 'GENERAL',
          message: '',
          name: currentUser?.name || '',
          email: currentUser?.email || '',
          phone: currentUser?.phone || '',
          company: '',
        });
      }, 2000);

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
              <h3 className="text-lg font-semibold">Meddelande skickat!</h3>
              <p className="text-gray-600">
                Ditt meddelande har skickats till {listing.seller.name}. Du kan förvänta dig ett svar inom {' '}
                <span className="font-medium">24-48 timmar</span>.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Kontakta säljare
          </DialogTitle>
          <DialogDescription>
            Skicka en förfrågan till säljaren av "{listing.title}"
          </DialogDescription>
        </DialogHeader>

        {/* Seller info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${listing.seller.name}&background=random`} />
              <AvatarFallback>{listing.seller.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{listing.seller.name}</h4>
                {listing.seller.verified && (
                  <Verified className="w-4 h-4 text-blue-500" />
                )}
                <Badge variant="outline" className="text-xs">
                  Säljare
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {listing.seller.rating}
                </div>
                <span>•</span>
                <span>{listing.seller.totalTransactions} genomförda affärer</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Inquiry type */}
          <div className="space-y-2">
            <Label htmlFor="inquiryType">Typ av förfrågan</Label>
            <Select value={formData.inquiryType} onValueChange={handleInquiryTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {inquiryTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Meddelande *</Label>
            <Textarea
              id="message"
              placeholder="Skriv ditt meddelande här..."
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={8}
              required
            />
            <div className="text-xs text-gray-500">
              {formData.message.length}/1000 tecken
            </div>
          </div>

          {/* Contact information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Namn *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                disabled={!!currentUser}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-post *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                disabled={!!currentUser}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefonnummer</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+46 70 123 45 67"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Företag/Organisation</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Ditt företag (valfritt)"
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Building className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-medium text-blue-900">Tips för bästa svar</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Var specifik med vad du vill veta</li>
                  <li>• Beskriv din bakgrund och erfarenhet</li>
                  <li>• Ange din tidsram för eventuellt köp</li>
                  <li>• Visa att du är en seriös köpare</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Avbryt
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Skickar...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Skicka meddelande
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactSellerModal;