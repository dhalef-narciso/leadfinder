"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeduplicationService = void 0;
class DeduplicationService {
    /**
     * Generates a deterministic normalized identity key.
     * Priority hierarchy:
     * 1. Google Place ID
     * 2. Google CID
     * 3. Clean Website Domain (non-social)
     * 4. Phone Number (digits fingerprint)
     * 5. Clean Instagram Handle
     * 6. Normalized Name + Address/Location
     */
    static generateIdentityKey(inputs) {
        // 1. Google Place ID (Strongest global identifier)
        if (inputs.googlePlaceId && inputs.googlePlaceId.trim().length > 3) {
            return `place:${inputs.googlePlaceId.trim()}`;
        }
        // 2. Google CID
        if (inputs.googleCid && inputs.googleCid.trim().length > 4) {
            return `cid:${inputs.googleCid.trim()}`;
        }
        // 3. Website Domain (if not generic/social)
        if (inputs.websiteUrl) {
            try {
                const url = new URL(inputs.websiteUrl.startsWith('http') ? inputs.websiteUrl : `https://${inputs.websiteUrl}`);
                const domain = url.hostname.replace(/^www\./, '').toLowerCase();
                if (domain &&
                    !domain.includes('instagram.com') &&
                    !domain.includes('facebook.com') &&
                    !domain.includes('google.com') &&
                    !domain.includes('tiktok.com') &&
                    !domain.includes('twitter.com')) {
                    return `web:${domain}`;
                }
            }
            catch {
                // ignore invalid URL
            }
        }
        // 4. Phone number digits (at least 7 digits)
        if (inputs.phone) {
            const digitsOnly = inputs.phone.replace(/[^0-9]/g, '');
            if (digitsOnly.length >= 7) {
                return `phone:${digitsOnly.slice(-9)}`;
            }
        }
        // 5. Clean Instagram Handle
        if (inputs.instagram) {
            const cleanIg = inputs.instagram
                .toLowerCase()
                .replace(/https?:\/\/(www\.)?instagram\.com\//, '')
                .replace(/[^a-z0-9_.]/g, '');
            if (cleanIg.length > 2) {
                return `ig:${cleanIg}`;
            }
        }
        // 6. Normalized Business Name + Clean Address or Location
        const cleanName = inputs.businessName
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents e.g. Café -> Cafe
            .replace(/^(the|a|an)\s+/i, '')
            .replace(/[^a-z0-9]/g, '');
        const addrOrLoc = (inputs.address || inputs.location)
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '');
        return `name_addr:${cleanName}_${addrOrLoc.slice(0, 30)}`;
    }
    /**
     * Merges two RawMapsBusiness records discovered for the same entity,
     * retaining the richest information.
     */
    static mergeMapsBusinesses(existing, incoming) {
        return {
            name: existing.name || incoming.name,
            category: existing.category || incoming.category,
            address: existing.address || incoming.address,
            phone: existing.phone || incoming.phone,
            website: existing.website || incoming.website,
            rating: existing.rating ?? incoming.rating,
            reviews: existing.reviews ?? incoming.reviews,
            latitude: existing.latitude ?? incoming.latitude,
            longitude: existing.longitude ?? incoming.longitude,
            placeId: existing.placeId || incoming.placeId,
            cid: existing.cid || incoming.cid,
            googleMapsUrl: existing.googleMapsUrl || incoming.googleMapsUrl,
            thumbnail: existing.thumbnail || incoming.thumbnail,
            openState: existing.openState || incoming.openState,
            operatingHours: existing.operatingHours || incoming.operatingHours,
            priceLevel: existing.priceLevel || incoming.priceLevel,
            description: existing.description || incoming.description,
            serviceOptions: existing.serviceOptions || incoming.serviceOptions,
            sourceQuery: `${existing.sourceQuery}, ${incoming.sourceQuery}`,
            sourceProvider: existing.sourceProvider,
            isDemo: existing.isDemo && incoming.isDemo
        };
    }
    /**
     * Deduplicates an array of RawMapsBusiness items
     */
    static deduplicateMapsBusinesses(items, location) {
        const map = new Map();
        for (const item of items) {
            const key = this.generateIdentityKey({
                businessName: item.name,
                location,
                address: item.address,
                googlePlaceId: item.placeId,
                googleCid: item.cid,
                websiteUrl: item.website,
                phone: item.phone
            });
            if (map.has(key)) {
                const existing = map.get(key);
                map.set(key, this.mergeMapsBusinesses(existing, item));
            }
            else {
                map.set(key, item);
            }
        }
        return Array.from(map.values());
    }
}
exports.DeduplicationService = DeduplicationService;
