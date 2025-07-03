import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, FileText, Users, Eye, Lock, Scale } from 'lucide-react';

const LegalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('terms');

  const tabs = [
    { id: 'terms', name: 'Användarvillkor', icon: FileText },
    { id: 'privacy', name: 'Integritetspolicy', icon: Shield },
    { id: 'cookies', name: 'Cookie-policy', icon: Eye },
    { id: 'gdpr', name: 'GDPR', icon: Lock }
  ];

  return (
    <>
      <Helmet>
        <title>Juridiskt - Tubba</title>
        <meta name="description" content="Läs våra användarvillkor, integritetspolicy och juridiska riktlinjer för Tubba." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Juridisk information</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Läs om våra villkor, integritetspolicy och hur vi hanterar dina personuppgifter.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {/* Terms of Service */}
            {activeTab === 'terms' && (
              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Användarvillkor</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Allmänt</h3>
                    <p className="text-gray-700">
                      Dessa användarvillkor ("Villkoren") reglerar din användning av Tubba.se ("Plattformen"), 
                      som drivs av Tubba AB ("Tubba", "vi", "oss"). Genom att använda Plattformen accepterar 
                      du dessa Villkor i sin helhet.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Beskrivning av tjänsten</h3>
                    <p className="text-gray-700">
                      Tubba är en digital marknadsplats där användare kan köpa och sälja företag, digitala 
                      tillgångar och affärstjänster. Vi tillhandahåller plattformen men är inte part i 
                      transaktionerna mellan köpare och säljare.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Användarkonto</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Du måste vara minst 18 år för att skapa ett konto</li>
                      <li>Du ansvarar för att hålla dina inloggningsuppgifter säkra</li>
                      <li>Du får inte dela ditt konto med andra</li>
                      <li>Vi förbehåller oss rätten att stänga av konton som bryter mot dessa villkor</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Annonser och innehåll</h3>
                    <p className="text-gray-700">
                      Som säljare ansvarar du för att all information i din annons är korrekt och laglig. 
                      Vi förbehåller oss rätten att granska och ta bort innehåll som bryter mot våra riktlinjer.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Avgifter</h3>
                    <p className="text-gray-700">
                      Tubba tar en provision på 3% av det slutliga försäljningspriset vid genomförd transaktion. 
                      Inga avgifter tas för att lista annonser eller visa intresse som köpare.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Ansvarsbegränsning</h3>
                    <p className="text-gray-700">
                      Tubba ansvarar inte för förluster som uppstår i samband med transaktioner mellan användare. 
                      Vi rekommenderar starkt att använda juridisk rådgivning vid företagsförvärv.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Policy */}
            {activeTab === 'privacy' && (
              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Integritetspolicy</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Vilka uppgifter samlar vi in?</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Kontaktuppgifter (namn, e-post, telefon)</li>
                      <li>Profiluppgifter från sociala medier vid inloggning</li>
                      <li>Företagsinformation som du delar i annonser</li>
                      <li>Användningsdata och cookies för att förbättra tjänsten</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Hur använder vi uppgifterna?</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Tillhandahålla och förbättra våra tjänster</li>
                      <li>Kommunicera med dig om din annons eller transaktioner</li>
                      <li>Förhindra bedrägerier och säkerställa plattformens säkerhet</li>
                      <li>Skicka relevanta marknadsföringsmeddelanden (med ditt samtycke)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Delning med tredje part</h3>
                    <p className="text-gray-700">
                      Vi delar aldrig dina personuppgifter med tredje part utan ditt uttryckliga samtycke, 
                      förutom när det krävs enligt lag eller för att tillhandahålla våra tjänster 
                      (t.ex. betalningsprocessorer).
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Dina rättigheter</h3>
                    <p className="text-gray-700">
                      Enligt GDPR har du rätt att begära tillgång till, rättelse eller radering av dina 
                      personuppgifter. Du kan också motsätta dig behandling eller begära dataportabilitet. 
                      Kontakta oss på privacy@tubba.se för att utöva dessa rättigheter.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cookie Policy */}
            {activeTab === 'cookies' && (
              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Cookie-policy</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Vad är cookies?</h3>
                    <p className="text-gray-700">
                      Cookies är små textfiler som lagras på din enhet när du besöker en webbplats. 
                      De hjälper oss att komma ihåg dina preferenser och förbättra din användarupplevelse.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Typer av cookies vi använder</h3>
                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-gray-900">Nödvändiga cookies</h4>
                        <p className="text-gray-700">Krävs för att plattformen ska fungera korrekt. Inkluderar inloggning och säkerhet.</p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-semibold text-gray-900">Funktionscookies</h4>
                        <p className="text-gray-700">Hjälper oss att komma ihåg dina preferenser och inställningar.</p>
                      </div>
                      <div className="border-l-4 border-yellow-500 pl-4">
                        <h4 className="font-semibold text-gray-900">Analysookies</h4>
                        <p className="text-gray-700">Hjälper oss förstå hur besökare använder webbplatsen för att förbättra tjänsten.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Hantera cookies</h3>
                    <p className="text-gray-700">
                      Du kan hantera och ta bort cookies genom din webbläsares inställningar. 
                      Observera att vissa funktioner kanske inte fungerar korrekt om du blockerar alla cookies.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* GDPR */}
            {activeTab === 'gdpr' && (
              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">GDPR-information</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Rättslig grund för behandling</h3>
                    <p className="text-gray-700">
                      Vi behandlar dina personuppgifter baserat på följande rättsliga grunder:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
                      <li><strong>Avtal:</strong> För att tillhandahålla våra tjänster</li>
                      <li><strong>Berättigat intresse:</strong> För att förbättra plattformen och förhindra bedrägerier</li>
                      <li><strong>Samtycke:</strong> För marknadsföring och icke-nödvändiga cookies</li>
                      <li><strong>Rättslig förpliktelse:</strong> För att följa tillämpliga lagar</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Databehandlingsansvarig</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">
                        <strong>Tubba AB</strong><br />
                        Stureplan 4A<br />
                        114 35 Stockholm<br />
                        E-post: privacy@tubba.se
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Hur länge sparar vi data?</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Kontoinformation: Så länge kontot är aktivt + 2 år</li>
                      <li>Transaktionsdata: 7 år (enligt bokföringslagen)</li>
                      <li>Marknadsföringsdata: Tills du återkallar samtycke</li>
                      <li>Loggar och säkerhetsdata: 12 månader</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Kontakta vårt DPO</h3>
                    <p className="text-gray-700">
                      För frågor om databehandling eller för att utöva dina rättigheter, 
                      kontakta vårt dataskyddsombud på: <strong>dpo@tubba.se</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LegalPage;