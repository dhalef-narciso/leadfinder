import prisma from './prisma';

const PREDEFINED_NICHES = [
  { name: 'Barber', category: 'Personal Care', keywords: 'barber, barbershop, mens haircut, fade', synonyms: 'barber, barbershop, barber shop, mens barber, fade barber' },
  { name: 'Hairdresser', category: 'Personal Care', keywords: 'hair salon, hairdresser, hair stylist', synonyms: 'hairdresser, hair salon, hair stylist, hair cut salon' },
  { name: 'Beauty Salon', category: 'Personal Care', keywords: 'beauty salon, facial, lashes, brows', synonyms: 'beauty salon, beautician, aesthetics clinic, beauty lounge, skin clinic' },
  { name: 'Nail Salon', category: 'Personal Care', keywords: 'nail salon, manicure, acrylic nails, gel nails', synonyms: 'nail salon, nail bar, nail tech, manicure pedicure' },
  { name: 'Tattoo Studio', category: 'Personal Care', keywords: 'tattoo, tattoo artist, custom ink', synonyms: 'tattoo studio, tattoo artist, tattoo parlour, ink studio' },
  { name: 'Gym', category: 'Fitness', keywords: 'gym, crossfit, fitness center, weightlifting', synonyms: 'gym, fitness centre, crossfit, fitness studio, strength gym' },
  { name: 'Personal Trainer', category: 'Fitness', keywords: 'personal trainer, fitness coach, 1on1 training', synonyms: 'personal trainer, fitness coach, online PT, pt coach' },
  { name: 'Restaurant', category: 'Food & Beverage', keywords: 'restaurant, dining, dinner, bistro, food', synonyms: 'restaurant, bistro, eatery, dining, food' },
  { name: 'Café', category: 'Food & Beverage', keywords: 'cafe, coffee, espresso, brunch, pastries', synonyms: 'café, coffee shop, espresso bar, coffee house, bakery café' },
  { name: 'Pub', category: 'Food & Beverage', keywords: 'pub, gastropub, bar, craft beer', synonyms: 'pub, gastropub, traditional pub, tavern, bar' },
  { name: 'Plumber', category: 'Trades', keywords: 'plumber, plumbing, boiler repair, leaks', synonyms: 'plumber, plumbing, plumbing services, plumber contractor, heating and plumbing' },
  { name: 'Electrician', category: 'Trades', keywords: 'electrician, electrical, rewiring, fuse board', synonyms: 'electrician, electrical, electrical services, electrical contractor, sparky' },
  { name: 'Painter', category: 'Trades', keywords: 'painter, decorator, house painting', synonyms: 'painter, painting and decorating, painter decorator, commercial painter' },
  { name: 'Carpenter', category: 'Trades', keywords: 'carpenter, joinery, bespoke cabinets, woodworking', synonyms: 'carpenter, carpentry, joinery, woodwork, cabinet maker' },
  { name: 'Flooring Contractor', category: 'Trades', keywords: 'flooring, hardwood floor, carpet fitting, tiles', synonyms: 'flooring contractor, hardwood floors, tiling and flooring, carpet fitting' },
  { name: 'Roofing Contractor', category: 'Trades', keywords: 'roofing, roof repair, guttering, tiles', synonyms: 'roofing contractor, roof repairs, roofing specialist, guttering & roofing' },
  { name: 'Mechanic', category: 'Automotive', keywords: 'mechanic, auto repair, car service, nct check', synonyms: 'mechanic, auto repair, car service, garage mechanic, motor repair' },
  { name: 'Car Detailer', category: 'Automotive', keywords: 'car detailing, ceramic coating, car wash, valeting', synonyms: 'car detailer, auto detailing, car valeting, paint correction, ceramic coating' },
  { name: 'Cleaning Company', category: 'Home Services', keywords: 'cleaners, commercial cleaning, office cleaning', synonyms: 'cleaning company, cleaning services, commercial cleaners, deep cleaning' },
  { name: 'Landscaping', category: 'Home Services', keywords: 'landscaping, garden design, paving, grass cutting', synonyms: 'landscaping, gardening services, landscape gardener, paving & lawn' },
  { name: 'Photographer', category: 'Creative', keywords: 'photographer, wedding photo, portrait studio', synonyms: 'photographer, photography studio, wedding photographer, portrait photographer' },
  { name: 'Dentist', category: 'Healthcare', keywords: 'dentist, dental clinic, teeth whitening, veneers', synonyms: 'dentist, dental clinic, dental practice, orthodontist' },
  { name: 'Physiotherapist', category: 'Healthcare', keywords: 'physio, physiotherapy, back pain, rehab', synonyms: 'physiotherapist, physiotherapy, physical therapy, sports physio' },
  { name: 'Accountant', category: 'Professional', keywords: 'accountant, tax returns, bookkeeping, payroll', synonyms: 'accountant, accountancy firm, tax consultant, bookkeeper' },
  { name: 'Real Estate Agent', category: 'Professional', keywords: 'real estate, estate agent, property sales, letting', synonyms: 'real estate agent, estate agent, property broker, letting agency' }
];

