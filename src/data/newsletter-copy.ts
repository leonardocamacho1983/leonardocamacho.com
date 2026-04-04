export type Locale = 'en_US' | 'en_UK' | 'pt_BR' | 'pt_PT' | 'fr_FR';

export interface LocaleCopy {
  locale: Locale;
  lang: string;
  // Launch page
  headline: string;
  headlineAccent: string;
  subhead1: string;
  subhead2: string;
  ctaButton: string;
  supportingNote: string;
  launchDate: string;
  navWriting: string;
  navResearch: string;
  navStrategy: string;
  navLetter: string;
  launchSuccessTitle: string;
  launchSuccessBody: string;
  // Welcome page (confirmation)
  welcomeLabel: string;
  welcomeHero: string;
  welcomeSeason: string;
  welcomeExclusive: string;
  welcomeInstruction: string;
  welcomeContinueCta: string;
  welcomeSubjectLine: string;
  welcomeSubjectLabel: string;
  welcomeOpenGmail: string;
  welcomeOpenOutlook: string;
  // Confirmed page (form)
  confirmedHero1: string;
  confirmedHero2: string;
  confirmedSeason: string;
  confirmedFormTitle: string;
  confirmedFormSubtitle: string;
  confirmedFormNote: string;
  confirmedLabelName: string;
  confirmedLabelPosition: string;
  confirmedLabelCompany: string;
  confirmedLabelCompanyWebsite: string;
  confirmedHelpCompanyWebsite: string;
  confirmedLabelTeamSize: string;
  confirmedLabelQuestion: string;
  confirmedPlaceholderName: string;
  confirmedPlaceholderPosition: string;
  confirmedPlaceholderCompany: string;
  confirmedPlaceholderCompanyWebsite: string;
  confirmedPlaceholderTeamSize: string;
  confirmedPlaceholderQuestion: string;
  confirmedOptional: string;
  confirmedSubmit: string;
  confirmedSkip: string;
  confirmedRevealPoint1: string;
  confirmedRevealPoint2: string;
  confirmedRevealPoint3: string;
  confirmedRevealTagline: string;
  confirmedRevealLinkedin: string;
  confirmedRevealTwitter: string;
  // Thank you page
  thankyouHero: string;
  thankyouExploreTitle: string;
  thankyouExploreBody: string;
  thankyouExploreTagline: string;
  thankyouStarTitle: string;
  thankyouStarBody: string;
  thankyouMeanwhile: string;
  thankyouLinkedin: string;
  thankyouTwitter: string;
}

