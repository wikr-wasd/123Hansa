/**
 * Svenska är källspråket, och `Dictionary` härleds ur den här filen.
 *
 * Lägger du till en nyckel här och glömmer den i något annat språk blir det ett
 * BYGGFEL, inte en engelsk sträng mitt i en norsk sida. Utan den kopplingen
 * ruttnar översättningarna tyst — det är så en sajt blir "flerspråkig" i
 * menyn och svensk i innehållet.
 *
 * Bara gränssnittet översätts. Säljarens egen text — bolagsbeskrivning,
 * villkor, sekretessavtal — står kvar som den skrivits. En maskinöversatt
 * bolagsbeskrivning i en affär på tiotals miljoner är en juridisk risk, inte
 * en tjänst (CLAUDE.md).
 */
const sv = {
  // Meny och sidfot
  home: 'Hem',
  marketplace: 'Marknadsplats',
  'create-listing': 'Lägg till annons',
  messages: 'Meddelanden',
  dashboard: 'Min sida',
  login: 'Logga in',
  logout: 'Logga ut',
  register: 'Registrera',
  'nav.open-menu': 'Öppna meny',
  'nav.close-menu': 'Stäng meny',

  'footer.description': 'Marknadsplatsen för företag och affärstillgångar.',
  'footer.businesses': 'Företag',
  'footer.buy-businesses': 'Köp företag',
  'footer.sell-businesses': 'Sälj företag',
  'footer.valuation': 'Värdering',
  'footer.support': 'Support',
  'footer.help': 'Hjälp',
  'footer.contact': 'Kontakt',
  'footer.legal': 'Juridiskt',
  'footer.follow-us': 'Följ oss',
  'footer.copyright': 'Alla rättigheter förbehållna.',

  // Startsidan
  'homepage.title': '123Hansa – marknadsplats för företagsaffärer',
  'homepage.meta-description':
    'Köp och sälj företag och affärstillgångar. Köpare och säljare hittar varandra och gör upp direkt.',
  'homepage.meta-keywords':
    'köpa företag, sälja företag, företagsförvärv, M&A, företag till salu, Sverige, Norge, Danmark',
  'homepage.hero.title.line1': 'Företag',
  'homepage.hero.title.line2': 'till salu',
  'homepage.hero.subtitle':
    'Köp och sälj företag och affärstillgångar. Köpare och säljare hittar varandra här och gör upp direkt med varandra.',
  'homepage.search.placeholder': 'Sök på bransch, ort eller nyckelord',
  'homepage.search.all-categories': 'Alla kategorier',
  'homepage.search.button': 'Sök',
  'homepage.categories.title': 'Vad kan du köpa och sälja?',
  'homepage.categories.subtitle': 'Företag, e-handel, domäner och andra affärstillgångar',

  // Länderna
  'country.SE': 'Sverige',
  'country.NO': 'Norge',
  'country.DK': 'Danmark',

  // Annonslistan
  'listings.title': 'Företag till salu',
  'listings.subtitle': 'Köpare och säljare hittar varandra här och gör upp direkt med varandra.',
  'listings.search-label': 'Sök bland annonser',
  'listings.search-placeholder': 'Sök på bransch, ort eller nyckelord',
  'listings.country-label': 'Land',
  'listings.all-countries': 'Alla länder',
  'listings.industry-label': 'Bransch',
  'listings.all-industries': 'Alla branscher',
  'listings.search': 'Sök',
  'listings.loading': 'Hämtar annonser…',
  'listings.error-title': 'Annonserna kunde inte hämtas',
  'listings.retry': 'Försök igen',
  'listings.empty-title': 'Inga annonser matchar sökningen',
  'listings.empty-body': 'Pröva ett annat land, en annan bransch eller ett bredare sökord.',
  'listings.clear-filters': 'Rensa filtren',
  'listings.count-one': 'annons',
  'listings.count-many': 'annonser',
  'listings.load-more': 'Visa fler annonser',
  'listings.demo-badge': 'Exempelannons',
  'listings.employees': 'anställda',
  'listings.revenue': 'i omsättning',
  'listings.price-on-request': 'Pris på begäran',

  // Annonssidan
  'listing.back': 'Tillbaka till annonserna',
  'listing.loading': 'Hämtar annonsen…',
  'listing.not-found-title': 'Annonsen finns inte',
  'listing.not-found-body': 'Den kan ha tagits bort eller ännu inte blivit publicerad.',
  'listing.about': 'Om verksamheten',
  'listing.key-figures': 'Nyckeltal',
  'listing.location': 'Plats',
  'listing.employees': 'Anställda',
  'listing.founded': 'Grundat',
  'listing.asking-price': 'Utgångspris',
  'listing.demo-title': 'Det här är en exempelannons',
  'listing.demo-body':
    'Bolaget finns inte. Annonsen visar hur en riktig annons ser ut på 123Hansa och går därför inte att kontakta.',
  'listing.demo-cannot-contact': 'Exempelannonser går inte att kontakta.',
  'listing.see-others': 'Se övriga annonser',
  'listing.interest-label': 'Visa intresse',
  'listing.interest-placeholder': 'Berätta kort vem du är och varför bolaget är intressant.',
  'listing.interest-send': 'Skicka intresseanmälan',
  'listing.interest-login': 'Logga in och visa intresse',
  'listing.interest-sent-title': 'Intresseanmälan skickad',
  'listing.interest-note':
    'Dina kontaktuppgifter delas bara om säljaren väljer att gå vidare. 123Hansa är inte part i affären — förhandling, avtal och betalning sköter ni själva.',
  'listing.details': 'Annonsuppgifter',
  'listing.published': 'Publicerad',
  'listing.id': 'Annons-ID',
} as const;

/**
 * Nyckelmängden, inte de exakta strängarna: `Record<keyof typeof sv, string>`
 * och inte `typeof sv`. Med det senare blir varje svensk text sin egen typ, och
 * "Hjem" går inte att tilldela en nyckel som kräver exakt "Hem" — översättningen
 * blir ett typfel i stället för en översättning.
 */
export type Dictionary = Record<keyof typeof sv, string>;
export default sv;
