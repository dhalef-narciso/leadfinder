"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsitePromptGenerator = void 0;
class WebsitePromptGenerator {
    static generate(lead) {
        const nicheLower = (lead.niche || lead.category || '').toLowerCase();
        const hasPhone = Boolean(lead.phone && lead.phone.trim().length > 0);
        const hasEmail = Boolean(lead.email && lead.email.trim().length > 0);
        const hasInstagram = Boolean(lead.instagram && lead.instagram.trim().length > 0);
        const hasFacebook = Boolean(lead.facebook && lead.facebook.trim().length > 0);
        const hasMaps = Boolean(lead.googleMapsUrl || lead.googleBusinessUrl || lead.address);
        const hasReviews = Boolean(lead.rating && lead.rating > 0);
        const hasWebsite = lead.websiteStatus === 'Website Found';
        // 1. PROJECT
        const projectSection = [
            '### PROJECT',
            `Create a modern, professional, high-converting landing page for ${lead.businessName}.`
        ].join('\n');
        // 2. BUSINESS INFORMATION (Strictly grounded - NO hallucinations)
        const bizInfoLines = [
            '### BUSINESS INFORMATION',
            `- Business Name: ${lead.businessName}`,
            `- Category / Industry: ${lead.niche || lead.category || 'Local Business'}`,
            `- Location / Market: ${lead.location}${lead.address ? ` (${lead.address})` : ''}`
        ];
        if (lead.description && lead.description.trim().length > 0) {
            bizInfoLines.push(`- Verified Description: "${lead.description.trim()}"`);
        }
        if (hasPhone) {
            bizInfoLines.push(`- Phone: ${lead.phone}`);
        }
        else {
            bizInfoLines.push('- Phone: [Not provided - display a clean contact form or placeholder phone format without fabricating]');
        }
        if (hasEmail) {
            bizInfoLines.push(`- Email: ${lead.email}`);
        }
        if (hasInstagram) {
            bizInfoLines.push(`- Instagram Profile: ${lead.instagram}`);
        }
        if (hasFacebook) {
            bizInfoLines.push(`- Facebook Profile: ${lead.facebook}`);
        }
        if (hasMaps) {
            const mapsUrl = lead.googleMapsUrl || lead.googleBusinessUrl;
            bizInfoLines.push(`- Google Maps / Location Info: ${mapsUrl ? mapsUrl : 'Location verified in ' + lead.location}`);
        }
        if (hasReviews) {
            bizInfoLines.push(`- Verified Google Rating: ${lead.rating} ★ (${lead.reviewsCount || 0} reviews on Google)`);
        }
        // Website status note
        if (!hasWebsite) {
            bizInfoLines.push('- Website Status: No existing professional website was detected during the research process. This demo should be designed as a new website concept.');
        }
        else if (lead.websiteUrl) {
            bizInfoLines.push(`- Current Website: ${lead.websiteUrl} (Design a refreshed, modern concept)`);
        }
        const businessInfoSection = bizInfoLines.join('\n');
        // 3. GOAL
        const goalSection = [
            '### GOAL',
            `The goal is to create a professional website concept that helps this local business attract customers in ${lead.location}, showcase its core offerings clearly, build immediate local trust, and make it seamless for visitors to get in touch or book.`
        ].join('\n');
        // 4. DESIGN DIRECTION (Niche-personalized style)
        let designVibe = 'Modern, clean, trustworthy, and high-converting';
        let designPaletteRecommendation = 'Select an appropriate, tasteful color palette suitable for this industry with strong contrast, sleek dark/light mode accents, and premium typography.';
        if (nicheLower.includes('barber') || nicheLower.includes('hair cut') || nicheLower.includes('barbershop')) {
            designVibe = 'Premium, masculine, modern, and editorial with crafted typography and sharp contrast';
            designPaletteRecommendation = 'Rich dark tones (charcoal, slate, deep bronze or amber accents) evoking an authentic artisanal barbershop atmosphere.';
        }
        else if (nicheLower.includes('cafe') || nicheLower.includes('café') || nicheLower.includes('coffee')) {
            designVibe = 'Warm, welcoming, modern, lifestyle-focused, and inviting';
            designPaletteRecommendation = 'Warm earthy neutrals, warm espresso/mocha tones, creamy backgrounds, and clean modern typography.';
        }
        else if (nicheLower.includes('restaurant') || nicheLower.includes('pub') || nicheLower.includes('bistro') || nicheLower.includes('dining')) {
            designVibe = 'Premium, appetizing, atmospheric, and elegant';
            designPaletteRecommendation = 'Sophisticated deep tones with warm mood lighting accents and tasteful food-and-beverage aesthetics.';
        }
        else if (nicheLower.includes('clean') || nicheLower.includes('cleaning')) {
            designVibe = 'Professional, trustworthy, sparkling clean, and reassuring';
            designPaletteRecommendation = 'Fresh whites, crisp blues or teals, and soft slate accents that communicate hygiene, reliability, and spotless quality.';
        }
        else if (nicheLower.includes('gym') || nicheLower.includes('fitness') || nicheLower.includes('trainer') || nicheLower.includes('crossfit')) {
            designVibe = 'Energetic, modern, strong, and motivating';
            designPaletteRecommendation = 'High-contrast athletic palette with dynamic dark bases and bold highlight accents that inspire momentum.';
        }
        else if (nicheLower.includes('beauty') || nicheLower.includes('nail') || nicheLower.includes('hairdresser') || nicheLower.includes('salon') || nicheLower.includes('tattoo')) {
            designVibe = 'Elegant, premium, refined, and aesthetic';
            designPaletteRecommendation = 'Chic minimalist palette with subtle neutral undertones, polished editorial typography, and high-end visual whitespace.';
        }
        else if (nicheLower.includes('plumb') || nicheLower.includes('electric') || nicheLower.includes('contractor') || nicheLower.includes('roof') || nicheLower.includes('carpenter') || nicheLower.includes('painter')) {
            designVibe = 'Professional, trustworthy, practical, and dependable';
            designPaletteRecommendation = 'Reliable navy, deep charcoal, and safety-orange or golden accenting that highlights certified craftsmanship and immediate contact options.';
        }
        const brandingGuidance = (hasInstagram || hasFacebook)
            ? 'Use the publicly available branding and visual identity of the business as inspiration (do not invent arbitrary brand claims or scrape private data).'
            : 'Lovable should select a polished, industry-appropriate palette and clean Google Font pairing.';
        const designSection = [
            '### DESIGN DIRECTION',
            `- Aesthetic Vibe: ${designVibe}`,
            `- Palette & Typography: ${designPaletteRecommendation}`,
            `- Branding Guidance: ${brandingGuidance}`,
            '- Layout Style: Sleek modern cards, subtle depth, smooth hover micro-animations, accessible color contrast (WCAG AA compliant).'
        ].join('\n');
        // 5. PAGE STRUCTURE (Niche-specific)
        const pageStructureLines = ['### PAGE STRUCTURE'];
        if (nicheLower.includes('barber') || nicheLower.includes('barbershop')) {
            pageStructureLines.push('1. **Hero Section**: Strong headline, tagline featuring location, background visual treatment, and primary "Book Appointment" / "Call Now" CTA.');
            pageStructureLines.push('2. **Services**: Clean layout highlighting signature cuts, beard grooming, and hot towel treatments (use generic service placeholders clearly marked for owner customization).');
            pageStructureLines.push('3. **About / Craft**: Brief narrative emphasizing master barbers and community atmosphere.');
            pageStructureLines.push('4. **Gallery / Portfolio Showcase**: High-impact visual grid showcasing crisp fades, cuts, and shop atmosphere.');
            if (hasReviews) {
                pageStructureLines.push(`5. **Verified Customer Reviews**: Real Google rating badge (${lead.rating}★ rating, ${lead.reviewsCount || 0} reviews) with authentic feedback section.`);
            }
            if (hasMaps || lead.address) {
                pageStructureLines.push(`6. **Location & Directions**: Interactive map placeholder, address (${lead.address || lead.location}), and transit/parking guidance.`);
            }
            pageStructureLines.push(`7. **Contact & Booking CTA**: Final prominent action block with ${hasPhone ? 'Click-to-Call (' + lead.phone + ') and WhatsApp CTA' : 'appointment inquiry form'}.`);
        }
        else if (nicheLower.includes('cafe') || nicheLower.includes('café') || nicheLower.includes('coffee') || nicheLower.includes('restaurant') || nicheLower.includes('pub')) {
            pageStructureLines.push('1. **Hero Section**: Warm, welcoming imagery/video background, opening hook, and "View Offerings" / "Find Us" CTAs.');
            pageStructureLines.push('2. **About Us**: The story of the venue, commitment to fresh ingredients, and welcoming hospitality in ' + lead.location + '.');
            pageStructureLines.push('3. **Featured Offerings**: Visual menu highlight cards (coffee, artisan food, daily specials) with clean layout.');
            pageStructureLines.push('4. **Atmosphere & Gallery**: Visual mosaic celebrating the interior ambiance and fresh daily preparations.');
            if (hasReviews) {
                pageStructureLines.push(`5. **Customer Feedback**: Display verified rating of ${lead.rating}★ from ${lead.reviewsCount || 0} Google reviews.`);
            }
            if (hasMaps || lead.address) {
                pageStructureLines.push(`6. **Find Us / Location**: Map container, verified location (${lead.address || lead.location}), and "Get Directions" button.`);
            }
            pageStructureLines.push('7. **Footer & Contact**: Hours, social channels, and booking/table inquiry CTA.');
        }
        else if (nicheLower.includes('clean') || nicheLower.includes('cleaning')) {
            pageStructureLines.push('1. **Hero Section**: Reassuring headline focusing on spotless, reliable cleaning in ' + lead.location + ', with "Get a Free Quote" primary CTA.');
            pageStructureLines.push('2. **Services Breakdown**: Clean 2-column or 3-column cards covering Residential & Commercial services.');
            pageStructureLines.push('3. **Why Choose Us**: Trust triggers (insured, vetted staff, satisfaction guarantee, eco-friendly supplies).');
            pageStructureLines.push('4. **Service Areas**: Clear coverage notice focused around ' + lead.location + ' and surrounding districts.');
            pageStructureLines.push('5. **About the Business**: Dedicated local team providing reliable, dependable service.');
            if (hasReviews) {
                pageStructureLines.push(`6. **Verified Reviews**: Authentic Google feedback badge (${lead.rating}★ across ${lead.reviewsCount || 0} reviews).`);
            }
            pageStructureLines.push(`7. **Instant Quote / Contact**: Streamlined quote request form + ${hasPhone ? 'Instant WhatsApp / Phone CTA (' + lead.phone + ')' : 'contact form'}.`);
        }
        else if (nicheLower.includes('plumb') || nicheLower.includes('electric') || nicheLower.includes('contractor') || nicheLower.includes('roof') || nicheLower.includes('carpenter') || nicheLower.includes('painter')) {
            pageStructureLines.push('1. **Hero Section**: Urgent, trustworthy trade header with instant "Emergency Call" / "Request Quote" buttons and location focus.');
            pageStructureLines.push('2. **Core Services**: Service grid (repairs, maintenance, new installations, emergency diagnostic visits).');
            pageStructureLines.push('3. **Why Choose Us**: Key trust badges (certified, fast response, transparent pricing, fully insured).');
            pageStructureLines.push('4. **Service Coverage**: Areas served in and around ' + lead.location + '.');
            pageStructureLines.push('5. **About**: Experienced local trade professionals dedicated to high quality workmanship.');
            if (hasReviews) {
                pageStructureLines.push(`6. **Verified Reputation**: Google rating showcase (${lead.rating}★ from ${lead.reviewsCount || 0} verified customers).`);
            }
            pageStructureLines.push(`7. **Direct Contact CTA**: High-visibility contact block with ${hasPhone ? 'one-tap Click-to-Call (' + lead.phone + ') and Quote Request Form' : 'Quote Request Form'}.`);
        }
        else if (nicheLower.includes('gym') || nicheLower.includes('fitness') || nicheLower.includes('trainer')) {
            pageStructureLines.push('1. **Hero Section**: High-energy hero with strong motivational hook, membership / free session CTA, and location tag.');
            pageStructureLines.push('2. **Programs & Training**: Training options (1-on-1 coaching, group classes, strength conditioning).');
            pageStructureLines.push('3. **The Facility / Benefits**: Modern equipment, personalized support, supportive community.');
            pageStructureLines.push('4. **About the Coaches**: Passionate trainers committed to sustainable fitness transformations.');
            if (hasReviews) {
                pageStructureLines.push(`5. **Member Results & Reviews**: Google review badge (${lead.rating}★ rating, ${lead.reviewsCount || 0} verified reviews).`);
            }
            if (hasMaps || lead.address) {
                pageStructureLines.push(`6. **Location & Schedule**: Address (${lead.address || lead.location}) and visit info.`);
            }
            pageStructureLines.push('7. **Join / Trial CTA**: Fast action form to claim a free initial consultation or session.');
        }
        else if (nicheLower.includes('beauty') || nicheLower.includes('nail') || nicheLower.includes('salon') || nicheLower.includes('tattoo')) {
            pageStructureLines.push('1. **Hero Section**: Editorial aesthetic header with refined typography, high-fashion styling, and "Book Treatment" CTA.');
            pageStructureLines.push('2. **Treatment Menu**: Elegant categorized services listing.');
            pageStructureLines.push('3. **Visual Gallery / Works**: Grid showcasing intricate work, studio hygiene, and client transformations.');
            pageStructureLines.push('4. **About the Artists / Studio**: Passion for precision, hygiene, and personalized aesthetic care.');
            if (hasReviews) {
                pageStructureLines.push(`5. **Client Love**: Verified Google reviews section (${lead.rating}★ from ${lead.reviewsCount || 0} clients).`);
            }
            if (hasInstagram) {
                pageStructureLines.push(`6. **Instagram Showcase**: "Follow our work on Instagram" CTA leading to ${lead.instagram}.`);
            }
            pageStructureLines.push(`7. **Appointment CTA**: Clean booking request or ${hasPhone ? 'direct WhatsApp / Call CTA (' + lead.phone + ')' : 'contact form'}.`);
        }
        else {
            // Dynamic generic structure
            pageStructureLines.push('1. **Hero Section**: Compelling value proposition for ' + lead.businessName + ' in ' + lead.location + ' with primary CTA.');
            pageStructureLines.push('2. **Services / Solutions**: Key offerings tailored to ' + (lead.niche || 'local customers') + '.');
            pageStructureLines.push('3. **Why Choose Us**: Core differentiators, reliability, local expertise in ' + lead.location + '.');
            pageStructureLines.push('4. **About**: Authentic background on the business and commitment to client satisfaction.');
            if (hasReviews) {
                pageStructureLines.push(`5. **Verified Customer Feedback**: Google rating highlight (${lead.rating}★ from ${lead.reviewsCount || 0} reviews).`);
            }
            if (hasMaps || lead.address) {
                pageStructureLines.push(`6. **Location & Service Area**: Clear map and address details (${lead.address || lead.location}).`);
            }
            pageStructureLines.push(`7. **Contact / Inquiry CTA**: Simple contact form and ${hasPhone ? 'direct phone call (' + lead.phone + ')' : 'inquiry method'}.`);
        }
        const pageStructureSection = pageStructureLines.join('\n');
        // 6. FUNCTIONAL REQUIREMENTS
        const funcReqs = [
            '### FUNCTIONAL REQUIREMENTS',
            '- Sticky navigation header with business branding and quick contact CTA button.',
            '- Mobile navigation drawer with smooth animation.',
            '- Contact form with front-end validation (Name, Email / Phone, Message).'
        ];
        if (lead.phone) {
            const cleanPhone = lead.phone.replace(/[^0-9+]/g, '');
            funcReqs.push(`- Click-to-call link for tel:${cleanPhone} on mobile and desktop.`);
            funcReqs.push(`- WhatsApp chat CTA button linking directly to WhatsApp using the verified phone number.`);
        }
        if (hasMaps) {
            funcReqs.push('- Embedded responsive map section or styled map card with a "Get Directions" link opening Google Maps.');
        }
        if (lead.instagram) {
            funcReqs.push(`- Social link button to Instagram: ${lead.instagram}.`);
        }
        if (lead.facebook) {
            funcReqs.push(`- Social link button to Facebook: ${lead.facebook}.`);
        }
        const functionalSection = funcReqs.join('\n');
        // 7. LOCAL SEO
        const localSeoSection = [
            '### LOCAL SEO',
            `- Page Title: "${lead.businessName} | Premier ${lead.niche} in ${lead.location}"`,
            `- Meta Description: "Discover ${lead.businessName} in ${lead.location}. Top-rated ${lead.niche} services. Contact us today${hasPhone ? ' at ' + lead.phone : ''}."`,
            '- Semantic HTML5 tags (<header>, <main>, <section>, <article>, <footer>, <nav>).',
            '- Single <h1> tag containing the business name and core niche/location.',
            '- Schema.org JSON-LD LocalBusiness markup ready for inclusion.',
            '- Open Graph meta tags (og:title, og:description, og:type=business.business, og:locale=en_IE).'
        ].join('\n');
        // 8. RESPONSIVENESS
        const responsivenessSection = [
            '### RESPONSIVENESS',
            '- Strictly Mobile-First responsive design.',
            '- Seamless adaptation across mobile screens (375px+), tablets (768px+), and desktops (1200px+).',
            '- Touch-friendly interactive targets (minimum 44x44px for buttons and inputs).',
            '- Smooth typography scaling using clamp() or fluid responsive utility classes.'
        ].join('\n');
        // 9. CTA REQUIREMENTS
        const ctaReqs = [
            '### CTA REQUIREMENTS',
            '- Primary CTA: High-contrast, easily noticeable button above the fold.',
            '- Secondary CTA: Outlined or subtle button for low-friction exploration.'
        ];
        if (hasPhone) {
            ctaReqs.push(`- Mobile Bottom Bar or Floating Action: Direct "Call Now" or "WhatsApp" button.`);
        }
        const ctaSection = ctaReqs.join('\n');
        // 10. CONTENT RULES (CRITICAL DATA SAFETY)
        const contentRules = [
            '### CONTENT RULES & DATA INTEGRITY',
            '1. DO NOT fabricate or invent opening hours if none were provided above.',
            '2. DO NOT fabricate specific pricing figures unless explicitly listed.',
            '3. DO NOT fabricate fake client testimonials or reviews; only reference the verified Google rating and review count provided.',
            '4. DO NOT invent false certifications, awards, or claims like "family owned since 1950" unless present in the verified description.',
            '5. For any services not explicitly enumerated, use clear, industry-standard placeholder labels designed for the business owner to easily customize.',
            '6. Maintain a positive, professional tone that positions this business as the leading choice in its locality.'
        ].join('\n');
        return [
            projectSection,
            '',
            businessInfoSection,
            '',
            goalSection,
            '',
            designSection,
            '',
            pageStructureSection,
            '',
            functionalSection,
            '',
            localSeoSection,
            '',
            responsivenessSection,
            '',
            ctaSection,
            '',
            contentRules
        ].join('\n');
    }
}
exports.WebsitePromptGenerator = WebsitePromptGenerator;
