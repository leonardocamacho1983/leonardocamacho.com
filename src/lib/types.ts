import type { LocaleKey } from "./locales";

export interface LocaleLinkDTO {
  locale: LocaleKey;
  label: string;
  flag: string;
  href: string;
  available: boolean;
}

export interface SiteSettingsDTO {
  locale: LocaleKey;
  siteTitle: string;
  siteSubtitle: string;
  navigation: Array<{ label: string; route: "home" | "about" | "writing" }>;
  languageOptions: Array<{ locale: LocaleKey; label: string; flag: string }>;
  footerQuote: string;
  footerLinks: Array<{ label: string; url: string }>;
  copyrightLine: string;
  newsletterEndpoint: string;
  newsletterMethod: "POST" | "GET";
  newsletterPrivacyUrl?: string;
  newsletterConsentPolicyVersion?: string;
  contactEmail: string;
  seoTitle: string;
  seoDescription: string;
  seoImage?: unknown;
}

export interface CategoryDTO {
  id: string;
  locale: LocaleKey;
  translationKey: string;
  title: string;
  slug: string;
  color: string;
  order: number;
}

export interface PostCardDTO {
  id: string;
  locale: LocaleKey;
  translationKey: string;
  title: string;
  titleEmphasis?: string;
  slug: string;
  excerpt: string;
  coverImage?: unknown;
  category: CategoryDTO | null;
  publishedAt: string;
  readTimeMinutes: number;
  featuredOnHome: boolean;
  featuredInArchive: boolean;
}

export interface PostDetailDTO extends PostCardDTO {
  body: unknown[];
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: unknown;
  translations: Array<{ locale: LocaleKey; slug: string }>;
}

export interface HomePageDTO {
  locale: LocaleKey;
  heroKicker: string;
  heroTitle: string;
  heroTitleEmphasis: string;
  heroDescription: string;
  heroCtaLabel: string;
  heroCtaPost: { slug: string } | null;
  heroImage?: unknown;
  heroLocationLabel: string;
  credibilityLabel: string;
  credibilityItems: Array<{ name: string }>;
  featuredSectionTitle: string;
  featuredViewAllLabel: string;
  featuredMainPost: PostCardDTO | null;
  featuredInsightPost: PostCardDTO | null;
  featuredRecentPostsLabel: string;
  featuredRecentPosts: PostCardDTO[];
  aboutKicker: string;
  aboutHeadline: string;
  aboutBody: string;
  aboutCtaLabel: string;
  stayUpdatedTitle: string;
  stayUpdatedDescription: string;
  stayUpdatedPlaceholder: string;
  stayUpdatedButtonLabel: string;
  stayUpdatedTexture?: unknown;
}

export interface AboutPageDTO {
  locale: LocaleKey;
  backToHomeLabel: string;
  introKicker: string;
  introTitle: string;
  introTitleEmphasis: string;
  introParagraphOne: string;
  introParagraphTwo: string;
  introImage?: unknown;
  beliefKicker: string;
  beliefQuote: string;
  beliefBody: string;
  whatIDoKicker: string;
  services: Array<{ icon: string; title: string; description: string }>;
  careerPathKicker: string;
  timeline: Array<{
    period: string;
    title: string;
    description: string;
    highlight: boolean;
  }>;
  galleryImages: Array<{ alt?: string; asset?: unknown }>;
  galleryCaption: string;
  connectTitle: string;
  connectTitleEmphasis: string;
  connectDescription: string;
  connectPrimaryLabel: string;
  connectPrimaryUrl: string;
  connectSecondaryLabel: string;
  connectSecondaryRoute: "home" | "writing";
}

export interface WritingPageDTO {
  locale: LocaleKey;
  backToHomeLabel: string;
  archiveKicker: string;
  archiveTitle: string;
  archiveTitleEmphasis: string;
  archiveDescription: string;
  searchPlaceholder: string;
  allFilterLabel: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
}
