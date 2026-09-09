"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutreachMessageGenerator = void 0;
class OutreachMessageGenerator {
    static generate(options) {
        const { businessName, niche, location, contactName, hasWebsite, instagram, facebook, rating, reviewsCount, hasDemo = false, tone = 'Friendly', language = 'en' } = options;
        const isPortuguese = language === 'pt';
        const nicheClean = (niche || 'business').toLowerCase();
        // Social platform mentions
        const hasSocial = Boolean(instagram || facebook);
        const socialPlatform = instagram ? 'Instagram' : facebook ? 'Facebook' : 'social media';
        if (isPortuguese) {
            return this.generatePortuguese({
                businessName,
                nicheClean,
                location,
                contactName,
                hasWebsite,
                hasSocial,
                socialPlatform: instagram ? 'Instagram' : facebook ? 'Facebook' : 'redes sociais',
                rating,
                reviewsCount,
                hasDemo,
                tone
            });
        }
        return this.generateEnglish({
            businessName,
            nicheClean,
            location,
            contactName,
            hasWebsite,
            hasSocial,
            socialPlatform,
            rating,
            reviewsCount,
            hasDemo,
            tone
        });
    }
    static generateEnglish(ctx) {
        const { businessName, nicheClean, location, contactName, hasWebsite, hasSocial, socialPlatform, rating, reviewsCount, hasDemo, tone } = ctx;
        const greeting = contactName ? `Hi ${contactName}` : `Hi ${businessName} team`;
        switch (tone) {
            case 'Friendly': {
                if (!hasWebsite) {
                    const discoveryNote = hasSocial
                        ? `I came across ${businessName} while looking at local ${nicheClean} businesses in ${location} and loved your ${socialPlatform} page.`
                        : `I came across ${businessName} while searching for ${nicheClean} services around ${location}.`;
                    const reviewNote = (rating && rating >= 4.0) ? ` You have fantastic reviews (${rating}★ on Google)!` : '';
                    const pitchOffer = hasDemo
                        ? `I design clean websites for local businesses and actually put together a quick demo concept of what a modern site for ${businessName} could look like. Would you like me to send you the link to see it?`
                        : `I build modern, high-converting websites for local businesses to make booking and inquiries effortless. Would you be open to me putting together a quick concept idea for you to check out?`;
                    return `${greeting},

${discoveryNote}${reviewNote} I noticed you don't seem to have a dedicated website indexed yet.

${pitchOffer} No worries at all if you're not interested!

Best,`;
                }
                else {
                    // Has existing website
                    const pitchOffer = hasDemo
                        ? `I build modern, mobile-first sites for local businesses and actually put together a quick refreshed demo concept for ${businessName}. Would you like me to send you a preview?`
                        : `I help local businesses upgrade their sites for faster loading and more mobile inquiries. Would you be open to seeing a couple of quick ideas?`;
                    return `${greeting},

I came across ${businessName} while looking into ${nicheClean} services in ${location}. Great work!

I had a quick look at your online presence and noticed a few opportunities to make your site convert more visitors into direct calls and bookings.

${pitchOffer}

Best,`;
                }
            }
            case 'Professional': {
                const salutation = contactName ? `Dear ${contactName}` : `Dear ${businessName} Management`;
                if (!hasWebsite) {
                    const demoLine = hasDemo
                        ? `To demonstrate the potential impact, I have prepared a preliminary website concept designed specifically for ${businessName}. May I share the demo link with you for a brief review?`
                        : `I specialize in building tailored digital landing pages that automate customer inquiries and drive direct bookings. Would you be open to reviewing a quick concept proposal?`;
                    return `${salutation},

I am contacting you regarding your digital footprint in ${location}. While reviewing established ${nicheClean} businesses in the area, ${businessName}'s profile stood out positively.

However, I noted that your business does not currently feature an indexed, dedicated web portal. In competitive local markets, a professional web presence typically increases direct customer conversions by 25-40%.

${demoLine}

Kind regards,`;
                }
                else {
                    const demoLine = hasDemo
                        ? `I have put together a modernized layout concept demonstrating these performance and conversion improvements. Would you be open to viewing the preview?`
                        : `Would you be open to receiving a brief complimentary breakdown of these high-impact opportunities?`;
                    return `${salutation},

I am writing to you regarding ${businessName}'s online presence in ${location}. While your brand has established a reputable local standing, your current website presents key opportunities for mobile optimization, page speed, and local search visibility.

${demoLine}

Kind regards,`;
                }
            }
            case 'Direct': {
                if (!hasWebsite) {
                    const demoSentence = hasDemo
                        ? `I already built a quick 1-page demo showing how you could take direct bookings and inquiries online. Want me to send over the link?`
                        : `I build fast 1-page websites that launch in 48 hours. Would you like to see a quick concept for ${businessName}?`;
                    return `${greeting},

Quick question: are you currently taking bookings and inquiries through a website for ${businessName}, or relying strictly on ${hasSocial ? socialPlatform + ' DMs and ' : ''}phone calls?

Most customers in ${location} looking for a ${nicheClean} prefer an instant website with clear services and a click-to-call button.

${demoSentence}`;
                }
                else {
                    const demoSentence = hasDemo
                        ? `I put together a quick interactive demo of a faster, mobile-optimized version. Can I send you the link?`
                        : `I build modern, high-speed landing pages that convert local searchers. Interested in seeing a quick 2-minute breakdown?`;
                    return `${greeting},

I took a look at ${businessName}'s website while researching ${nicheClean} businesses in ${location}.

You have great local positioning, but the mobile layout has friction that is likely costing you direct leads.

${demoSentence}`;
                }
            }
            case 'Casual': {
                if (!hasWebsite) {
                    const demoSentence = hasDemo
                        ? `I actually mocked up a quick demo idea for ${businessName} to show what it could look like. Down to check it out?`
                        : `I build straightforward landing pages for local spots so customers can book directly. Curious to see a quick concept?`;
                    return `Hey ${contactName || 'there'}! Saw ${businessName} in ${location}${hasSocial ? ` on ${socialPlatform}` : ''} — really solid setup you've got.

Noticed you don't have an official website up yet. ${demoSentence} No strings attached of course!`;
                }
                else {
                    const demoSentence = hasDemo
                        ? `Actually whipped up a quick visual concept showing how a refreshed version could look. Want me to drop you the link?`
                        : `I help local spots give their websites a modern facelift to get more calls. Open to checking out a couple quick ideas?`;
                    return `Hey ${contactName || 'there'}! Came across ${businessName} in ${location} — love what you guys do.

Checked out your site on mobile and saw a few spots where you could easily get more inquiries. ${demoSentence}`;
                }
            }
            case 'Short': {
                if (!hasWebsite) {
                    if (hasDemo) {
                        return `${greeting} — loved seeing ${businessName} in ${location}! I put together a quick modern website demo for your business. Mind if I send you the link to check out?`;
                    }
                    return `${greeting} — saw ${businessName} in ${location}! Noticed you don't have a website yet; I build fast 1-page sites that turn local searchers into booked clients. Open to seeing a quick concept?`;
                }
                else {
                    if (hasDemo) {
                        return `${greeting} — saw ${businessName} in ${location}! I put together a quick demo of a refreshed mobile-first layout for your site. Would you like me to send you the preview?`;
                    }
                    return `${greeting} — saw ${businessName} in ${location}! Love your work. I build high-converting websites for ${nicheClean}s and spotted a few quick wins for your site. Interested in a quick look?`;
                }
            }
        }
    }
    static generatePortuguese(ctx) {
        const { businessName, nicheClean, location, contactName, hasWebsite, hasSocial, socialPlatform, rating, reviewsCount, hasDemo, tone } = ctx;
        const greeting = contactName ? `Olá ${contactName}` : `Olá equipe da ${businessName}`;
        switch (tone) {
            case 'Friendly': {
                if (!hasWebsite) {
                    const demoSentence = hasDemo
                        ? `Crio sites modernos para negócios locais e cheguei a montar uma ideia/demo rápida de como um site moderno da ${businessName} poderia ficar. Posso te enviar o link para dar uma olhada?`
                        : `Eu desenvolvo sites ágeis para negócios locais facilitando agendamentos e contatos. Teria interesse em ver um conceito visual sem compromisso?`;
                    return `${greeting}, tudo bem?

Encontrei a ${businessName} pesquisando por serviços de ${nicheClean} em ${location}${hasSocial ? ` e adorei o perfil de vocês no ${socialPlatform}` : ''}.

Notei que vocês ainda não possuem um site profissional próprio no Google.

${demoSentence} Sem pressão alguma!

Um abraço,`;
                }
                else {
                    const demoSentence = hasDemo
                        ? `Montei uma demonstração rápida de uma versão mais moderna e focada em conversão mobile. Posso te enviar a prévia?`
                        : `Ajudo empresas locais a aumentarem os agendamentos pelo site. Teria interesse em ver algumas melhorias rápidas?`;
                    return `${greeting}, tudo bem?

Estava conhecendo os serviços de ${nicheClean} em ${location} e vi o trabalho incrível da ${businessName}.

Dei uma olhada na presença online de vocês e percebi algumas oportunidades para atrair ainda mais contatos direto pelo celular.

${demoSentence}

Um abraço,`;
                }
            }
            case 'Professional': {
                const salutation = contactName ? `Prezado(a) ${contactName}` : `Aos cuidados da Direção da ${businessName}`;
                if (!hasWebsite) {
                    const demoSentence = hasDemo
                        ? `Para ilustrar o potencial, elaborei uma demonstração preliminar personalizada para a ${businessName}. Teria disponibilidade para visualizar o link?`
                        : `Especializo-me em desenvolver landing pages que automatizam o atendimento e impulsionam agendamentos. Teria interesse em receber uma proposta conceitual?`;
                    return `${salutation},

Escrevo referente à presença digital da ${businessName} em ${location}. Acompanhando os prestadores de ${nicheClean} na região, a reputação da sua empresa destacou-se positivamente.

Identifiquei, contudo, a ausência de uma página web oficial indexada, recurso que comprovadamente eleva a captação direta de clientes.

${demoSentence}

Atenciosamente,`;
                }
                else {
                    const demoSentence = hasDemo
                        ? `Preparei um modelo visual demonstrando essas otimizações na prática. Posso compartilhar o link com sua equipe?`
                        : `Teria interesse em receber um diagnóstico breve com pontos de melhoria para o site?`;
                    return `${salutation},

Escrevo a respeito da presença online da ${businessName} em ${location}. Embora a empresa conte com credibilidade local, o site atual apresenta oportunidades importantes em velocidade e experiência no mobile.

${demoSentence}

Atenciosamente,`;
                }
            }
            case 'Direct': {
                if (!hasWebsite) {
                    const demoSentence = hasDemo
                        ? `Montei um protótipo rápido mostrando como funcionaria o atendimento direto online. Quer que eu te envie o link?`
                        : `Crio sites prontos para conversão em 48 horas. Quer que eu mostre uma proposta rápida para a ${businessName}?`;
                    return `${greeting},

Uma pergunta rápida: vocês já recebem orçamentos por um site próprio para a ${businessName}, ou dependem apenas de ${hasSocial ? socialPlatform + ' e ' : ''}WhatsApp/telefone?

Muitos clientes em ${location} preferem acessar um site ágil com lista clara de serviços e botão direto.

${demoSentence}`;
                }
                else {
                    const demoSentence = hasDemo
                        ? `Montei um demo prático de um layout mais rápido e otimizado para celulares. Posso enviar o link?`
                        : `Ajudo empresas locais a converterem mais visitantes em contatos reais. Topa ver um resumo de 2 minutos?`;
                    return `${greeting},

Estive analisando o site da ${businessName} ao pesquisar empresas de ${nicheClean} em ${location}.

A empresa tem ótimo potencial, mas o site tem pontos no celular que podem estar custando contatos valiosos.

${demoSentence}`;
                }
            }
            case 'Casual': {
                if (!hasWebsite) {
                    const demoSentence = hasDemo
                        ? `Acabei montando uma ideia rápida de site pra ${businessName} pra vocês verem como ficaria. Quer dar uma olhada?`
                        : `Crio landing pages práticas pra negócios locais receberem mais clientes direto. Quer ver uma prévia sem compromisso?`;
                    return `Opa ${contactName || 'pessoal'}, tudo certo? Vi a ${businessName} aqui em ${location}${hasSocial ? ` no ${socialPlatform}` : ''} — trabalho muito legal!

Vi que vocês ainda não têm um site no ar. ${demoSentence}`;
                }
                else {
                    const demoSentence = hasDemo
                        ? `Montei um conceito rápido de visual renovado pra mostrar. Quer que eu te mande o link?`
                        : `Ajudo a modernizar páginas de negócios locais pra gerar mais chamadas. Topa ver umas ideias rápidas?`;
                    return `Opa ${contactName || 'pessoal'}, tudo certo? Conheci a ${businessName} em ${location} — parabéns pelo trabalho!

Olhei o site de vocês pelo celular e notei uns pontos que poderiam render mais clientes. ${demoSentence}`;
                }
            }
            case 'Short': {
                if (!hasWebsite) {
                    if (hasDemo) {
                        return `${greeting}! Vi a ${businessName} em ${location} e achei excelente. Montei um demo rápido de site para o negócio de vocês, posso te enviar o link para ver o que acha?`;
                    }
                    return `${greeting}! Vi a ${businessName} em ${location} e notei que ainda não possuem site. Desenvolvo páginas rápidas para negócios locais que atraem clientes pelo Google. Topa ver uma ideia?`;
                }
                else {
                    if (hasDemo) {
                        return `${greeting}! Vi a ${businessName} em ${location}. Montei uma demonstração rápida de uma versão renovada para celular do site de vocês. Posso te enviar a prévia?`;
                    }
                    return `${greeting}! Vi o trabalho da ${businessName} em ${location}. Desenvolvo sites para empresas de ${nicheClean} e vi algumas melhorias simples para o site de vocês. Teria 2 minutos para ver?`;
                }
            }
        }
    }
}
exports.OutreachMessageGenerator = OutreachMessageGenerator;
