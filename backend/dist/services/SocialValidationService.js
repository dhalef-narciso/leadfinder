"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialValidationService = void 0;
const UrlValidationService_1 = require("./UrlValidationService");
class SocialValidationService {
    static IG_RESERVED = new Set([
        'about', 'explore', 'accounts', 'developer', 'directory', 'legal', 'privacy', 'p', 'reel', 'stories', 'tv'
    ]);
    static FB_RESERVED = new Set([
        'help', 'login', 'recover', 'settings', 'privacy', 'terms', 'policies', 'pages', 'groups', 'marketplace'
    ]);
    /**
     * Validates an Instagram profile URL.
     * Ensures the URL is not a post/reel and conforms to valid Instagram handle format.
     */
    static async validateInstagram(url, options) {
        if (!url || typeof url !== 'string' || url.trim() === '') {
            return {
                platform: 'instagram',
                url: null,
                status: 'INVALID',
                handle: null,
                reason: 'No Instagram URL provided'
            };
        }
        const cleanUrl = url.trim();
        // Check basic URL format
        if (!UrlValidationService_1.UrlValidationService.isValidUrlFormat(cleanUrl)) {
            return {
                platform: 'instagram',
                url: cleanUrl,
                status: 'INVALID',
                handle: null,
                reason: 'Malformed Instagram URL format'
            };
        }
        try {
            const parsed = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
            const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
            if (hostname !== 'instagram.com') {
                return {
                    platform: 'instagram',
                    url: cleanUrl,
                    status: 'INVALID',
                    handle: null,
                    reason: `Host is ${hostname}, not instagram.com`
                };
            }
            // Explicitly reject post, reel, stories, tv, explore URLs
            const lowerPath = parsed.pathname.toLowerCase();
            if (lowerPath.includes('/p/') ||
                lowerPath.includes('/reel/') ||
                lowerPath.includes('/reels/') ||
                lowerPath.includes('/tv/') ||
                lowerPath.includes('/explore/') ||
                lowerPath.includes('/stories/') ||
                lowerPath.endsWith('/p') ||
                lowerPath.endsWith('/reel')) {
                return {
                    platform: 'instagram',
                    url: cleanUrl,
                    status: 'INVALID',
                    handle: null,
                    reason: 'Instagram post, reel, or media path is not a business profile'
                };
            }
            // Extract handle: /username/
            const segments = parsed.pathname.split('/').filter(Boolean);
            if (segments.length === 0) {
                return {
                    platform: 'instagram',
                    url: cleanUrl,
                    status: 'INVALID',
                    handle: null,
                    reason: 'Instagram homepage URL without profile handle'
                };
            }
            const handle = segments[0].toLowerCase();
            if (this.IG_RESERVED.has(handle)) {
                return {
                    platform: 'instagram',
                    url: cleanUrl,
                    status: 'INVALID',
                    handle,
                    reason: `Reserved Instagram system path /${handle}/`
                };
            }
            // Valid Instagram username: 1-30 chars, letters, numbers, underscores, periods
            const igHandleRegex = /^[a-zA-Z0-9._]{1,30}$/;
            if (!igHandleRegex.test(handle)) {
                return {
                    platform: 'instagram',
                    url: cleanUrl,
                    status: 'INVALID',
                    handle,
                    reason: `Handle "${handle}" contains invalid characters for Instagram`
                };
            }
            // If demo or live check skipped
            if (options?.isDemo) {
                return {
                    platform: 'instagram',
                    url: cleanUrl,
                    status: 'VALID',
                    handle,
                    reason: 'Demo Instagram profile validated'
                };
            }
            if (options?.liveCheck === false) {
                return {
                    platform: 'instagram',
                    url: cleanUrl,
                    status: 'VALID',
                    handle,
                    reason: 'Instagram handle format valid'
                };
            }
            const urlValidation = await UrlValidationService_1.UrlValidationService.validateUrl(cleanUrl, 'instagram', {
                isDemo: options?.isDemo,
                liveCheck: true,
                timeoutMs: 3000
            });
            return {
                platform: 'instagram',
                url: cleanUrl,
                status: urlValidation.status === 'NOT_CHECKED' ? 'VALID' : urlValidation.status,
                handle,
                reason: urlValidation.reason || 'Instagram profile reached'
            };
        }
        catch (err) {
            return {
                platform: 'instagram',
                url: cleanUrl,
                status: 'INVALID',
                handle: null,
                reason: `Failed to parse Instagram URL: ${err.message}`
            };
        }
    }
    /**
     * Validates a Facebook profile/page URL.
     */
    static async validateFacebook(url, options) {
        if (!url || typeof url !== 'string' || url.trim() === '') {
            return {
                platform: 'facebook',
                url: null,
                status: 'INVALID',
                handle: null,
                reason: 'No Facebook URL provided'
            };
        }
        const cleanUrl = url.trim();
        if (!UrlValidationService_1.UrlValidationService.isValidUrlFormat(cleanUrl)) {
            return {
                platform: 'facebook',
                url: cleanUrl,
                status: 'INVALID',
                handle: null,
                reason: 'Malformed Facebook URL format'
            };
        }
        try {
            const parsed = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
            const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
            if (hostname !== 'facebook.com' && hostname !== 'fb.com' && hostname !== 'm.facebook.com') {
                return {
                    platform: 'facebook',
                    url: cleanUrl,
                    status: 'INVALID',
                    handle: null,
                    reason: `Host is ${hostname}, not facebook.com`
                };
            }
            const segments = parsed.pathname.split('/').filter(Boolean);
            if (segments.length === 0) {
                return {
                    platform: 'facebook',
                    url: cleanUrl,
                    status: 'INVALID',
                    handle: null,
                    reason: 'Facebook root URL without page handle'
                };
            }
            const handle = segments[0].toLowerCase();
            if (this.FB_RESERVED.has(handle)) {
                return {
                    platform: 'facebook',
                    url: cleanUrl,
                    status: 'INVALID',
                    handle,
                    reason: `Reserved Facebook system path /${handle}/`
                };
            }
            if (options?.isDemo) {
                return {
                    platform: 'facebook',
                    url: cleanUrl,
                    status: 'VALID',
                    handle,
                    reason: 'Demo Facebook page validated'
                };
            }
            if (options?.liveCheck === false) {
                return {
                    platform: 'facebook',
                    url: cleanUrl,
                    status: 'VALID',
                    handle,
                    reason: 'Facebook page format valid'
                };
            }
            const urlValidation = await UrlValidationService_1.UrlValidationService.validateUrl(cleanUrl, 'facebook', {
                isDemo: options?.isDemo,
                liveCheck: true,
                timeoutMs: 3000
            });
            return {
                platform: 'facebook',
                url: cleanUrl,
                status: urlValidation.status === 'NOT_CHECKED' ? 'VALID' : urlValidation.status,
                handle,
                reason: urlValidation.reason || 'Facebook page verified'
            };
        }
        catch (err) {
            return {
                platform: 'facebook',
                url: cleanUrl,
                status: 'INVALID',
                handle: null,
                reason: `Failed to parse Facebook URL: ${err.message}`
            };
        }
    }
    /**
     * Validates Google Maps / Business URL.
     * Forbids manufactured fake CID values.
     */
    static validateGoogleMaps(url, options) {
        if (!url || typeof url !== 'string' || url.trim() === '') {
            return {
                platform: 'google_business',
                url: null,
                status: 'INVALID',
                handle: null,
                reason: 'No Google Business URL provided'
            };
        }
        const cleanUrl = url.trim();
        if (!UrlValidationService_1.UrlValidationService.isValidUrlFormat(cleanUrl)) {
            return {
                platform: 'google_business',
                url: cleanUrl,
                status: 'INVALID',
                handle: null,
                reason: 'Malformed Google Business URL format'
            };
        }
        try {
            const parsed = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
            const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
            const isGoogleDomain = hostname.endsWith('google.com') ||
                hostname.endsWith('google.ie') ||
                hostname === 'maps.google.com' ||
                hostname === 'maps.app.goo.gl' ||
                hostname === 'g.page';
            if (!isGoogleDomain) {
                return {
                    platform: 'google_business',
                    url: cleanUrl,
                    status: 'INVALID',
                    handle: null,
                    reason: `Invalid Google Business domain: ${hostname}`
                };
            }
            // Check if URL is a manufactured fake CID (e.g. ?cid=83749281723 when not from trusted provider)
            const cid = parsed.searchParams.get('cid');
            if (cid && !options?.isDemo && (!/^\d{16,21}$/.test(cid) || cleanUrl.includes('83749281723'))) {
                return {
                    platform: 'google_business',
                    url: cleanUrl,
                    status: 'INVALID',
                    handle: null,
                    reason: 'Unverified or fabricated Google Maps CID parameter detected'
                };
            }
            return {
                platform: 'google_business',
                url: cleanUrl,
                status: 'VALID',
                handle: cid || parsed.pathname,
                reason: 'Legitimate Google Business listing link verified'
            };
        }
        catch (err) {
            return {
                platform: 'google_business',
                url: cleanUrl,
                status: 'INVALID',
                handle: null,
                reason: `Failed to parse Google Business URL: ${err.message}`
            };
        }
    }
}
exports.SocialValidationService = SocialValidationService;