const SEED_LEADS = [
  {
    normalizedIdentityKey: 'ig:blade_comb_cuts_limerick',
    businessName: "Blade & Comb Barber Lounge",
    niche: "Barber",
    location: "Limerick",
    description: "Traditional hot towel shaves, skin fades, and men's grooming in Limerick. Bookings strictly via call or Instagram DM.",
    websiteStatus: "Website Not Found",
    websiteUrl: null,
    instagram: "https://www.instagram.com/blade_comb_cuts_limerick/",
    facebook: "https://www.facebook.com/bladecomblimerick/",
    phone: "+353 61 452 9811",
    email: "bladecombcuts@gmail.com",
    googleBusinessUrl: null,
    sourceUrl: "https://www.instagram.com/blade_comb_cuts_limerick/",
    searchQuery: '"barber" site:instagram.com "Limerick"',
    searchProvider: 'MockSearchProvider',
    isDemo: true,
    validationStatus: 'VERIFIED',
    validationConfidence: 92,
    opportunityScore: 85,
    scoreTier: "Very High",
    scoreReason: "Very High opportunity because no professional website was detected, Instagram is active, and direct phone/email are verified.",
    status: "New",
    notes: "Prime prospect. High engagement on Instagram, but relies on phone/DM booking which creates friction.",
    evidence: JSON.stringify([
      { type: 'search_result', source: 'Query: "barber" site:instagram.com "Limerick"', status: 'verified', description: 'Business appeared in Google index with consistent name and location' },
      { type: 'instagram', source: 'https://www.instagram.com/blade_comb_cuts_limerick/', status: 'valid', description: 'Active Instagram profile verified (@blade_comb_cuts_limerick)' },
      { type: 'phone', source: '+353 61 452 9811', status: 'verified', description: 'Limerick local landline verified (+353 61 452 9811)' },
      { type: 'email', source: 'bladecombcuts@gmail.com', status: 'verified', description: 'Business email contact verified (bladecombcuts@gmail.com)' },
      { type: 'website', source: 'pipeline_check', status: 'unverified', description: 'No active website detected across search results and domains' }
    ]),
    urlValidations: JSON.stringify({
      instagram: { url: 'https://www.instagram.com/blade_comb_cuts_limerick/', status: 'VALID', lastChecked: new Date().toISOString(), source: 'instagram' },
      facebook: { url: 'https://www.facebook.com/bladecomblimerick/', status: 'VALID', lastChecked: new Date().toISOString(), source: 'facebook' }
    }),
    contactVerifications: JSON.stringify({
      phone: { value: '+353 61 452 9811', status: 'verified', reason: 'Format and regional code verified' },
      email: { value: 'bladecombcuts@gmail.com', status: 'verified', reason: 'Deliverable address syntax verified' },
      instagram: { value: 'https://www.instagram.com/blade_comb_cuts_limerick/', status: 'valid', reason: 'Instagram profile confirmed' },
      website: { value: null, status: 'Website Not Found', reason: 'No website detected' }
    })
  },
  {
    normalizedIdentityKey: 'web:purecleanlimerick.ie',
    businessName: "Pure Clean Commercial Services",
    niche: "Cleaning Company",
    location: "Limerick",
    description: "Office sanitization, tenancy end-of-lease, deep cleaning contracts in Limerick city and Shannon industrial estate.",
    websiteStatus: "Website Unclear",
    websiteUrl: "https://www.purecleanlimerick.ie",
    instagram: null,
    facebook: "https://www.facebook.com/purecleanlimerick/",
    phone: "+353 87 234 9102",
    email: "info@purecleanlimerick.ie",
    googleBusinessUrl: null,
    sourceUrl: "https://www.facebook.com/purecleanlimerick/",
    searchQuery: '"cleaning company" "Limerick" "contact"',
    searchProvider: 'MockSearchProvider',
    isDemo: true,
    validationStatus: 'POTENTIAL',
    validationConfidence: 68,
    opportunityScore: 60,
    scoreTier: "High",
    scoreReason: "Opportunity capped at 60 due to moderate validation confidence (68/100). Email domain indicates possible website.",
    status: "Contacted",
    notes: "Lead has custom email domain purecleanlimerick.ie. Website existence unclear pending domain reachability check.",
    evidence: JSON.stringify([
      { type: 'search_result', source: 'Query: "cleaning company" "Limerick" "contact"', status: 'verified', description: 'Business appeared in search results' },
      { type: 'email', source: 'info@purecleanlimerick.ie', status: 'verified', description: 'Direct contact email verified (info@purecleanlimerick.ie)' },
      { type: 'website', source: 'email_domain_check', status: 'unverified', description: 'Website existence unclear; custom domain referenced by contact email' },
      { type: 'phone', source: '+353 87 234 9102', status: 'verified', description: 'Irish mobile phone number format verified (+353 87 234 9102)' }
    ]),
    urlValidations: JSON.stringify({
      website: { url: 'https://www.purecleanlimerick.ie', status: 'NOT_CHECKED', lastChecked: new Date().toISOString(), source: 'email_domain' },
      facebook: { url: 'https://www.facebook.com/purecleanlimerick/', status: 'VALID', lastChecked: new Date().toISOString(), source: 'facebook' }
    }),
    contactVerifications: JSON.stringify({
      phone: { value: '+353 87 234 9102', status: 'verified', reason: 'Mobile phone pattern verified' },
      email: { value: 'info@purecleanlimerick.ie', status: 'verified', reason: 'Custom business domain identified' },
      instagram: { value: null, status: 'none', reason: 'Not listed' },
      website: { value: 'https://www.purecleanlimerick.ie', status: 'Website Unclear', reason: 'Email domain purecleanlimerick.ie under investigation' }
    })
  },
  {
    normalizedIdentityKey: 'ig:volttech_sparks',
    businessName: "VoltTech Electrical Solutions",
    niche: "Electrician",
    location: "Ennis",
    description: "Certified domestic & commercial electrical contractor in Ennis & Shannon. Fuse board upgrades, EV chargers, 24/7 callouts.",
    websiteStatus: "Website Not Found",
    websiteUrl: null,
    instagram: "https://www.instagram.com/volttech_sparks/",
    facebook: null,
    phone: "+353 65 682 4490",
    email: null,
    googleBusinessUrl: null,
    sourceUrl: "https://www.google.com/search?q=VoltTech+Electrical+Ennis",
    searchQuery: '"electrician" "Ennis" "call"',
    searchProvider: 'MockSearchProvider',
    isDemo: true,
    validationStatus: 'VERIFIED',
    validationConfidence: 85,
    opportunityScore: 75,
    scoreTier: "High",
    scoreReason: "High opportunity because no professional website was detected, Instagram is active, and telephone is verified.",
    status: "Interested",
    notes: "Spoke with owner Mark on phone. He is interested in a simple 1-page landing page to show EV charger certifications.",
    evidence: JSON.stringify([
      { type: 'search_result', source: 'Google Search index', status: 'verified', description: 'Business confirmed in local trade listings for Ennis' },
      { type: 'instagram', source: 'https://www.instagram.com/volttech_sparks/', status: 'valid', description: 'Active Instagram profile verified (@volttech_sparks)' },
      { type: 'phone', source: '+353 65 682 4490', status: 'verified', description: 'Ennis landline verified (+353 65 682 4490)' },
      { type: 'website', source: 'pipeline_check', status: 'unverified', description: 'No professional website detected' }
    ]),
    urlValidations: JSON.stringify({
      instagram: { url: 'https://www.instagram.com/volttech_sparks/', status: 'VALID', lastChecked: new Date().toISOString(), source: 'instagram' }
    }),
    contactVerifications: JSON.stringify({
      phone: { value: '+353 65 682 4490', status: 'verified', reason: 'Landline verified' },
      email: { value: null, status: 'none', reason: 'No email found' },
      instagram: { value: 'https://www.instagram.com/volttech_sparks/', status: 'valid', reason: 'Instagram verified' },
      website: { value: null, status: 'Website Not Found', reason: 'No website detected' }
    })
  },
  {
    normalizedIdentityKey: 'web:apexplumbing.ie',
    businessName: "Apex Plumbing & Gas",
    niche: "Plumber",
    location: "Limerick",
    description: "Emergency plumbing, boiler maintenance, bathroom renovations in Limerick city.",
    websiteStatus: "Website Found",
    websiteUrl: "https://www.apexplumbing.ie",
    instagram: "https://www.instagram.com/apexplumbinglimerick/",
    facebook: "https://www.facebook.com/apexplumbingie/",
    phone: "+353 61 500 200",
    email: "contact@apexplumbing.ie",
    googleBusinessUrl: null,
    sourceUrl: "https://www.apexplumbing.ie",
    searchQuery: '"plumber" "Limerick" "contact"',
    searchProvider: 'MockSearchProvider',
    isDemo: true,
    validationStatus: 'VERIFIED',
    validationConfidence: 95,
    opportunityScore: 35,
    scoreTier: "Low",
    scoreReason: "Lower opportunity because an active professional website is already in place (-40).",
    status: "Not Interested",
    notes: "Already has an established website launched in 2023.",
    evidence: JSON.stringify([
      { type: 'search_result', source: 'Query: "plumber" "Limerick" "contact"', status: 'verified', description: 'Authoritative search result match' },
      { type: 'website', source: 'https://www.apexplumbing.ie', status: 'valid', description: 'Official website domain verified (reachable)' },
      { type: 'phone', source: '+353 61 500 200', status: 'verified', description: 'Business telephone verified' },
      { type: 'email', source: 'contact@apexplumbing.ie', status: 'verified', description: 'Domain-matched email verified' }
    ]),
    urlValidations: JSON.stringify({
      website: { url: 'https://www.apexplumbing.ie', status: 'VALID', lastChecked: new Date().toISOString(), source: 'website' }
    }),
    contactVerifications: JSON.stringify({
      phone: { value: '+353 61 500 200', status: 'verified', reason: 'Phone verified' },
      email: { value: 'contact@apexplumbing.ie', status: 'verified', reason: 'Corporate email verified' },
      instagram: { value: 'https://www.instagram.com/apexplumbinglimerick/', status: 'valid', reason: 'Instagram verified' },
      website: { value: 'https://www.apexplumbing.ie', status: 'Website Found', reason: 'Live official website' }
    })
  },
  {
    normalizedIdentityKey: 'invalid:phantom_quick_clean',
    businessName: "Phantom Auto Valeting",
    niche: "Car Detailer",
    location: "Limerick",
    description: "Mobile car valeting and detailing. Bookings on WhatsApp.",
    websiteStatus: "Website Not Found",
    websiteUrl: null,
    instagram: "https://www.instagram.com/invalid_404_phantom_profile_xyz/",
    facebook: null,
    phone: "12345",
    email: "fake-user@invalid-nonexistent-domain-404.xyz",
    googleBusinessUrl: null,
    sourceUrl: "https://www.google.com/search?q=phantom+auto+valeting",
    searchQuery: '"valeting" "Limerick"',
    searchProvider: 'MockSearchProvider',
    isDemo: true,
    validationStatus: 'INVALID',
    validationConfidence: 15,
    opportunityScore: 10,
    scoreTier: "Low",
    scoreReason: "Opportunity restricted to Low (10/100) because validation confidence is low (15%). Lead rejected.",
    status: "Closed",
    notes: "Rejected lead: Instagram handle invalid, phone number is truncated fake sequence, email domain is non-existent.",
    evidence: JSON.stringify([
      { type: 'search_result', source: 'Search snippet', status: 'invalid', description: 'Insufficient business evidence in search index' },
      { type: 'instagram', source: 'https://www.instagram.com/invalid_404_phantom_profile_xyz/', status: 'invalid', description: 'Instagram link rejected: Profile not found or dead handle' },
      { type: 'phone', source: '12345', status: 'invalid', description: 'Phone number format failed verification (12345: truncated)' },
      { type: 'email', source: 'fake-user@invalid-nonexistent-domain-404.xyz', status: 'invalid', description: 'Email address failed syntax or domain verification' }
    ]),
    urlValidations: JSON.stringify({
      instagram: { url: 'https://www.instagram.com/invalid_404_phantom_profile_xyz/', status: 'INVALID', lastChecked: new Date().toISOString(), source: 'instagram' }
    }),
    contactVerifications: JSON.stringify({
      phone: { value: '12345', status: 'invalid', reason: 'Truncated sequence' },
      email: { value: 'fake-user@invalid-nonexistent-domain-404.xyz', status: 'invalid', reason: 'Unregistered domain' },
      instagram: { value: 'https://www.instagram.com/invalid_404_phantom_profile_xyz/', status: 'invalid', reason: 'Dead profile' },
      website: { value: null, status: 'Website Not Found', reason: 'No website' }
    })
  }
];