export const copy: Record<string, LocaleCopy> = {
  en: {
    locale: 'en_US',
    lang: 'en',
    headline: 'Building Companies\nThat ',
    headlineAccent: 'Compound',
    subhead1: 'Most growth satisfies the quarter.',
    subhead2: 'The rarest kind satisfies the decade.',
    ctaButton: 'JOIN BEFORE LAUNCH',
    supportingNote: 'A slow, deliberate letter for the few who build long.',
    launchDate: 'LAUNCHING SPRING 2026',
    navWriting: 'Writing',
    navResearch: 'Research',
    navStrategy: 'Strategy',
    navLetter: 'The Compounding Letter',
    launchSuccessTitle: 'You\u2019re on the list',
    launchSuccessBody: 'We\u2019ll be in touch before launch.',
    welcomeLabel: 'YOU\u2019RE EARLY. THAT MATTERS.',
    welcomeHero: 'You\u2019re in.',
    welcomeSeason: 'The first essay arrives <strong>Spring 2026</strong>.',
    welcomeExclusive: 'You\u2019ll receive it before it\u2019s published anywhere else.',
    welcomeInstruction: 'Confirm your email to secure your place.',
    welcomeContinueCta: 'I confirmed my email',
    welcomeSubjectLine: 'Leonardo Camacho \u2014 Confirm your place',
    welcomeSubjectLabel: 'Look for the subject:',
    welcomeOpenGmail: 'Open Gmail',
    welcomeOpenOutlook: 'Open Outlook',
    confirmedHero1: 'Confirmed.',
    confirmedHero2: 'You\u2019re subscribed.',
    confirmedSeason: '',
    confirmedFormTitle: 'Who\u2019s reading?',
    confirmedFormSubtitle: 'Knowing who\u2019s here helps me write what matters.',
    confirmedFormNote: 'Four fields. Thirty seconds.',
    confirmedLabelName: 'NAME',
    confirmedLabelPosition: 'POSITION',
    confirmedLabelCompany: 'COMPANY',
    confirmedLabelCompanyWebsite: 'Company website',
    confirmedHelpCompanyWebsite: 'You can enter only the domain (e.g. yourcompany.com).',
    confirmedLabelTeamSize: 'How many people do you lead?',
    confirmedLabelQuestion: 'What\u2019s the strategic question keeping you up right now?',
    confirmedPlaceholderName: 'Your name',
    confirmedPlaceholderPosition: 'e.g. CEO, VP Strategy, Founder',
    confirmedPlaceholderCompany: 'Where do you work?',
    confirmedPlaceholderCompanyWebsite: 'yourcompany.com',
    confirmedPlaceholderTeamSize: 'e.g. 12, 200, just me',
    confirmedPlaceholderQuestion: 'This shapes what I write next.',
    confirmedOptional: 'Optional',
    confirmedSubmit: 'Complete',
    confirmedSkip: 'Skip for now',
    confirmedRevealPoint1: 'How companies compound advantage through disruption, not despite it.',
    confirmedRevealPoint2: 'Why the organizations that endure don\u2019t preserve what they\u2019re made of, they preserve how the parts hold together.',
    confirmedRevealPoint3: 'Strategy that satisfies the decade.',
    confirmedRevealTagline: 'Designed to be returned to.',
    confirmedRevealLinkedin: 'Follow on LinkedIn',
    confirmedRevealTwitter: 'Follow on Twitter',
    thankyouHero: 'Now we begin.',
    thankyouExploreTitle: 'What we\u2019ll explore together',
    thankyouExploreBody: 'How companies compound advantage through disruption, not despite it. Why the organizations that endure don\u2019t preserve what they\u2019re made of. They preserve how the pieces hold together. Strategy that satisfies the decade.',
    thankyouExploreTagline: 'Written to be read slowly. Designed to be revisited often.',
    thankyouStarTitle: 'One small thing',
    thankyouStarBody: 'You\u2019ll receive a welcome email from me in the next few minutes. Star it, mark it as important, or move it to your primary tab. It trains your inbox to keep us out of spam when the first letter arrives.',
    thankyouMeanwhile: 'In the meantime:',
    thankyouLinkedin: 'Follow on LinkedIn',
    thankyouTwitter: 'Follow on Twitter',
  },
  'pt-br': {
    locale: 'pt_BR',
    lang: 'pt-BR',
    headline: 'Construindo Vantagem\n',
    headlineAccent: 'Composta',
    subhead1: 'A maioria do crescimento satisfaz o trimestre.',
    subhead2: 'O mais raro satisfaz a d\u00e9cada.',
    ctaButton: 'ENTRAR ANTES DO LAN\u00c7AMENTO',
    supportingNote: 'Uma carta lenta e deliberada para os poucos que constroem no longo prazo.',
    launchDate: 'LAN\u00c7AMENTO OUTONO 2026',
    navWriting: 'Escrita',
    navResearch: 'Pesquisa',
    navStrategy: 'Estrat\u00e9gia',
    navLetter: 'A Carta Composta',
    launchSuccessTitle: 'Voc\u00ea entrou na lista',
    launchSuccessBody: 'Vamos falar com voc\u00ea antes do lan\u00e7amento.',
    welcomeLabel: 'VOC\u00ca CHEGOU CEDO. ISSO IMPORTA.',
    welcomeHero: 'Voc\u00ea est\u00e1 dentro.',
    welcomeSeason: 'O primeiro ensaio chega no <strong>Outono de 2026</strong>.',
    welcomeExclusive: 'Voc\u00ea vai receb\u00ea-lo antes de ser publicado em qualquer outro lugar.',
    welcomeInstruction: 'Confirme seu email para garantir seu lugar.',
    welcomeContinueCta: 'J\u00e1 confirmei meu email',
    welcomeSubjectLine: 'Leonardo Camacho \u2014 Confirm your place',
    welcomeSubjectLabel: 'Procure pelo assunto:',
    welcomeOpenGmail: 'Abrir Gmail',
    welcomeOpenOutlook: 'Abrir Outlook',
    confirmedHero1: 'Confirmado.',
    confirmedHero2: 'Voc\u00ea est\u00e1 inscrito.',
    confirmedSeason: '',
    confirmedFormTitle: 'Quem est\u00e1 lendo?',
    confirmedFormSubtitle: 'Saber quem est\u00e1 aqui me ajuda a escrever o que importa.',
    confirmedFormNote: 'Quatro campos. Trinta segundos.',
    confirmedLabelName: 'NOME',
    confirmedLabelPosition: 'CARGO',
    confirmedLabelCompany: 'EMPRESA',
    confirmedLabelCompanyWebsite: 'Site da empresa',
    confirmedHelpCompanyWebsite: 'Pode inserir apenas o dom\u00ednio (ex.: suaempresa.com.br).',
    confirmedLabelTeamSize: 'Quantas pessoas voc\u00ea lidera?',
    confirmedLabelQuestion: 'Qual \u00e9 a quest\u00e3o estrat\u00e9gica que tira seu sono agora?',
    confirmedPlaceholderName: 'Seu nome',
    confirmedPlaceholderPosition: 'ex. CEO, VP Estrat\u00e9gia, Fundador',
    confirmedPlaceholderCompany: 'Onde voc\u00ea trabalha?',
    confirmedPlaceholderCompanyWebsite: 'suaempresa.com.br',
    confirmedPlaceholderTeamSize: 'ex. 12, 200, s\u00f3 eu',
    confirmedPlaceholderQuestion: 'Isso define o que eu escrevo a seguir.',
    confirmedOptional: 'Opcional',
    confirmedSubmit: 'Completar',
    confirmedSkip: 'Pular por enquanto',
    confirmedRevealPoint1: 'Como empresas acumulam vantagem atrav\u00e9s da disrup\u00e7\u00e3o, n\u00e3o apesar dela.',
    confirmedRevealPoint2: 'Por que as organiza\u00e7\u00f5es que perduram n\u00e3o preservam o que as constitui, preservam como as partes se articulam.',
    confirmedRevealPoint3: 'Estrat\u00e9gia que satisfaz a d\u00e9cada.',
    confirmedRevealTagline: 'Pensado para ser revisitado.',
    confirmedRevealLinkedin: 'Seguir no LinkedIn',
    confirmedRevealTwitter: 'Seguir no Twitter',
    thankyouHero: 'Agora come\u00e7amos.',
    thankyouExploreTitle: 'O que vamos explorar juntos',
    thankyouExploreBody: 'Como empresas acumulam vantagem atrav\u00e9s da disrup\u00e7\u00e3o, n\u00e3o apesar dela. Por que as organiza\u00e7\u00f5es que perduram n\u00e3o preservam do que s\u00e3o feitas. Elas preservam como as pe\u00e7as se encaixam. Estrat\u00e9gia que satisfaz a d\u00e9cada.',
    thankyouExploreTagline: 'Escrito para ser lido devagar. Projetado para ser revisitado com frequ\u00eancia.',
    thankyouStarTitle: 'Uma pequena coisa',
    thankyouStarBody: 'Voc\u00ea vai receber um email de boas-vindas nos pr\u00f3ximos minutos. Marque como importante ou favorito. Isso treina sua caixa de entrada para manter nossas mensagens fora do spam.',
    thankyouMeanwhile: 'Enquanto isso:',
    thankyouLinkedin: 'Seguir no LinkedIn',
    thankyouTwitter: 'Seguir no Twitter',
  },
  pt: {
    locale: 'pt_PT',
    lang: 'pt-PT',
    headline: 'A Construir Vantagem\n',
    headlineAccent: 'Composta',
    subhead1: 'A maioria do crescimento satisfaz o trimestre.',
    subhead2: 'O mais raro satisfaz a d\u00e9cada.',
    ctaButton: 'ENTRAR ANTES DO LAN\u00c7AMENTO',
    supportingNote: 'Uma carta lenta e deliberada para os poucos que constroem a longo prazo.',
    launchDate: 'LAN\u00c7AMENTO PRIMAVERA 2026',
    navWriting: 'Escrita',
    navResearch: 'Investiga\u00e7\u00e3o',
    navStrategy: 'Estrat\u00e9gia',
    navLetter: 'A Carta Composta',
    launchSuccessTitle: 'Est\u00e1 na lista',
    launchSuccessBody: 'Entrarei em contacto antes do lan\u00e7amento.',
    welcomeLabel: 'CHEGOU CEDO. ISSO IMPORTA.',
    welcomeHero: 'Est\u00e1 dentro.',
    welcomeSeason: 'O primeiro ensaio chega na <strong>Primavera de 2026</strong>.',
    welcomeExclusive: 'Vai receb\u00ea-lo antes de ser publicado em qualquer outro lugar.',
    welcomeInstruction: 'Confirme o seu email para garantir o seu lugar.',
    welcomeContinueCta: 'J\u00e1 confirmei o meu email',
    welcomeSubjectLine: 'Leonardo Camacho \u2014 Confirm your place',
    welcomeSubjectLabel: 'Procure pelo assunto:',
    welcomeOpenGmail: 'Abrir Gmail',
    welcomeOpenOutlook: 'Abrir Outlook',
    confirmedHero1: 'Confirmado.',
    confirmedHero2: 'Est\u00e1 inscrito.',
    confirmedSeason: '',
    confirmedFormTitle: 'Quem est\u00e1 a ler?',
    confirmedFormSubtitle: 'Saber quem est\u00e1 aqui ajuda-me a escrever o que importa.',
    confirmedFormNote: 'Quatro campos. Trinta segundos.',
    confirmedLabelName: 'NOME',
    confirmedLabelPosition: 'CARGO',
    confirmedLabelCompany: 'EMPRESA',
    confirmedLabelCompanyWebsite: 'Site da empresa',
    confirmedHelpCompanyWebsite: 'Pode inserir apenas o dom\u00ednio (ex.: suaempresa.pt).',
    confirmedLabelTeamSize: 'Quantas pessoas lidera?',
    confirmedLabelQuestion: 'Qual \u00e9 a quest\u00e3o estrat\u00e9gica que lhe tira o sono agora?',
    confirmedPlaceholderName: 'O seu nome',
    confirmedPlaceholderPosition: 'ex. CEO, VP Estrat\u00e9gia, Fundador',
    confirmedPlaceholderCompany: 'Onde trabalha?',
    confirmedPlaceholderCompanyWebsite: 'suaempresa.pt',
    confirmedPlaceholderTeamSize: 'ex. 12, 200, s\u00f3 eu',
    confirmedPlaceholderQuestion: 'Isto define o que escrevo a seguir.',
    confirmedOptional: 'Opcional',
    confirmedSubmit: 'Completar',
    confirmedSkip: 'Saltar por agora',
    confirmedRevealPoint1: 'Como as empresas acumulam vantagem atrav\u00e9s da disrup\u00e7\u00e3o, n\u00e3o apesar dela.',
    confirmedRevealPoint2: 'Porque as organiza\u00e7\u00f5es que perduram n\u00e3o preservam o que as constitui, preservam como as partes se articulam.',
    confirmedRevealPoint3: 'Estrat\u00e9gia que satisfaz a d\u00e9cada.',
    confirmedRevealTagline: 'Pensado para ser revisitado.',
    confirmedRevealLinkedin: 'Seguir no LinkedIn',
    confirmedRevealTwitter: 'Seguir no Twitter',
    thankyouHero: 'Agora come\u00e7amos.',
    thankyouExploreTitle: 'O que vamos explorar juntos',
    thankyouExploreBody: 'Como as empresas acumulam vantagem atrav\u00e9s da disrup\u00e7\u00e3o, n\u00e3o apesar dela. Porque as organiza\u00e7\u00f5es que perduram n\u00e3o preservam de que s\u00e3o feitas. Preservam como as pe\u00e7as se encaixam. Estrat\u00e9gia que satisfaz a d\u00e9cada.',
    thankyouExploreTagline: 'Escrito para ser lido devagar. Concebido para ser revisitado com frequ\u00eancia.',
    thankyouStarTitle: 'Uma pequena coisa',
    thankyouStarBody: 'Vai receber um email de boas-vindas nos pr\u00f3ximos minutos. Marque como importante ou favorito. Isso treina a sua caixa de entrada para manter as nossas mensagens fora do spam.',
    thankyouMeanwhile: 'Entretanto:',
    thankyouLinkedin: 'Seguir no LinkedIn',
    thankyouTwitter: 'Seguir no Twitter',
  },
  fr: {
    locale: 'fr_FR',
    lang: 'fr',
    headline: 'B\u00e2tir l\u2019Avantage\n',
    headlineAccent: 'Compos\u00e9',
    subhead1: 'La plupart de la croissance satisfait le trimestre.',
    subhead2: 'La plus rare satisfait la d\u00e9cennie.',
    ctaButton: 'REJOINDRE AVANT LE LANCEMENT',
    supportingNote: 'Une lettre lente et d\u00e9lib\u00e9r\u00e9e pour ceux qui b\u00e2tissent sur le long terme.',
    launchDate: 'LANCEMENT PRINTEMPS 2026',
    navWriting: '\u00c9criture',
    navResearch: 'Recherche',
    navStrategy: 'Strat\u00e9gie',
    navLetter: 'La Lettre Compos\u00e9e',
    launchSuccessTitle: 'Vous \u00eates sur la liste',
    launchSuccessBody: 'Vous recevrez un message avant le lancement.',
    welcomeLabel: 'VOUS \u00caTES EN AVANCE. C\u2019EST IMPORTANT.',
    welcomeHero: 'Vous \u00eates inscrit.',
    welcomeSeason: 'Le premier essai arrive au <strong>Printemps 2026</strong>.',
    welcomeExclusive: 'Vous le recevrez avant qu\u2019il ne soit publi\u00e9 ailleurs.',
    welcomeInstruction: 'Confirmez votre email pour garantir votre place.',
    welcomeContinueCta: 'J\u2019ai confirm\u00e9 mon email',
    welcomeSubjectLine: 'Leonardo Camacho \u2014 Confirm your place',
    welcomeSubjectLabel: 'Cherchez le sujet :',
    welcomeOpenGmail: 'Ouvrir Gmail',
    welcomeOpenOutlook: 'Ouvrir Outlook',
    confirmedHero1: 'Confirm\u00e9.',
    confirmedHero2: 'Vous \u00eates inscrit.',
    confirmedSeason: '',
    confirmedFormTitle: 'Qui lit ?',
    confirmedFormSubtitle: 'Savoir qui est ici m\u2019aide \u00e0 \u00e9crire ce qui compte.',
    confirmedFormNote: 'Quatre champs. Trente secondes.',
    confirmedLabelName: 'NOM',
    confirmedLabelPosition: 'POSTE',
    confirmedLabelCompany: 'ENTREPRISE',
    confirmedLabelCompanyWebsite: 'Site web de l\u2019entreprise',
    confirmedHelpCompanyWebsite: 'Vous pouvez saisir uniquement le domaine (ex. : votreentreprise.fr).',
    confirmedLabelTeamSize: 'Combien de personnes dirigez-vous ?',
    confirmedLabelQuestion: 'Quelle est la question strat\u00e9gique qui vous emp\u00eache de dormir ?',
    confirmedPlaceholderName: 'Votre nom',
    confirmedPlaceholderPosition: 'ex. PDG, VP Strat\u00e9gie, Fondateur',
    confirmedPlaceholderCompany: 'O\u00f9 travaillez-vous ?',
    confirmedPlaceholderCompanyWebsite: 'votreentreprise.fr',
    confirmedPlaceholderTeamSize: 'ex. 12, 200, juste moi',
    confirmedPlaceholderQuestion: 'Cela d\u00e9finit ce que j\u2019\u00e9cris ensuite.',
    confirmedOptional: 'Facultatif',
    confirmedSubmit: 'Terminer',
    confirmedSkip: 'Passer pour l\u2019instant',
    confirmedRevealPoint1: 'Comment les entreprises accumulent un avantage \u00e0 travers la disruption, pas malgr\u00e9 elle.',
    confirmedRevealPoint2: 'Pourquoi les organisations qui perdurent ne pr\u00e9servent pas ce qui les constitue, elles pr\u00e9servent la mani\u00e8re dont les parties s\u2019articulent.',
    confirmedRevealPoint3: 'Une strat\u00e9gie qui satisfait la d\u00e9cennie.',
    confirmedRevealTagline: 'Pens\u00e9 pour \u00eatre revisit\u00e9.',
    confirmedRevealLinkedin: 'Suivre sur LinkedIn',
    confirmedRevealTwitter: 'Suivre sur Twitter',
    thankyouHero: 'Maintenant, on commence.',
    thankyouExploreTitle: 'Ce que nous allons explorer ensemble',
    thankyouExploreBody: 'Comment les entreprises accumulent un avantage \u00e0 travers la disruption, pas malgr\u00e9 elle. Pourquoi les organisations qui perdurent ne pr\u00e9servent pas ce dont elles sont faites. Elles pr\u00e9servent comment les pi\u00e8ces tiennent ensemble. Strat\u00e9gie qui satisfait la d\u00e9cennie.',
    thankyouExploreTagline: '\u00c9crit pour \u00eatre lu lentement. Con\u00e7u pour \u00eatre revisit\u00e9 souvent.',
    thankyouStarTitle: 'Une petite chose',
    thankyouStarBody: 'Vous recevrez un email de bienvenue dans les prochaines minutes. Marquez-le comme important ou favori. Cela entra\u00eene votre bo\u00eete de r\u00e9ception \u00e0 garder nos messages hors du spam.',
    thankyouMeanwhile: 'En attendant :',
    thankyouLinkedin: 'Suivre sur LinkedIn',
    thankyouTwitter: 'Suivre sur Twitter',
  },
};

export function getCopyForPath(path: string): LocaleCopy {
  if (path.startsWith('/pt-br')) return copy['pt-br'];
  if (path.startsWith('/pt')) return copy['pt'];
  if (path.startsWith('/fr')) return copy['fr'];
  return copy['en'];
}

export function getLocaleForPath(path: string): string {
  if (path.startsWith('/pt-br')) return 'pt_BR';
  if (path.startsWith('/pt')) return 'pt_PT';
  if (path.startsWith('/fr')) return 'fr_FR';
  return 'en_US';
}
