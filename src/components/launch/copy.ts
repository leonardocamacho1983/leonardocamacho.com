import type { LocaleKey } from "@/lib/locales";
import type { LaunchCopy } from "./types";

const COPY_BY_LOCALE: Record<LocaleKey, LaunchCopy> = {
  "en-us": {
    domainLabel: "leonardocamacho.com",
    title: "Building Companies That Compound",
    titleLines: [
      { text: "Building Companies" },
      { text: "That" },
      { text: "Compound", accent: true },
    ],
    subtitle:
      "A weekly email for founders and executives on strategy, organizational design, and decisions that compound over time.",
    cta: "GET THE NEXT ESSAY",
    placeholder: "Work email",
    footerNote: "One high-quality email per week. No spam. Unsubscribe anytime.",
    secondaryLink: "READ THE LATEST ISSUE →",
    featuredLabelFallback: "Strategy",
    readPrefix: "READ",
    linkedinLabel: "on LinkedIn",
  },
  "en-gb": {
    domainLabel: "leonardocamacho.com",
    title: "Building Companies That Compound",
    titleLines: [
      { text: "Building Companies" },
      { text: "That" },
      { text: "Compound", accent: true },
    ],
    subtitle:
      "A weekly email for founders and executives on strategy, organizational design, and decisions that compound over time.",
    cta: "GET THE NEXT ESSAY",
    placeholder: "Work email",
    footerNote: "One high-quality email per week. No spam. Unsubscribe anytime.",
    secondaryLink: "READ THE LATEST ISSUE →",
    featuredLabelFallback: "Strategy",
    readPrefix: "READ",
    linkedinLabel: "on LinkedIn",
  },
  "pt-br": {
    domainLabel: "leonardocamacho.com",
    title: "Construindo Empresas de Valor Composto",
    titleLines: [
      { text: "Construindo Empresas" },
      { text: "de Valor" },
      { text: "Composto", accent: true },
    ],
    subtitle:
      "Conhecimento que se acumula na prática. Clareza para decisões. Uma publicação semanal para quem constrói organizações que duram.",
    cta: "RECEBER O PRÓXIMO INSIGHT",
    placeholder: "E-mail corporativo",
    footerNote: "Um e-mail de alta qualidade por semana. Sem spam. Cancele quando quiser.",
    secondaryLink: "LER A ÚLTIMA EDIÇÃO →",
    featuredLabelFallback: "Estratégia",
    readPrefix: "LER",
    linkedinLabel: "no LinkedIn",
  },
  "pt-pt": {
    domainLabel: "leonardocamacho.com",
    title: "Construindo Empresas de Valor Composto",
    titleLines: [
      { text: "Construindo Empresas" },
      { text: "de Valor" },
      { text: "Composto", accent: true },
    ],
    subtitle:
      "Conhecimento que se acumula na prática. Clareza para decisões. Uma publicação semanal para quem constrói organizações que duram.",
    cta: "RECEBER O PRÓXIMO INSIGHT",
    placeholder: "E-mail profissional",
    footerNote: "Uma publicação de qualidade por semana. Sem spam. Cancelamento a qualquer momento.",
    secondaryLink: "LER A ÚLTIMA EDIÇÃO →",
    featuredLabelFallback: "Estratégia",
    readPrefix: "LER",
    linkedinLabel: "no LinkedIn",
  },
  "fr-fr": {
    domainLabel: "leonardocamacho.com",
    title: "Construire des Entreprises à Valeur Composée",
    titleLines: [
      { text: "Construire des" },
      { text: "Entreprises à Valeur" },
      { text: "Composée", accent: true },
    ],
    subtitle:
      "Un savoir qui s'accumule dans la pratique. De la clarté pour décider. Une publication hebdomadaire pour ceux qui bâtissent des organisations qui durent.",
    cta: "RECEVOIR LE PROCHAIN INSIGHT",
    placeholder: "E-mail professionnel",
    footerNote: "Une publication de qualité par semaine. Sans spam. Résiliation à tout moment.",
    secondaryLink: "LIRE LA DERNIÈRE ÉDITION →",
    featuredLabelFallback: "Stratégie",
    readPrefix: "LIRE",
    linkedinLabel: "sur LinkedIn",
  },
};

export const getLaunchHomeCopy = (locale: LocaleKey): LaunchCopy => COPY_BY_LOCALE[locale] || COPY_BY_LOCALE["en-us"];
