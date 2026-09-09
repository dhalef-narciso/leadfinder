"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebsitePromptGenerator_1 = require("../services/WebsitePromptGenerator");
const OutreachMessageGenerator_1 = require("../services/OutreachMessageGenerator");
function createMockLead(overrides = {}) {
    return {
        id: 'lead-test-123',
        normalizedIdentityKey: 'test:identity',
        businessName: 'Apex Barber Lounge',
        niche: 'Barber',
        location: 'Dublin',
        description: 'Specializing in classic fades and hot towel shaves.',
        websiteStatus: 'Website Not Found',
        websiteUrl: null,
        instagram: 'https://instagram.com/apexbarber',
        facebook: null,
        phone: '+353 1 234 5678',
        email: 'contact@apexbarber.ie',
        googleBusinessUrl: 'https://maps.google.com/?cid=12345',
        sourceUrl: 'https://instagram.com/apexbarber',
        searchQuery: 'barber Dublin',
        discoverySource: 'google_maps',
        googlePlaceId: 'place_123',
        googleCid: 'cid_123',
        googleMapsUrl: 'https://maps.google.com/?cid=12345',
        address: '14 Grafton Street, Dublin',
        rating: 4.8,
        reviewsCount: 142,
        category: 'Barber',
        latitude: 53.34,
        longitude: -6.26,
        searchProvider: 'MockSearchProvider',
        validationStatus: 'VERIFIED',
        validationConfidence: 95,
        isDemo: true,
        evidence: null,
        fieldEvidence: null,
        urlValidations: null,
        contactVerifications: null,
        opportunityScore: 90,
        scoreTier: 'Very High',
        scoreReason: 'No website found and active phone/instagram',
        status: 'New',
        notes: null,
        demoGenerated: false,
        discoveredAt: new Date(),
        updatedAt: new Date(),
        ...overrides
    };
}
function runTests() {
    console.log('=== RUNNING GENERATOR SUITE ===\n');
    // Test 1: Barber Prompt (Complete Data)
    const barberLead = createMockLead();
    const barberPrompt = WebsitePromptGenerator_1.WebsitePromptGenerator.generate(barberLead);
    console.log('Test 1: Barber Prompt Check:');
    if (!barberPrompt.includes('Apex Barber Lounge'))
        throw new Error('Missing business name');
    if (!barberPrompt.includes('### PROJECT'))
        throw new Error('Missing PROJECT section');
    if (!barberPrompt.includes('### BUSINESS INFORMATION'))
        throw new Error('Missing BUSINESS INFORMATION section');
    if (!barberPrompt.includes('### GOAL'))
        throw new Error('Missing GOAL section');
    if (!barberPrompt.includes('### DESIGN DIRECTION'))
        throw new Error('Missing DESIGN DIRECTION section');
    if (!barberPrompt.includes('### PAGE STRUCTURE'))
        throw new Error('Missing PAGE STRUCTURE section');
    if (!barberPrompt.includes('### FUNCTIONAL REQUIREMENTS'))
        throw new Error('Missing FUNCTIONAL REQUIREMENTS section');
    if (!barberPrompt.includes('### LOCAL SEO'))
        throw new Error('Missing LOCAL SEO section');
    if (!barberPrompt.includes('### RESPONSIVENESS'))
        throw new Error('Missing RESPONSIVENESS section');
    if (!barberPrompt.includes('### CTA REQUIREMENTS'))
        throw new Error('Missing CTA REQUIREMENTS section');
    if (!barberPrompt.includes('### CONTENT RULES & DATA INTEGRITY'))
        throw new Error('Missing CONTENT RULES section');
    if (!barberPrompt.includes('No existing professional website was detected'))
        throw new Error('Missing careful website status note');
    if (!barberPrompt.includes('+353 1 234 5678'))
        throw new Error('Missing verified phone number');
    if (!barberPrompt.includes('4.8 ★ (142 reviews on Google)'))
        throw new Error('Missing verified reviews');
    console.log('  ✓ Barber prompt successfully passed');
    // Test 2: Cafe / Restaurant lead with no reviews and no phone
    const cafeLead = createMockLead({
        businessName: 'The Roasted Bean Cafe',
        niche: 'Cafe',
        category: 'Food & Beverage',
        location: 'Galway',
        phone: null,
        email: null,
        rating: null,
        reviewsCount: null,
        description: null,
        websiteStatus: 'Website Not Found'
    });
    const cafePrompt = WebsitePromptGenerator_1.WebsitePromptGenerator.generate(cafeLead);
    console.log('Test 2: Cafe Prompt (Missing phone, missing reviews, missing description):');
    if (cafePrompt.includes('undefined') || cafePrompt.includes('null'))
        throw new Error('Contains undefined/null strings');
    if (cafePrompt.includes('tel:'))
        throw new Error('Fabricated click-to-call without phone!');
    if (cafePrompt.includes('★'))
        throw new Error('Fabricated star rating without reviews!');
    if (!cafePrompt.includes('Featured Offerings'))
        throw new Error('Missing Cafe-specific section');
    console.log('  ✓ Cafe prompt passed with clean omission of missing data');
    // Test 3: Cleaning Company lead
    const cleaningLead = createMockLead({
        businessName: 'Sparkle Clean Dublin',
        niche: 'Cleaning Company',
        location: 'Dublin 4',
        websiteStatus: 'Website Not Found'
    });
    const cleaningPrompt = WebsitePromptGenerator_1.WebsitePromptGenerator.generate(cleaningLead);
    console.log('Test 3: Cleaning Company Prompt:');
    if (!cleaningPrompt.includes('Residential & Commercial'))
        throw new Error('Missing Cleaning niche structure');
    if (!cleaningPrompt.includes('Why Choose Us'))
        throw new Error('Missing Why Choose Us');
    console.log('  ✓ Cleaning Company prompt passed');
    // Test 4: Plumber lead
    const plumberLead = createMockLead({
        businessName: 'O\'Connor Emergency Plumbing',
        niche: 'Plumber',
        location: 'Cork',
        websiteStatus: 'Website Found',
        websiteUrl: 'http://oconnorplumbing.com'
    });
    const plumberPrompt = WebsitePromptGenerator_1.WebsitePromptGenerator.generate(plumberLead);
    console.log('Test 4: Plumber Prompt:');
    if (!plumberPrompt.includes('Emergency'))
        throw new Error('Missing Plumber emergency structure');
    if (!plumberPrompt.includes('http://oconnorplumbing.com'))
        throw new Error('Missing current website note');
    console.log('  ✓ Plumber prompt passed');
    // Test 5: Outreach Generator - Friendly tone with no demo
    const outreachFriendlyNoDemo = OutreachMessageGenerator_1.OutreachMessageGenerator.generate({
        businessName: 'Apex Barber Lounge',
        niche: 'Barber',
        location: 'Dublin',
        hasWebsite: false,
        instagram: 'https://instagram.com/apexbarber',
        phone: '+353 1 234 5678',
        hasDemo: false,
        tone: 'Friendly',
        language: 'en'
    });
    console.log('Test 5: Outreach Friendly (No Demo):');
    if (!outreachFriendlyNoDemo.includes('Apex Barber Lounge'))
        throw new Error('Missing business name');
    if (outreachFriendlyNoDemo.includes('actually put together a quick demo'))
        throw new Error('False claim: claimed demo was created when hasDemo is false!');
    console.log('  ✓ Outreach Friendly (no false demo claims) passed');
    // Test 6: Outreach Generator - Friendly tone WITH demo
    const outreachFriendlyWithDemo = OutreachMessageGenerator_1.OutreachMessageGenerator.generate({
        businessName: 'Apex Barber Lounge',
        niche: 'Barber',
        location: 'Dublin',
        hasWebsite: false,
        instagram: 'https://instagram.com/apexbarber',
        phone: '+353 1 234 5678',
        hasDemo: true,
        tone: 'Friendly',
        language: 'en'
    });
    console.log('Test 6: Outreach Friendly (With Demo):');
    if (!outreachFriendlyWithDemo.includes('actually put together a quick demo concept'))
        throw new Error('Expected demo-aware phrase');
    console.log('  ✓ Outreach Friendly with demo passed');
    // Test 7: All Outreach tones (Professional, Direct, Casual, Short)
    const tones = ['Professional', 'Direct', 'Casual', 'Short'];
    for (const tone of tones) {
        const msg = OutreachMessageGenerator_1.OutreachMessageGenerator.generate({
            businessName: 'Apex Barber Lounge',
            niche: 'Barber',
            location: 'Dublin',
            hasWebsite: false,
            hasDemo: true,
            tone,
            language: 'en'
        });
        if (!msg || msg.length < 20)
            throw new Error(`Empty or too short message for tone ${tone}`);
    }
    console.log('  ✓ All English tones generated successfully');
    // Test 8: Portuguese outreach
    const ptMsg = OutreachMessageGenerator_1.OutreachMessageGenerator.generate({
        businessName: 'Padaria Central',
        niche: 'Padaria',
        location: 'Lisboa',
        hasWebsite: false,
        hasDemo: true,
        tone: 'Friendly',
        language: 'pt'
    });
    console.log('Test 8: Portuguese Outreach:');
    if (!ptMsg.includes('Padaria Central'))
        throw new Error('Missing Portuguese business name');
    if (!ptMsg.includes('demo rápida') && !ptMsg.includes('ideia/demo'))
        throw new Error('Expected Portuguese demo wording');
    console.log('  ✓ Portuguese outreach generated successfully');
    console.log('\n=== ALL GENERATOR SUITE TESTS PASSED! ===');
}
runTests();
