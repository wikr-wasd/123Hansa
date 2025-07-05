import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Users,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const HelpPage: React.FC = () => {
  const faqs = [
    {
      question: "Hur säljer jag mitt företag på 123Hansa?",
      answer: "Det är enkelt! Skapa ett konto, klicka på 'Skapa annons' och fyll i information om ditt företag. Vi granskar din annons inom 24 timmar och publicerar den när den är godkänd."
    },
    {
      question: "Vilka avgifter tar 123Hansa?",
      answer: "Vi tar 3% provision vid genomförd affär. Inga avgifter för att lista ditt företag eller för att visa intresse som köpare."
    },
    {
      question: "Hur verifierar ni säljare?",
      answer: "Alla säljare genomgår verifiering via dokument och bankuppgifter. Vi kontrollerar även företagsinformation mot offentliga register."
    },
    {
      question: "Kan jag ångra mig efter att jag visat intresse?",
      answer: "Ja, att visa intresse är inte juridiskt bindande. Det är först när ni tecknar köpeavtal som affären blir bindande."
    },
    {
      question: "Hur länge tar en företagsförsäljning?",
      answer: "I genomsnitt tar det 45 dagar från publicering till genomförd affär på 123Hansa. Detta beror på företagets storlek och komplexitet."
    },
    {
      question: "Vilken support får jag som säljare?",
      answer: "Du får tillgång till våra M&A-experter som hjälper dig med värdering, due diligence och juridisk rådgivning genom hela processen."
    }
  ];

  const supportChannels = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chatta direkt med vårt supportteam",
      action: "Starta chat",
      available: "Mån-Fre 08:00-18:00"
    },
    {
      icon: Phone,
      title: "Telefonsupport",
      description: "Ring oss för snabb hjälp",
      action: "+46 8 123 456 78",
      available: "Mån-Fre 08:00-17:00"
    },
    {
      icon: Mail,
      title: "E-post",
      description: "Skicka oss dina frågor",
      action: "support@123hansa.se",
      available: "Svarar inom 4 timmar"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Hjälp & Support - 123Hansa</title>
        <meta name="description" content="Få hjälp med att köpa eller sälja företag på 123Hansa. FAQ, guides och direktsupport." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Hjälp & Support
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Vi hjälper dig att navigera genom företagsköp och försäljningar. 
                Hitta svar på vanliga frågor eller kontakta vårt expertteam.
              </p>
            </div>
          </div>
        </div>

        {/* Support Channels */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Kontakta oss
            </h2>
            <p className="text-lg text-gray-600">
              Välj det sätt som passar dig bäst
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {supportChannels.map((channel, index) => {
              const IconComponent = channel.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{channel.title}</h3>
                  <p className="text-gray-600 mb-4">{channel.description}</p>
                  <div className="text-lg font-semibold text-blue-600 mb-2">{channel.action}</div>
                  <div className="text-sm text-gray-500">{channel.available}</div>
                </div>
              );
            })}
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Vanliga frågor
            </h2>
            
            <div className="space-y-8">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed ml-8">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link 
              to="/listings" 
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Bläddra företag</h3>
                  <p className="text-sm text-gray-600">Se alla tillgängliga företag</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </Link>

            <Link 
              to="/create-listing" 
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Sälj ditt företag</h3>
                  <p className="text-sm text-gray-600">Skapa en annons</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </Link>

            <Link 
              to="/professional-services" 
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Hitta experter</h3>
                  <p className="text-sm text-gray-600">M&A-rådgivning</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </Link>

            <Link 
              to="/sales-demo" 
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Framgångar</h3>
                  <p className="text-sm text-gray-600">Se genomförda affärer</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpPage;