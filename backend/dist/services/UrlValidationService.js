"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlValidationService = void 0;
class UrlValidationService {
    /**
     * Basic syntax and hostname validation.
     */
    static isValidUrlFormat(urlStr) {
        if (!urlStr || typeof urlStr !== 'string')
            return false;
        try {
            const url = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
            if (url.protocol !== 'http:' && url.protocol !== 'https:')
                return false;
            if (!url.hostname || !url.hostname.includes('.'))
                return false;
            if (url.hostname.endsWith('.'))
                return false;
            // Hostname cannot have invalid characters
            const hostnameRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return hostnameRegex.test(url.hostname);
        }
        catch {
            return false;
        }
    }
    /**
     * Validates a single URL with optional network reachability check.
     */
    static async validateUrl(urlStr, source = 'search_result', options) {
        const lastChecked = new Date().toISOString();
        if (!urlStr || typeof urlStr !== 'string' || urlStr.trim() === '') {
            return {
                url: '',
                status: 'INVALID',
                lastChecked,
                source,
                reason: 'Empty URL'
            };
        }
        const cleanUrl = urlStr.trim();
        if (!this.isValidUrlFormat(cleanUrl)) {
            return {
                url: cleanUrl,
                status: 'INVALID',
                lastChecked,
                source,
                reason: 'Malformed URL format or invalid domain'
            };
        }
        const normalizedUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
        // Demo data handling: do not perform external network calls for mock/demo domains
        if (options?.isDemo) {
            return {
                url: normalizedUrl,
                status: 'VALID',
                lastChecked,
                source,
                reason: 'Demo URL format verified'
            };
        }
        // If live check is disabled, return NOT_CHECKED or VALID based on syntax
        if (options?.liveCheck === false) {
            return {
                url: normalizedUrl,
                status: 'NOT_CHECKED',
                lastChecked,
                source,
                reason: 'Format valid, live check skipped'
            };
        }
        // Perform lightweight HTTP reachability check with timeout
        const timeoutMs = options?.timeoutMs || 2500;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
            // Try HEAD first, fall back to GET if HEAD method not allowed
            let response = await fetch(normalizedUrl, {
                method: 'HEAD',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) LeadFinder/1.0'
                }
            });
            if (response.status === 405 || response.status === 501) {
                response = await fetch(normalizedUrl, {
                    method: 'GET',
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) LeadFinder/1.0'
                    }
                });
            }
            clearTimeout(timeoutId);
            if (response.status >= 200 && response.status < 400) {
                return {
                    url: normalizedUrl,
                    status: 'VALID',
                    lastChecked,
                    source,
                    httpStatus: response.status,
                    reason: `Resolved with HTTP ${response.status}`
                };
            }
            if (response.status === 404 || response.status === 410) {
                return {
                    url: normalizedUrl,
                    status: 'INVALID',
                    lastChecked,
                    source,
                    httpStatus: response.status,
                    reason: `Resource not found (HTTP ${response.status})`
                };
            }
            // 403, 429 or 5xx: host exists but blocked or transiently failing
            return {
                url: normalizedUrl,
                status: 'UNREACHABLE',
                lastChecked,
                source,
                httpStatus: response.status,
                reason: `Server returned status HTTP ${response.status}`
            };
        }
        catch (err) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
                return {
                    url: normalizedUrl,
                    status: 'UNREACHABLE',
                    lastChecked,
                    source,
                    reason: 'Request timed out'
                };
            }
            // Check for DNS failure / NXDOMAIN
            const msg = err.message || '';
            if (msg.includes('ENOTFOUND') || msg.includes('getaddrinfo')) {
                return {
                    url: normalizedUrl,
                    status: 'INVALID',
                    lastChecked,
                    source,
                    reason: 'Domain does not resolve (DNS lookup failed)'
                };
            }
            return {
                url: normalizedUrl,
                status: 'UNREACHABLE',
                lastChecked,
                source,
                reason: `Connection error: ${err.message || 'Network failure'}`
            };
        }
    }
}
exports.UrlValidationService = UrlValidationService;