export async function seed() {
  console.log('Seeding Niches...');
  for (const n of PREDEFINED_NICHES) {
    await prisma.niche.upsert({
      where: { name: n.name },
      update: { category: n.category, keywords: n.keywords, synonyms: n.synonyms },
      create: {
        name: n.name,
        category: n.category,
        keywords: n.keywords,
        synonyms: n.synonyms,
        isCustom: false
      }
    });
  }

  console.log('Seeding Sample Prospecting Leads...');
  for (const lead of SEED_LEADS) {
    await prisma.lead.upsert({
      where: { normalizedIdentityKey: lead.normalizedIdentityKey },
      update: lead,
      create: lead
    });
  }

  // Create an initial saved search
  const firstNiche = await prisma.niche.findFirst({ where: { name: 'Barber' } });
  await prisma.search.create({
    data: {
      name: "Limerick & Ennis Barbers",
      nicheId: firstNiche?.id,
      nicheName: "Barber",
      locations: JSON.stringify(["Limerick", "Ennis"]),
      options: JSON.stringify({ includeInstagram: true, includeFacebook: true, searchDepth: 2 }),
      totalFound: 14
    }
  });

  console.log('Database seeded successfully!');
}

if (require.main === module) {
  seed()
    .catch((e) => {
      console.error('Seed error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
