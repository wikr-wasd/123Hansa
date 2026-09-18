import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Calculator, FileText } from 'lucide-react';
import ValuationCalculator from '../../components/valuation/ValuationCalculator';

// Värderingssidan.
//
// Den här sidan var tidigare 899 rader och innehöll tre saker som inte fick
// stå kvar:
//
// 1. En EGEN värderingsformel — `omsättning × multiplikator` med påslag som
//    skrivits in i komponenten. Den räknade annorlunda än @hansa/core, saknade
//    valuta helt och tog inte hänsyn till rörelseresultat. Två formler som ger
//    olika svar på samma bolag är värre än en formel som är grov (CLAUDE.md
//    regel 3).
// 2. En tredje branschlista ('Teknologi & IT', 'Utbildning', 'Fastigheter')
//    som varken stämde med annonsformuläret eller med multiplarna i kärnan.
// 3. En knapp märkt "Beställ och betala — 2.500 SEK", med texterna "Säker
//    betalning via Stripe" och "Pengarna återbetalas om du inte är nöjd".
//    Knappen visade en notis och gjorde ingenting annat. Ingen betalning, inget
//    sparat, ingen som blev kontaktad. Tjänsten finns inte (OPEN-QUESTIONS.md
//    fråga 15), priset är inte beslutat (fråga 1), och Stripe är inte inkopplat.
//
// Det tredje är det allvarliga. En säljare som lämnar sina uppgifter och läser
// "vi kontaktar dig inom 24 timmar" väntar på ett samtal som aldrig kommer.
//
// Sidan gör nu en sak, och gör den på riktigt: en schablonuppskattning räknad i
// @hansa/core, med sina antaganden utskrivna.

const ValuationPage: React.FC = () => (
  <>
    <Helmet>
      <title>Värdering – 123Hansa</title>
      <meta
        name="description"
        content="Uppskatta vad ditt bolag kan vara värt utifrån branschmultiplar. Ingen registrering."
      />
    </Helmet>

    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="mb-3 flex items-center gap-3 text-3xl font-bold text-gray-900">
            <Calculator className="h-8 w-8 text-blue-600" aria-hidden="true" />
            Vad kan bolaget vara värt?
          </h1>
          <p className="max-w-2xl text-lg text-gray-600">
            En uppskattning utifrån branschmultiplar för små och medelstora nordiska bolag. Du
            behöver inget konto, och ingenting sparas.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <ValuationCalculator />

        <section className="rounded-xl border border-amber-300 bg-amber-50 p-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-amber-900">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            Vad det här inte är
          </h2>
          <ul className="space-y-2 text-sm text-amber-900">
            <li>
              <strong>Det är inte en värdering.</strong> Det är en schablon som ska ge en
              storleksordning innan du lägger upp en annons. En köpare kommer att räkna själv.
            </li>
            <li>
              <strong>Multiplarna är marknadsschabloner</strong>, inte 123Hansas egen affärsdata —
              den finns inte än. När plattformen har genomförda affärer ersätts de av faktiska
              utfall.
            </li>
            <li>
              <strong>Två bolag med samma siffror kan vara värda helt olika mycket.</strong>
              Kundkoncentration, avtalslängder, hur beroende verksamheten är av dig som ägare och
              vad som ingår i affären avgör mer än multipeln.
            </li>
            <li>
              <strong>Uppskattningen ersätter inte en revisor</strong> eller en due diligence, och
              123Hansa är inte part i affären.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <FileText className="h-5 w-5 text-blue-600" aria-hidden="true" />
            Nästa steg
          </h2>
          <p className="mb-4 text-gray-700">
            Vill du testa siffran mot marknaden är annonsen vägen dit. Du sätter själv priset — eller
            låter det stå som &rdquo;pris på begäran&rdquo; och ser vilka som hör av sig.
          </p>
          <Link
            to="/create-listing"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Lägg upp en annons
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </section>
      </main>
    </div>
  </>
);

export default ValuationPage;
