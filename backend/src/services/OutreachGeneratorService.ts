export type OutreachStyle = 'Friendly' | 'Professional' | 'Short' | 'Direct';

export interface OutreachContext {
  businessName: string;
  niche: string;
  location: string;
  contactName?: string;
  instagram?: string | null;
  phone?: string | null;
  hasWebsite: boolean;
}

export class OutreachGeneratorService {
  static generate(context: OutreachContext, style: OutreachStyle = 'Friendly'): string {
    const { businessName, niche, location, contactName, instagram, hasWebsite } = context;
    const greeting = contactName ? `Hi ${contactName}` : `Hi ${businessName} team`;
    const nicheClean = niche.toLowerCase();

    switch (style) {
      case 'Friendly':
        if (!hasWebsite) {
          return `${greeting},

I came across ${businessName} while looking for great ${nicheClean}s in ${location}. I noticed you have a really fantastic presence on ${instagram ? 'Instagram' : 'social media'}, but couldn't seem to find an official website for the business.

I design clean, fast landing pages specifically for local businesses that make it super easy for new clients to find your services, see your pricing, and call or book directly.

Would you be open to checking out a quick mock-up example I put together for you? No pressure at all!

Best regards,`;
        } else {
          return `${greeting},

I came across ${businessName} while exploring local ${nicheClean} services around ${location}. Love what you guys are doing!

I took a quick look at your online presence and noticed your website could likely generate significantly more direct bookings with a refreshed, mobile-first design and modern SEO.

Would you be open to taking a quick look at a few simple improvements you could make to convert more local visitors into paying clients?

Best regards,`;
        }

      case 'Professional':
        if (!hasWebsite) {
          return `Dear ${businessName} Management,

I am reaching out regarding your digital presence in ${location}. While reviewing prominent ${nicheClean} businesses in the area, ${businessName}'s profile stood out strongly.

However, I noticed your business does not currently have a dedicated professional website indexed on Google. In competitive local markets, businesses without a website lose up to 40% of potential appointment bookings to competitors who offer direct online booking and clear service menus.

I specialize in building high-performance websites for service providers. Would you be available for a brief 5-minute conversation this week to discuss how a dedicated landing page could drive more client inquiries?

Kind regards,`;
        } else {
          return `Dear ${businessName} Management,

I am contacting you following a review of local ${nicheClean} businesses in ${location}. While your business has built a solid local reputation, your website appears to have untapped opportunities for speed optimization, mobile conversion, and local search visibility.

I help established local businesses modernize their digital platforms to increase customer acquisition and automate customer inquiries.

May I share a complimentary brief performance audit highlighting 3 key areas for growth?

Kind regards,`;
        }

      case 'Short':
        if (!hasWebsite) {
          return `${greeting} - love what you're doing with ${businessName} in ${location}! Noticed you don't have a website set up yet. I build modern 1-page sites for local ${nicheClean}s that turn IG followers into booked clients. Open to seeing a quick preview?`;
        } else {
          return `${greeting} - saw ${businessName} in ${location}. Your service looks great! I build high-converting websites for local ${nicheClean}s and noticed a few quick wins for your site to get more calls. Interested in seeing a quick 2-minute breakdown?`;
        }

      case 'Direct':
        if (!hasWebsite) {
          return `${greeting},

Quick question: Are you currently taking website inquiries for ${businessName}, or relying purely on social DMs and phone calls?

Most customers in ${location} searching on Google for a ${nicheClean} book with whoever has an instant website with their price list and click-to-call button.

I build turnkey landing pages for local businesses that launch in 48 hours. Let me know if you'd like me to send over a concept link.`;
        } else {
          return `${greeting},

I'm a web developer working with local businesses in ${location}. I ran a quick check on ${businessName}'s website and found several mobile layout and load-speed bottlenecks that are likely costing you leads.

Would you like me to send a free screen-recording showing how to fix them?`;
        }
    }
  }
}
