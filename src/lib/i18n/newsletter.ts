import type { LocaleKey } from "@/lib/locales";

export interface NewsletterCopy {
  consentTextBeforeLink: string;
  consentLinkLabel: string;
  consentTextAfterLink: string;
  writingTitleLead: string;
  writingTitleEmphasis: string;
  writingDescription: string;
  emailPlaceholder: string;
  subscribeButton: string;
  unsubscribeNote: string;
  thanksTitle: string;
  thanksDescription: string;
  thanksInboxNote: string;
  identityLine?: string;
  confirmChecklistTitle: string;
  confirmChecklistLead: string;
  confirmSubjectLabel: string;
  confirmCopyHint: string;
  confirmOpenGmailLabel: string;
  confirmOpenOutlookLabel: string;
  confirmAppleHint: string;
  confirmStepOne: string;
  confirmStepTwo: string;
  confirmStepThree: string;
  confirmRevealSurveyLabel: string;
  confirmRevealSurveySupport: string;
  confirmFutureAnchor?: string;
  confirmHookLead?: string;
  confirmHookOne?: string;
  confirmHookTwo?: string;
  confirmHookThree?: string;
  surveyTitle: string;
  surveyDescription: string;
  surveyPositionLabel: string;
  surveyCompanyLabel: string;
  surveyTeamSizeLabel: string;
  surveyImpactLabel: string;
  surveySubmitLabel: string;
  surveySkipLabel: string;
  surveySavedLabel: string;
  subscribeErrorLabel: string;
  profileErrorLabel: string;
  unsubscribedTitle: string;
  unsubscribedDescription: string;
}

