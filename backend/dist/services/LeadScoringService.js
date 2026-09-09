"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadScoringService = void 0;
class LeadScoringService {
    static calculate(factors, validationConfidence) {
        const confidence = factors.validationConfidence !== undefined ? factors.validationConfidence : (validationConfidence ?? 85);
        let score = 0;
        const reasons = [];
        // Scoring calculation rules as specified:
        if (factors.hasNoWebsite) {
            score += 40;
            reasons.push('No professional website detected (+40)');
        }
        else if (factors.hasExistingWebsite) {
            score -= 40;
            reasons.push('Existing professional website already in place (-40)');
        }
        if (factors.hasInstagram) {
            score += 15;
            reasons.push('Active Instagram presence found (+15)');
        }
        if (factors.hasFacebook) {
            score += 5;
            reasons.push('Facebook business presence detected (+5)');
        }
        if (factors.hasPhone) {
            score += 10;
            reasons.push('Direct telephone number available (+10)');
        }
        if (factors.hasEmail) {
            score += 10;
            reasons.push('Business email contact identified (+10)');
        }
        if (factors.hasGoogleBusiness) {
            score += 10;
            reasons.push('Google Business listing presence confirmed (+10)');
        }
        if (factors.hasActiveSocial) {
            score += 5;
            reasons.push('Recent social activity and followers (+5)');
        }
        // Opportunity Score Safety Rules:
        // Never assign a Very High opportunity score to a lead with low validation confidence.
        let maxAllowedScore = 100;
        if (confidence < 50) {
            maxAllowedScore = 30;
            if (score > 30) {
                reasons.push(`Opportunity score capped at 30 due to low validation confidence (${confidence}/100)`);
            }
        }
        else if (confidence < 70) {
            maxAllowedScore = 60;
            if (score > 60) {
                reasons.push(`Opportunity score capped at 60 due to moderate validation confidence (${confidence}/100)`);
            }
        }
        // Clamp score between 0 and maxAllowedScore
        score = Math.max(0, Math.min(maxAllowedScore, score));
        // Classify tier based on final clamped score
        let tier;
        if (score >= 80) {
            tier = 'Very High';
        }
        else if (score >= 60) {
            tier = 'High';
        }
        else if (score >= 40) {
            tier = 'Medium';
        }
        else {
            tier = 'Low';
        }
        // Build human readable explanation
        let highlights = [];
        if (factors.hasNoWebsite)
            highlights.push('no professional website was detected');
        if (factors.hasInstagram && factors.hasActiveSocial)
            highlights.push('Instagram is active');
        else if (factors.hasInstagram)
            highlights.push('Instagram profile is established');
        if (factors.hasPhone)
            highlights.push('a phone number is available');
        if (factors.hasEmail)
            highlights.push('direct email is present');
        if (factors.hasGoogleBusiness)
            highlights.push('Google Business presence exists');
        let summary = '';
        if (factors.hasExistingWebsite) {
            summary = `Lower opportunity because an active professional website was already detected. Consider reaching out for a redesign or SEO audit.`;
        }
        else if (confidence < 50 && score <= 30) {
            summary = `Opportunity restricted to Low (${score}/100) because validation confidence is low (${confidence}%).`;
        }
        else if (highlights.length > 0) {
            summary = `${tier} opportunity because ${highlights.slice(0, 3).join(', ')}.`;
        }
        else {
            summary = `${tier} opportunity based on online footprint.`;
        }
        return {
            score,
            tier,
            reasons,
            summary
        };
    }
}
exports.LeadScoringService = LeadScoringService;
