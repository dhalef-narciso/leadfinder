"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LeadExtractorService_1 = require("../services/LeadExtractorService");
const WebsiteDetectorService_1 = require("../services/WebsiteDetectorService");
const SocialValidationService_1 = require("../services/SocialValidationService");
const LeadScoringService_1 = require("../services/LeadScoringService");
// Simple test runner helper
let passCount = 0;
let failCount = 0;
function assert(condition, testName, detail) {
    if (condition) {
        console.log(`  ✓ PASS: ${testName}`);
        passCount++;
    }
    else {
        console.error(`  ✗ FAIL: ${testName}${detail ? ' - ' + detail : ''}`);
        failCount++;
    }
}
async function runTests() {
    console.log('\n========================================');
    console.log('Running LeadFinder Pipeline & Validation Tests');
    console.log('========================================\n');
    // ----------------------------------------------------
    // Test 1: Real business with website
    // ----------------------------------------------------
    console.log('Test 1: Real business with website');
    {
        const rawResult = {
            title: 'Apex Plumbing & Gas | Limerick Heating Services',
            link: 'https://www.apexplumbing.ie',
            snippet: 'Professional plumbing in Limerick. Call +353 61 500 200 or email contact@apexplumbing.ie.',
            sourceQuery: 'plumber Limerick',
            searchProvider: 'MockSearchProvider',
            isDemo: true
        };
        const leads = await LeadExtractorService_1.LeadExtractorService.extractFromResults([rawResult], 'Plumber', 'Limerick');
        const lead = leads[0];
        assert(lead.businessName === 'Apex Plumbing & Gas', 'Business name extracted cleanly without fabrication');
        assert(lead.websiteStatus === 'Website Found', 'Website detected as "Website Found"');
        assert(lead.websiteUrl === 'https://www.apexplumbing.ie/', 'Website URL preserved');
        assert(lead.phone === '+353 61 500 200', 'Phone number extracted accurately');
        assert(lead.email === 'contact@apexplumbing.ie', 'Email extracted accurately');
        assert(lead.validationStatus === 'VERIFIED', 'Validation status is VERIFIED');
        assert(lead.validationConfidence >= 75, `Confidence score is high (${lead.validationConfidence})`);
        assert(lead.opportunityScore < 50, `Opportunity score reflects existing website (-40) -> ${lead.opportunityScore}`);
    }
    // ----------------------------------------------------
    // Test 2: Real business without website
    // ----------------------------------------------------
    console.log('\nTest 2: Real business without website');
    {
        const rawResult = {
            title: 'Blade & Comb Barbers (@blade_comb_cuts) • Instagram photos and videos',
            link: 'https://www.instagram.com/blade_comb_cuts/',
            snippet: 'Traditional hot towel shaves in Limerick. Book via call +353 61 452 9811. Direct bookings only, no website.',
            sourceQuery: 'barber site:instagram.com Limerick',
            searchProvider: 'MockSearchProvider',
            isDemo: true
        };
        const leads = await LeadExtractorService_1.LeadExtractorService.extractFromResults([rawResult], 'Barber', 'Limerick');
        const lead = leads[0];
        assert(lead.websiteStatus === 'Website Not Found', 'Website correctly detected as "Website Not Found"');
        assert(lead.websiteUrl === null, 'Website URL is strictly null');
        assert(lead.instagram === 'https://www.instagram.com/blade_comb_cuts/', 'Instagram profile captured');
        assert(lead.phone === '+353 61 452 9811', 'Phone number captured');
        assert(lead.email === null, 'Missing email is strictly null, not invented');
        assert(lead.validationStatus === 'VERIFIED', 'Validation status is VERIFIED');
        assert(lead.opportunityScore >= 70, `High opportunity prospect without website: ${lead.opportunityScore}`);
    }
    // ----------------------------------------------------
    // Test 3: Business with Instagram only
    // ----------------------------------------------------
    console.log('\nTest 3: Business with Instagram only');
    {
        const rawResult = {
            title: 'Limerick Fade Lounge (@limerickfadelounge) • Instagram',
            link: 'https://www.instagram.com/limerickfadelounge/',
            snippet: 'Walk-ins welcome on O\'Connell Street. DM for queries and bookings.',
            sourceQuery: 'barber site:instagram.com Limerick',
            searchProvider: 'MockSearchProvider',
            isDemo: true
        };
        const leads = await LeadExtractorService_1.LeadExtractorService.extractFromResults([rawResult], 'Barber', 'Limerick');
        const lead = leads[0];
        assert(lead.businessName === 'Limerick Fade Lounge', 'Name parsed from Instagram title');
        assert(lead.instagram === 'https://www.instagram.com/limerickfadelounge/', 'Instagram URL set');
        assert(lead.phone === null, 'Phone is null when absent');
        assert(lead.email === null, 'Email is null when absent');
        assert(lead.facebook === null, 'Facebook is null when absent');
        assert(lead.googleBusinessUrl === null, 'Google maps is null when absent');
        assert(lead.validationStatus === 'VERIFIED' || lead.validationStatus === 'POTENTIAL', `Valid Instagram handle qualifies lead as verified or potential (got: ${lead.validationStatus})`);
    }
    // ----------------------------------------------------
    // Test 4: Invalid Instagram URL
    // ----------------------------------------------------
    console.log('\nTest 4: Invalid Instagram URL');
    {
        const igValidation1 = await SocialValidationService_1.SocialValidationService.validateInstagram('https://www.instagram.com/about/');
        assert(igValidation1.status === 'INVALID', 'Reserved path /about/ is marked INVALID');
        const igValidation2 = await SocialValidationService_1.SocialValidationService.validateInstagram('https://www.instagram.com/invalid***handle$$/');
        assert(igValidation2.status === 'INVALID', 'Handle with invalid characters is marked INVALID');
        const igValidation3 = await SocialValidationService_1.SocialValidationService.validateInstagram('not-even-a-url');
        assert(igValidation3.status === 'INVALID', 'Garbage URL is marked INVALID');
    }
    // ----------------------------------------------------
    // Test 5: Invalid Facebook URL
    // ----------------------------------------------------
    console.log('\nTest 5: Invalid Facebook URL');
    {
        const fbValidation1 = await SocialValidationService_1.SocialValidationService.validateFacebook('https://www.facebook.com/login/');
        assert(fbValidation1.status === 'INVALID', 'Reserved Facebook path /login/ is marked INVALID');
        const fbValidation2 = await SocialValidationService_1.SocialValidationService.validateFacebook('https://www.facebook.com/');
        assert(fbValidation2.status === 'INVALID', 'Facebook root without page handle is marked INVALID');
    }
    // ----------------------------------------------------
    // Test 6: Fake/nonexistent business
    // ----------------------------------------------------
    console.log('\nTest 6: Fake/nonexistent business');
    {
        const rawResult = {
            title: '', // Missing title
            link: 'https://fake-random-unregistered-site-123.com',
            snippet: 'Totally random snippet with no contact info and no verified entity.',
            sourceQuery: 'test query',
            searchProvider: 'MockSearchProvider',
            isDemo: false
        };
        const leads = await LeadExtractorService_1.LeadExtractorService.extractFromResults([rawResult], 'Services', 'Limerick');
        const lead = leads[0];
        assert(lead.validationStatus === 'INVALID', `Nonexistent entity classified as INVALID (got: ${lead.validationStatus})`);
        assert(lead.validationConfidence <= 35, `Validation confidence is low: ${lead.validationConfidence}`);
        assert(lead.opportunityScore <= 30, `Safety Rule: Opportunity score capped at <= 30 (got: ${lead.opportunityScore})`);
    }
    // ----------------------------------------------------
    // Test 7: Business with email domain (Pure Clean Limerick case)
    // ----------------------------------------------------
    console.log('\nTest 7: Business with email domain');
    {
        const email = 'info@purecleanlimerick.ie';
        const domain = WebsiteDetectorService_1.WebsiteDetectorService.extractDomainFromEmail(email);
        assert(domain === 'purecleanlimerick.ie', 'Extracts domain purecleanlimerick.ie from email');
        // Free email domains should NOT be extracted as business websites
        const gmailDomain = WebsiteDetectorService_1.WebsiteDetectorService.extractDomainFromEmail('barber@gmail.com');
        assert(gmailDomain === null, 'Gmail domain is ignored for custom website inference');
        // Crucial rule: Do NOT classify business as "No Website" without considering the domain
        const detection = WebsiteDetectorService_1.WebsiteDetectorService.detect(null, 'Commercial cleaning contracts.', email);
        assert(detection.status === 'Website Unclear', `Custom email domain classified as "Website Unclear", NOT "Website Not Found" (got: ${detection.status})`);
        assert(detection.url === 'https://www.purecleanlimerick.ie', `Inferred candidate domain: ${detection.url}`);
    }
    // ----------------------------------------------------
    // Test 8: Duplicate business
    // ----------------------------------------------------
    console.log('\nTest 8: Duplicate business');
    {
        const rawResults = [
            {
                title: 'Blade & Comb Barber Lounge',
                link: 'https://www.instagram.com/blade_comb_cuts/',
                snippet: 'Call +353 61 452 9811',
                sourceQuery: 'barber Limerick query 1',
                searchProvider: 'MockSearchProvider',
                isDemo: true
            },
            {
                title: 'Blade and Comb Barber Lounge Limerick',
                link: 'https://www.instagram.com/blade_comb_cuts/',
                snippet: 'Haircuts & hot towel shaves. Phone: +353 61 452 9811',
                sourceQuery: 'barber Limerick query 2',
                searchProvider: 'MockSearchProvider',
                isDemo: true
            }
        ];
        const leads = await LeadExtractorService_1.LeadExtractorService.extractFromResults(rawResults, 'Barber', 'Limerick');
        assert(leads.length === 1, `Batch deduplication kept 1 unique lead from 2 duplicates (got: ${leads.length})`);
        assert(leads[0].normalizedIdentityKey === 'ig:blade_comb_cuts' || leads[0].normalizedIdentityKey === 'phone:614529811', `Identity key is consistent (${leads[0].normalizedIdentityKey})`);
    }
    // ----------------------------------------------------
    // Test 9: Search result with missing phone
    // ----------------------------------------------------
    console.log('\nTest 9: Search result with missing phone');
    {
        const rawResult = {
            title: 'City Center Studio',
            link: 'https://www.instagram.com/citycenterstudio/',
            snippet: 'Creative tattoo and design studio in Limerick. Email us at hello@citycenterstudio.ie',
            sourceQuery: 'tattoo Limerick',
            searchProvider: 'MockSearchProvider',
            isDemo: true
        };
        const leads = await LeadExtractorService_1.LeadExtractorService.extractFromResults([rawResult], 'Tattoo', 'Limerick');
        const lead = leads[0];
        assert(lead.phone === null, `Missing phone must be strictly null (got: ${lead.phone})`);
        assert(lead.email === 'hello@citycenterstudio.ie', 'Email is correctly extracted');
        const parsedContactVerifications = JSON.parse(lead.contactVerifications);
        assert(parsedContactVerifications.phone.status === 'none', 'Phone contact verification status is "none"');
    }
    // ----------------------------------------------------
    // Test 10: Search result with missing email
    // ----------------------------------------------------
    console.log('\nTest 10: Search result with missing email');
    {
        const rawResult = {
            title: 'Rapid Flow Plumbers',
            link: 'https://www.facebook.com/rapidflowplumbing/',
            snippet: '24/7 Emergency plumbing repairs in Limerick. Call: +353 87 999 1234. No email booking.',
            sourceQuery: 'plumber Limerick',
            searchProvider: 'MockSearchProvider',
            isDemo: true
        };
        const leads = await LeadExtractorService_1.LeadExtractorService.extractFromResults([rawResult], 'Plumber', 'Limerick');
        const lead = leads[0];
        assert(lead.email === null, `Missing email must be strictly null (got: ${lead.email})`);
        assert(lead.phone === '+353 87 999 1234', 'Phone is accurately extracted');
        const parsedContactVerifications = JSON.parse(lead.contactVerifications);
        assert(parsedContactVerifications.email.status === 'none', 'Email contact verification status is "none"');
    }
    // ----------------------------------------------------
    // Bonus Check: Opportunity Score Safety Rules
    // ----------------------------------------------------
    console.log('\nBonus Check: Opportunity Score Safety Rules');
    {
        // Low validation confidence (<50)
        const lowConfResult = LeadScoringService_1.LeadScoringService.calculate({
            hasNoWebsite: true, // +40
            hasInstagram: true, // +15
            hasFacebook: true, // +5
            hasPhone: true, // +10
            hasEmail: true, // +10
            hasGoogleBusiness: true, // +10
            hasActiveSocial: true, // +5
            hasExistingWebsite: false
        }, 30 // Confidence: 30 (< 50)
        );
        assert(lowConfResult.score <= 30, `Validation < 50 caps Opportunity Score to max 30 (got: ${lowConfResult.score})`);
        assert(lowConfResult.tier === 'Low', `Score tier is Low when capped (got: ${lowConfResult.tier})`);
        // Moderate validation confidence (50-69)
        const modConfResult = LeadScoringService_1.LeadScoringService.calculate({
            hasNoWebsite: true,
            hasInstagram: true,
            hasFacebook: true,
            hasPhone: true,
            hasEmail: true,
            hasGoogleBusiness: true,
            hasActiveSocial: true,
            hasExistingWebsite: false
        }, 60 // Confidence: 60 (50-69)
        );
        assert(modConfResult.score <= 60, `Validation 50-69 caps Opportunity Score to max 60 (got: ${modConfResult.score})`);
        assert(modConfResult.tier === 'High' || modConfResult.tier === 'Medium', 'Tier clamped appropriately');
    }
    console.log('\n========================================');
    console.log(`Test Results: ${passCount} Passed, ${failCount} Failed`);
    console.log('========================================\n');
    if (failCount > 0) {
        process.exit(1);
    }
}
runTests().catch((err) => {
    console.error('Test execution error:', err);
    process.exit(1);
});