const COPY_BY_LOCALE: Record<LocaleKey, NewsletterCopy> = {
  "en-us": {
    consentTextBeforeLink: "I agree to receive the newsletter and accept the",
    consentLinkLabel: "privacy policy",
    consentTextAfterLink: ".",
    writingTitleLead: "Writing worth",
    writingTitleEmphasis: "waiting for",
    writingDescription:
      "New essays on strategy and compounding advantage, sent directly to your inbox. No noise, no schedule pressure - just the ideas, when they're ready.",
    emailPlaceholder: "Your email",
    subscribeButton: "Subscribe",
    unsubscribeNote: "Typically once a month. Unsubscribe anytime.",
    thanksTitle: "You're in.",
    thanksDescription: "You've joined a small group building for the long term.",
    thanksInboxNote: "Open the confirmation email to complete your access.",
    identityLine: "You are now part of a long-horizon conversation.",
    confirmChecklistTitle: "Complete your access",
    confirmChecklistLead: "Open the confirmation email to complete your access.",
    confirmSubjectLabel: "Search for this exact email subject:",
    confirmCopyHint: "Use the subject line below to find it quickly.",
    confirmOpenGmailLabel: "Open Gmail",
    confirmOpenOutlookLabel: "Open Outlook",
    confirmAppleHint: "Apple Mail: open your Inbox and search the subject above.",
    confirmStepOne: "Search the subject.",
    confirmStepTwo: "Open the message.",
    confirmStepThree: "Click the confirmation link.",
    confirmRevealSurveyLabel: "Confirmed. Shape what comes next.",
    confirmRevealSurveySupport: "Takes under a minute. Helps tailor future letters to your context.",
    confirmFutureAnchor: "First essay arrives Spring 2026.",
    confirmHookLead: "What we will explore:",
    confirmHookOne: "Compounding advantage",
    confirmHookTwo: "Dynamic capabilities",
    confirmHookThree: "Strategy beyond the quarter",
    surveyTitle: "Help me understand who is building with us",
    surveyDescription:
      "Four quick fields help me map who is building for the long term.",
    surveyPositionLabel: "Position",
    surveyCompanyLabel: "Company",
    surveyTeamSizeLabel: "How many people do you lead?",
    surveyImpactLabel: "How many customers are impacted monthly?",
    surveySubmitLabel: "Complete my profile",
    surveySkipLabel: "Skip for now",
    surveySavedLabel: "Thanks - your profile was saved.",
    subscribeErrorLabel: "We couldn't process your subscription. Please try again.",
    profileErrorLabel: "We couldn't save your profile right now. Please try again.",
    unsubscribedTitle: "Unsubscribed",
    unsubscribedDescription: "You will no longer receive this newsletter.",
  },
  "en-gb": {
    consentTextBeforeLink: "I agree to receive the newsletter and accept the",
    consentLinkLabel: "privacy policy",
    consentTextAfterLink: ".",
    writingTitleLead: "Writing worth",
    writingTitleEmphasis: "waiting for",
    writingDescription:
      "New essays on strategy and compounding advantage, sent directly to your inbox. No noise, no schedule pressure - just the ideas, when they're ready.",
    emailPlaceholder: "Your email",
    subscribeButton: "Subscribe",
    unsubscribeNote: "Typically once a month. Unsubscribe anytime.",
    thanksTitle: "You're in.",
    thanksDescription: "You've joined a small group building for the long term.",
    thanksInboxNote: "Open the confirmation email to complete your access.",
    identityLine: "You are now part of a long-horizon conversation.",
    confirmChecklistTitle: "Complete your access",
    confirmChecklistLead: "Open the confirmation email to complete your access.",
    confirmSubjectLabel: "Search for this exact email subject:",
    confirmCopyHint: "Use the subject line below to find it quickly.",
    confirmOpenGmailLabel: "Open Gmail",
    confirmOpenOutlookLabel: "Open Outlook",
    confirmAppleHint: "Apple Mail: open your Inbox and search the subject above.",
    confirmStepOne: "Search the subject.",
    confirmStepTwo: "Open the message.",
    confirmStepThree: "Click the confirmation link.",
    confirmRevealSurveyLabel: "Confirmed. Shape what comes next.",
    confirmRevealSurveySupport: "Takes under a minute. Helps tailor future letters to your context.",
    confirmFutureAnchor: "First essay arrives Spring 2026.",
    confirmHookLead: "What we will explore:",
    confirmHookOne: "Compounding advantage",
    confirmHookTwo: "Dynamic capabilities",
    confirmHookThree: "Strategy beyond the quarter",
    surveyTitle: "Help me understand who is building with us",
    surveyDescription:
      "Four quick fields help me map who is building for the long term.",
    surveyPositionLabel: "Position",
    surveyCompanyLabel: "Company",
    surveyTeamSizeLabel: "How many people do you lead?",
    surveyImpactLabel: "How many customers are impacted monthly?",
    surveySubmitLabel: "Complete my profile",
    surveySkipLabel: "Skip for now",
    surveySavedLabel: "Thanks - your profile was saved.",
    subscribeErrorLabel: "We couldn't process your subscription. Please try again.",
    profileErrorLabel: "We couldn't save your profile right now. Please try again.",
    unsubscribedTitle: "Unsubscribed",
    unsubscribedDescription: "You will no longer receive this newsletter.",
  },
  "pt-br": {
    consentTextBeforeLink: "Concordo em receber a newsletter e aceito a",
    consentLinkLabel: "política de privacidade",
    consentTextAfterLink: ".",
    writingTitleLead: "Leituras que valem a",
    writingTitleEmphasis: "espera",
    writingDescription:
      "Novos ensaios sobre estratégia e vantagem composta, enviados direto para seu e-mail. Sem ruído, sem pressão de calendário - apenas ideias quando estiverem prontas.",
    emailPlaceholder: "Seu e-mail",
    subscribeButton: "Assinar",
    unsubscribeNote: "Geralmente uma vez por mês. Cancele quando quiser.",
    thanksTitle: "Inscrição confirmada.",
    thanksDescription: "Você entrou em um grupo pequeno que está construindo no longo prazo.",
    thanksInboxNote: "Abra o e-mail de confirmação para concluir seu acesso.",
    identityLine: "Você agora faz parte de uma conversa de longo horizonte.",
    confirmChecklistTitle: "Mais um passo para ativar sua inscrição",
    confirmChecklistLead: "Abra o e-mail de confirmação para concluir seu acesso.",
    confirmSubjectLabel: "Pesquise por este assunto de e-mail:",
    confirmCopyHint: "Dica: copie e cole este assunto na busca do seu e-mail.",
    confirmOpenGmailLabel: "Abrir Gmail",
    confirmOpenOutlookLabel: "Abrir Outlook",
    confirmAppleHint: "Apple Mail: abra sua caixa de entrada e busque o assunto acima.",
    confirmStepOne: "Busque o assunto.",
    confirmStepTwo: "Abra a mensagem.",
    confirmStepThree: "Clique no link de confirmação.",
    confirmRevealSurveyLabel: "Confirmado. Ajude a moldar os proximos envios.",
    confirmRevealSurveySupport: "Leva menos de um minuto e melhora a relevancia das proximas cartas.",
    confirmFutureAnchor: "Primeiro ensaio chega na Primavera de 2026.",
    confirmHookLead: "O que vamos explorar:",
    confirmHookOne: "Vantagem composta",
    confirmHookTwo: "Capacidades dinâmicas",
    confirmHookThree: "Estratégia além do trimestre",
    surveyTitle: "Ajude-me a entender quem está construindo com a gente",
    surveyDescription:
      "Quatro campos rápidos me ajudam a mapear quem está construindo no longo prazo.",
    surveyPositionLabel: "Cargo",
    surveyCompanyLabel: "Empresa",
    surveyTeamSizeLabel: "Quantas pessoas você lidera?",
    surveyImpactLabel: "Quantos clientes são impactados por mês?",
    surveySubmitLabel: "Concluir meu perfil",
    surveySkipLabel: "Pular por agora",
    surveySavedLabel: "Obrigado - seu perfil foi salvo.",
    subscribeErrorLabel: "Não foi possível processar sua inscrição. Tente novamente.",
    profileErrorLabel: "Não foi possível salvar seu perfil agora. Tente novamente.",
    unsubscribedTitle: "Inscrição cancelada",
    unsubscribedDescription: "Você não receberá mais esta newsletter.",
  },
  "pt-pt": {
    consentTextBeforeLink: "Concordo em receber a newsletter e aceito a",
    consentLinkLabel: "política de privacidade",
    consentTextAfterLink: ".",
    writingTitleLead: "Leituras que valem a",
    writingTitleEmphasis: "espera",
    writingDescription:
      "Novos ensaios sobre estratégia e vantagem composta, enviados diretamente para o seu email. Sem ruído, sem pressão de calendário - apenas ideias quando estiverem prontas.",
    emailPlaceholder: "O seu email",
    subscribeButton: "Subscrever",
    unsubscribeNote: "Normalmente uma vez por mês. Cancelar a qualquer momento.",
    thanksTitle: "Subscrição confirmada.",
    thanksDescription:
      "Entrou num grupo pequeno que está a construir no longo prazo.",
    thanksInboxNote: "Abra o email de confirmação para concluir o seu acesso.",
    identityLine: "Faz agora parte de uma conversa de longo horizonte.",
    confirmChecklistTitle: "Mais um passo para ativar a subscrição",
    confirmChecklistLead: "Abra o email de confirmação para concluir o seu acesso.",
    confirmSubjectLabel: "Pesquise por este assunto de email:",
    confirmCopyHint: "Dica: copie e cole este assunto na pesquisa do seu email.",
    confirmOpenGmailLabel: "Abrir Gmail",
    confirmOpenOutlookLabel: "Abrir Outlook",
    confirmAppleHint: "Apple Mail: abra a Caixa de Entrada e pesquise o assunto acima.",
    confirmStepOne: "Pesquise o assunto.",
    confirmStepTwo: "Abra a mensagem.",
    confirmStepThree: "Clique na ligação de confirmação.",
    confirmRevealSurveyLabel: "Confirmado. Ajude a moldar os proximos envios.",
    confirmRevealSurveySupport: "Demora menos de um minuto e melhora a relevancia das proximas cartas.",
    confirmFutureAnchor: "O primeiro ensaio chega na Primavera de 2026.",
    confirmHookLead: "O que vamos explorar:",
    confirmHookOne: "Vantagem composta",
    confirmHookTwo: "Capacidades dinâmicas",
    confirmHookThree: "Estratégia para além do trimestre",
    surveyTitle: "Ajude-me a perceber quem está a construir connosco",
    surveyDescription:
      "Quatro campos rápidos ajudam-me a mapear quem está a construir no longo prazo.",
    surveyPositionLabel: "Função",
    surveyCompanyLabel: "Empresa",
    surveyTeamSizeLabel: "Quantas pessoas lidera?",
    surveyImpactLabel: "Quantos clientes são impactados por mês?",
    surveySubmitLabel: "Concluir o meu perfil",
    surveySkipLabel: "Saltar por agora",
    surveySavedLabel: "Obrigado - o seu perfil foi guardado.",
    subscribeErrorLabel: "Não foi possível processar a subscrição. Tente novamente.",
    profileErrorLabel: "Não foi possível guardar o seu perfil agora. Tente novamente.",
    unsubscribedTitle: "Subscrição cancelada",
    unsubscribedDescription: "Já não receberá esta newsletter.",
  },
  "fr-fr": {
    consentTextBeforeLink: "J'accepte de recevoir la newsletter et la",
    consentLinkLabel: "politique de confidentialite",
    consentTextAfterLink: ".",
    writingTitleLead: "Des analyses qui valent",
    writingTitleEmphasis: "l'attente",
    writingDescription:
      "De nouveaux essais sur la strategie et l'avantage cumulatif, envoyes directement dans votre boite mail. Sans bruit, sans pression de calendrier - seulement des idees, quand elles sont pretes.",
    emailPlaceholder: "Votre e-mail",
    subscribeButton: "S'abonner",
    unsubscribeNote: "En general une fois par mois. Desabonnement a tout moment.",
    thanksTitle: "Inscription confirmee.",
    thanksDescription:
      "Vous avez rejoint un petit groupe qui construit sur le long terme.",
    thanksInboxNote: "Ouvrez l'email de confirmation pour finaliser votre acces.",
    identityLine: "Vous faites maintenant partie d'une conversation long-horizon.",
    confirmChecklistTitle: "Une etape de plus pour activer votre inscription",
    confirmChecklistLead: "Ouvrez l'email de confirmation pour finaliser votre acces.",
    confirmSubjectLabel: "Recherchez cet objet exact :",
    confirmCopyHint: "Astuce : copiez-collez cet objet dans la recherche de votre messagerie.",
    confirmOpenGmailLabel: "Ouvrir Gmail",
    confirmOpenOutlookLabel: "Ouvrir Outlook",
    confirmAppleHint: "Apple Mail : ouvrez votre boite de reception et recherchez l'objet ci-dessus.",
    confirmStepOne: "Recherchez l'objet.",
    confirmStepTwo: "Ouvrez le message.",
    confirmStepThree: "Cliquez sur le lien de confirmation.",
    confirmRevealSurveyLabel: "Confirme. Faconnons la suite.",
    confirmRevealSurveySupport: "Moins d'une minute. Cela aide a ajuster les prochaines lettres a votre contexte.",
    confirmFutureAnchor: "Premiere lettre: Printemps 2026.",
    confirmHookLead: "Ce que nous allons explorer :",
    confirmHookOne: "Avantage cumulatif",
    confirmHookTwo: "Capacites dynamiques",
    confirmHookThree: "Strategie au-dela du trimestre",
    surveyTitle: "Aidez-moi a comprendre qui construit avec nous",
    surveyDescription:
      "Quatre champs rapides m'aident a comprendre qui construit sur le long terme.",
    surveyPositionLabel: "Poste",
    surveyCompanyLabel: "Entreprise",
    surveyTeamSizeLabel: "Combien de personnes dirigez-vous ?",
    surveyImpactLabel: "Combien de clients impactez-vous chaque mois ?",
    surveySubmitLabel: "Finaliser mon profil",
    surveySkipLabel: "Passer pour l'instant",
    surveySavedLabel: "Merci - votre profil a ete enregistre.",
    subscribeErrorLabel: "Impossible de traiter votre inscription. Veuillez reessayer.",
    profileErrorLabel: "Impossible d'enregistrer votre profil. Veuillez reessayer.",
    unsubscribedTitle: "Desinscription confirmee",
    unsubscribedDescription: "Vous ne recevrez plus cette newsletter.",
  },
};

export const getNewsletterCopy = (locale: LocaleKey): NewsletterCopy =>
  COPY_BY_LOCALE[locale] || COPY_BY_LOCALE["en-us"];
