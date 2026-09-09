"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockMapsProvider = void 0;
const MOCK_MAPS_TEMPLATES = {
    cafe: {
        namePrefixes: ['The Roasted Bean', 'Artisan Corner', 'Wild Honey', 'Copper Kettle', 'Urban Brew', 'The Daily Grind', 'Morning Glory', 'Velvet Cup', 'Bean & Leaf', 'Old Town', 'Market Green', 'Riverbank', 'Aroma Craft', 'Harvest', 'Bluebell'],
        nameSuffixes: ['Cafe', 'Coffee Roasters', 'Espresso Bar', 'Bakery & Cafe', 'Coffee House', 'Deli & Cafe', 'Tea Rooms', 'Kitchen & Coffee'],
        categories: ['Cafe', 'Coffee shop', 'Bakery', 'Breakfast restaurant', 'Espresso bar'],
        streets: ['O\'Connell Street', 'Abbey Street', 'High Street', 'Market Square', 'Parnell Street', 'Bank Place', 'Mill Road', 'Church Street', 'Bridge Street'],
        hasWebsiteProb: 0.35,
        hasPhoneProb: 0.90
    },
    barber: {
        namePrefixes: ['The Barber\'s Club', 'Blade & Comb', 'True Cut', 'Vintage Fade', 'Heritage Grooming', 'Crown & Razor', 'The Men\'s Room', 'Anchor', 'Urban Sharp', 'Executive', 'Classic Cuts', 'Slick Styles', 'Apex'],
        nameSuffixes: ['Barbershop', 'Barbers', 'Grooming Lounge', 'Barber Co.', 'Hair Studio', 'Traditional Barbers'],
        categories: ['Barber shop', 'Hair salon', 'Men\'s hair salon'],
        streets: ['O\'Connell Street', 'Market Street', 'Francis Street', 'Dock Road', 'William Street', 'Patrick Street', 'George\'s Quay'],
        hasWebsiteProb: 0.20,
        hasPhoneProb: 0.95
    },
    restaurant: {
        namePrefixes: ['The Rustic Table', 'Olive & Fig', 'The Copper Pot', 'Harbor View', 'Bistro 24', 'Old Ground', 'Wild Atlantic', 'Cedar Tree', 'Corner Bistro', 'The Gilded Lily', 'Oak & Stone'],
        nameSuffixes: ['Restaurant', 'Bistro', 'Kitchen & Bar', 'Grill', 'Trattoria', 'Eatery', 'Dining Room'],
        categories: ['Restaurant', 'Bistro', 'European restaurant', 'Modern Irish restaurant', 'Seafood restaurant'],
        streets: ['Main Street', 'Quay Street', 'Abbey Street', 'Market Square', 'Castle Street', 'Shannon Road'],
        hasWebsiteProb: 0.50,
        hasPhoneProb: 0.95
    },
    plumber: {
        namePrefixes: ['Rapid Flow', 'Apex Plumbing', 'City & County', 'SureFlow', 'Prime Gas', 'Direct Heating', 'Blue Pipe', 'EcoPlumb', 'O\'Brien & Sons'],
        nameSuffixes: ['Plumbing & Heating', 'Plumbing Services', 'Emergency Plumbers', 'Drain Services', 'Gas Contractors'],
        categories: ['Plumber', 'Heating contractor', 'Gas engineer', 'Drainage service'],
        streets: ['Industrial Estate', 'Ballycorey', 'Clonroad', 'Quin Road Business Park', 'Smithstown'],
        hasWebsiteProb: 0.25,
        hasPhoneProb: 0.98
    }
};
class MockMapsProvider {
    providerName = 'MockMapsProvider';
    async search(query, location, options) {
        const targetLimit = Math.min(options?.limit || 25, 100);
        const cleanQuery = query.toLowerCase();
        // Find matching template
        let matchedTemplate = MOCK_MAPS_TEMPLATES.cafe;
        for (const key of Object.keys(MOCK_MAPS_TEMPLATES)) {
            if (cleanQuery.includes(key)) {
                matchedTemplate = MOCK_MAPS_TEMPLATES[key];
                break;
            }
        }
        const cleanLocation = location.split(',')[0].trim() || 'Ennis';
        const businesses = [];
        let count = 0;
        for (let p = 0; p < matchedTemplate.namePrefixes.length; p++) {
            for (let s = 0; s < matchedTemplate.nameSuffixes.length; s++) {
                if (businesses.length >= targetLimit)
                    break;
                const prefix = matchedTemplate.namePrefixes[p];
                const suffix = matchedTemplate.nameSuffixes[s];
                const businessName = `${prefix} ${suffix}`;
                const street = matchedTemplate.streets[(p + s) % matchedTemplate.streets.length];
                const address = `${street}, ${cleanLocation}, Co. Clare, Ireland`;
                const category = matchedTemplate.categories[(p + s) % matchedTemplate.categories.length];
                const hasWebsite = ((p * 7 + s * 13) % 100) < (matchedTemplate.hasWebsiteProb * 100);
                const hasPhone = ((p * 11 + s * 17) % 100) < (matchedTemplate.hasPhoneProb * 100);
                const rating = Number((4.0 + ((p * 3 + s * 5) % 10) / 10).toFixed(1));
                const reviews = 15 + ((p * 23 + s * 37) % 450);
                const slug = businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
                const placeId = `ChIJ_mock_${cleanLocation.toLowerCase()}_${slug.slice(0, 16)}`;
                const cid = `10${Math.floor(1000000000000000 + (p + s * 1000) * 8923412)}`;
                const phone = hasPhone
                    ? `+353 65 ${680 + (p % 20)} ${1000 + (s * 111) % 9000}`
                    : null;
                const website = hasWebsite
                    ? `https://www.${slug}.ie`
                    : null;
                businesses.push({
                    name: businessName,
                    category,
                    address,
                    phone,
                    website,
                    rating,
                    reviews,
                    latitude: 52.84 + (p % 10) * 0.005,
                    longitude: -8.98 - (s % 10) * 0.005,
                    placeId,
                    cid,
                    googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
                    thumbnail: null,
                    openState: 'Open now',
                    operatingHours: {
                        monday: '8:30 AM – 5:30 PM',
                        tuesday: '8:30 AM – 5:30 PM',
                        wednesday: '8:30 AM – 5:30 PM',
                        thursday: '8:30 AM – 5:30 PM',
                        friday: '8:30 AM – 5:30 PM',
                        saturday: '9:00 AM – 5:00 PM',
                        sunday: 'Closed'
                    },
                    priceLevel: '€€',
                    description: `Premier ${category.toLowerCase()} serving ${cleanLocation} with high customer satisfaction.`,
                    serviceOptions: { dine_in: true, takeout: true },
                    sourceQuery: query,
                    sourceProvider: this.providerName,
                    isDemo: true
                });
                count++;
            }
            if (businesses.length >= targetLimit)
                break;
        }
        return businesses;
    }
}
exports.MockMapsProvider = MockMapsProvider;
