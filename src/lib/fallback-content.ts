import type {
  AboutPageDTO,
  CategoryDTO,
  HomePageDTO,
  PostCardDTO,
  SiteSettingsDTO,
  WritingPageDTO,
} from "./types";
import type { LocaleKey } from "./locales";

const baseSettings: Omit<SiteSettingsDTO, "locale"> = {
  siteTitle: "Leonardo Camacho",
  siteSubtitle: "Executive · Doctoral Researcher",
  navigation: [
    { label: "Home", route: "home" },
    { label: "About", route: "about" },
    { label: "Writing", route: "writing" },
  ],
  languageOptions: [
    { locale: "en-us", label: "English (US)", flag: "🇺🇸" },
    { locale: "en-gb", label: "English (UK)", flag: "🇬🇧" },
    { locale: "pt-br", label: "Português (BR)", flag: "🇧🇷" },
    { locale: "pt-pt", label: "Português (PT)", flag: "🇵🇹" },
    { locale: "fr-fr", label: "Français (FR)", flag: "🇫🇷" },
  ],
  footerQuote: '"The best organizations are not built — they are cultivated."',
  footerLinks: [
    { label: "LinkedIn", url: "https://www.linkedin.com" },
    { label: "Twitter", url: "https://twitter.com" },
    { label: "Email", url: "mailto:hello@example.com" },
  ],
  copyrightLine: "© 2025 Leonardo Camacho",
  newsletterEndpoint: "https://example.com/newsletter",
  newsletterMethod: "POST",
  newsletterPrivacyUrl: "https://example.com/privacy",
  newsletterConsentPolicyVersion: "v1",
  contactEmail: "hello@example.com",
  seoTitle: "Leonardo Camacho",
  seoDescription:
    "Executive and doctoral researcher focused on strategy, organizational design, and compounding advantage.",
};

const baseCategories: Omit<CategoryDTO, "id" | "locale">[] = [
  { translationKey: "essay", title: "Essays", slug: "essays", color: "essay", order: 0 },
  { translationKey: "insight", title: "Insights", slug: "insights", color: "insight", order: 1 },
  { translationKey: "research", title: "Research", slug: "research", color: "research", order: 2 },
  { translationKey: "note", title: "Notes", slug: "notes", color: "note", order: 3 },
];

const postsSeed = [
  {
    key: "architecture-durable-companies",
    title: "The Architecture of",
    titleEmphasis: "Durable Companies",
    excerpt:
      "What structural properties make an organization capable of growing for decades — and what causes the rest to plateau after their first inflection point.",
    category: "essay",
    date: "2025-03-01T00:00:00.000Z",
    readTimeMinutes: 14,
    featuredOnHome: true,
    featuredInArchive: true,
  },
  {
    key: "patterns-founders-lose-clarity",
    title: "Three Patterns in How",
    titleEmphasis: "Founders Lose Strategic Clarity",
    excerpt:
      "After studying 40+ growth-stage companies, three recurring failure modes emerged — each rooted in how founders relate to earlier decisions.",
    category: "insight",
    date: "2024-11-01T00:00:00.000Z",
    readTimeMinutes: 8,
    featuredOnHome: true,
    featuredInArchive: true,
  },
  {
    key: "framework-organizational-adaptability",
    title: "A Framework for Mapping",
    titleEmphasis: "Organizational Adaptability",
    excerpt:
      "Introducing a diagnostic framework that measures an organization's capacity to restructure under pressure without losing coherence.",
    category: "research",
    date: "2025-02-01T00:00:00.000Z",
    readTimeMinutes: 22,
    featuredOnHome: false,
    featuredInArchive: false,
  },
  {
    key: "managerial-plasticity",
    title: "On Managerial Plasticity",
    excerpt:
      "Why the best executives are not the ones who know the most, but the ones who can unlearn the fastest when context shifts.",
    category: "research",
    date: "2024-09-01T00:00:00.000Z",
    readTimeMinutes: 18,
    featuredOnHome: false,
    featuredInArchive: false,
  },
  {
    key: "compound-effect-organizational-culture",
    title: "The Compound Effect in",
    titleEmphasis: "Organizational Culture",
    excerpt:
      "Culture compounds like interest. Small, consistent leadership signals create exponential divergence in outcomes over five years.",
    category: "essay",
    date: "2024-07-01T00:00:00.000Z",
    readTimeMinutes: 11,
    featuredOnHome: false,
    featuredInArchive: false,
  },
  {
    key: "boards-fail-at-strategy",
    title: "Why Most Boards Fail at Strategy",
    excerpt:
      "Board-level strategy conversations tend to optimize for consensus, which systematically selects against bold bets.",
    category: "insight",
    date: "2024-06-01T00:00:00.000Z",
    readTimeMinutes: 6,
    featuredOnHome: false,
    featuredInArchive: false,
  },
  {
    key: "scaling-without-losing-soul",
    title: "Notes on Scaling Without",
    titleEmphasis: "Losing Your Soul",
    excerpt:
      "A reflection on what happens when companies cross the 200-person threshold — and the compromises that erode intent.",
    category: "note",
    date: "2024-05-01T00:00:00.000Z",
    readTimeMinutes: 5,
    featuredOnHome: false,
    featuredInArchive: false,
  },
  {
    key: "second-curve-problem",
    title: "The Second Curve Problem",
    excerpt:
      "Every successful organization faces the same dilemma: when to invest in the next growth curve before the current one peaks.",
    category: "essay",
    date: "2024-04-01T00:00:00.000Z",
    readTimeMinutes: 12,
    featuredOnHome: false,
    featuredInArchive: false,
  },
  {
    key: "lessons-quiet-compounders",
    title: "Lessons from the Quiet",
    titleEmphasis: "Compounders",
    excerpt:
      "The companies that compound longest are rarely the headline makers. A study of five under-the-radar organizations.",
    category: "insight",
    date: "2024-02-01T00:00:00.000Z",
    readTimeMinutes: 9,
    featuredOnHome: false,
    featuredInArchive: false,
  },
  {
    key: "finding-your-strategic-edge",
    title: "On Finding Your Strategic Edge",
    excerpt:
      "A letter to a founder: how to tell if strategy is working versus when outcomes are mostly luck.",
    category: "note",
    date: "2024-01-01T00:00:00.000Z",
    readTimeMinutes: 4,
    featuredOnHome: false,
    featuredInArchive: false,
  },
];

const baseHome: Omit<HomePageDTO, "locale" | "featuredMainPost" | "featuredInsightPost" | "featuredRecentPosts"> = {
  heroKicker: "On Strategy, Organizations & Compounding Advantage",
  heroTitle: "Building Companies",
  heroTitleEmphasis: "That Compound",
  heroDescription:
    "Executive and doctoral researcher focused on how leaders design organizations that adapt, scale, and sustain advantage.",
  heroCtaLabel: "Start with this essay",
  heroCtaPost: { slug: "architecture-durable-companies" },
  heroLocationLabel: "Florianópolis, Brazil",
  credibilityLabel: "Featured & Referenced In",
  credibilityItems: [
    { name: "Harvard Business Review" },
    { name: "McKinsey & Company" },
    { name: "Stanford GSB" },
    { name: "World Economic Forum" },
    { name: "INSEAD" },
  ],
  featuredSectionTitle: "Featured Writing",
  featuredViewAllLabel: "View All",
  featuredRecentPostsLabel: "Recent Writings",
  aboutKicker: "About",
  aboutHeadline:
    "For over fifteen years, I've worked at the intersection of strategy and organizational design — helping founders, boards, and executive teams build companies that outlast their competition.",
  aboutBody:
    "My doctoral research at INSEAD focuses on why certain organizations compound advantage while others plateau. I advise as a fractional executive and strategic partner.",
  aboutCtaLabel: "More about my work",
  stayUpdatedTitle: "Stay Updated",
  stayUpdatedDescription:
    "Get essays on strategy, leadership, and building durable companies delivered to your inbox.",
  stayUpdatedPlaceholder: "Enter your email",
  stayUpdatedButtonLabel: "Subscribe",
};

const baseAbout: Omit<AboutPageDTO, "locale"> = {
  backToHomeLabel: "Back to Home",
  introKicker: "About",
  introTitle: "Leonardo",
  introTitleEmphasis: "Camacho",
  introParagraphOne:
    "Executive, doctoral researcher, and strategic advisor. For over fifteen years, I've worked at the intersection of strategy and organizational design — helping founders, boards, and leadership teams build companies that outlast their competition.",
  introParagraphTwo:
    "Based in Florianópolis, Brazil. Currently pursuing doctoral research at INSEAD on organizational adaptability and compounding advantage.",
  beliefKicker: "Core Belief",
  beliefQuote:
    "The best companies don't win because of a single brilliant decision. They win because they've built the organizational capacity to make consistently good decisions — and to compound the advantage of each one.",
  beliefBody:
    "This conviction drives everything I do — from the research questions I pursue to the way I advise leadership teams. The ones that compound don't rely on genius; they rely on architecture.",
  whatIDoKicker: "What I Do",
  services: [
    {
      icon: "target",
      title: "Strategic Advisory",
      description:
        "Working with founders and boards to clarify strategic direction, design competitive moats, and build decision-making frameworks that compound advantage over time.",
    },
    {
      icon: "users",
      title: "Organizational Design",
      description:
        "Helping leadership teams restructure their organizations for the next phase of growth without losing cultural coherence.",
    },
    {
      icon: "book",
      title: "Research & Writing",
      description:
        "Publishing original research on strategy, adaptive organizations, and the structural properties of durable companies.",
    },
    {
      icon: "graduation",
      title: "Executive Education",
      description:
        "Teaching and facilitating sessions for senior leaders on organizational adaptability, strategic clarity, and compounding advantage.",
    },
  ],
  careerPathKicker: "Career Path",
  timeline: [
    {
      period: "2024 –",
      title: "Doctoral Researcher, INSEAD",
      description:
        "Investigating why certain organizations compound strategic advantage while similar peers plateau — with a focus on adaptive capacity at scale.",
      highlight: true,
    },
    {
      period: "2021 – 2024",
      title: "Fractional Chief Strategy Officer",
      description:
        "Partnered with growth-stage companies to redesign organizational architecture for the next phase of compounding.",
      highlight: false,
    },
    {
      period: "2017 – 2021",
      title: "VP of Strategy, Meridian Group",
      description:
        "Led corporate strategy for a multi-billion industrial holding company across Latin America.",
      highlight: false,
    },
    {
      period: "2013 – 2017",
      title: "Management Consultant, McKinsey & Company",
      description:
        "Served leadership teams on strategy, transformation, and operating model redesign across three continents.",
      highlight: false,
    },
    {
      period: "2011 – 2013",
      title: "MBA, Stanford Graduate School of Business",
      description: "Focused on organizational behavior and strategic management.",
      highlight: false,
    },
  ],
  galleryImages: [],
  galleryCaption: "Research · Teaching · Advisory",
  connectTitle: "Let's",
  connectTitleEmphasis: "Connect",
  connectDescription:
    "Whether you're rethinking your organization's architecture, working through a strategic inflection point, or simply want to exchange ideas — I'd welcome the conversation.",
  connectPrimaryLabel: "Get in Touch",
  connectPrimaryUrl: "mailto:hello@example.com",
  connectSecondaryLabel: "Read My Writing",
  connectSecondaryRoute: "writing",
};

const baseWriting: Omit<WritingPageDTO, "locale"> = {
  backToHomeLabel: "Back to Home",
  archiveKicker: "The Archive",
  archiveTitle: "All",
  archiveTitleEmphasis: "Writing",
  archiveDescription:
    "Essays, insights, and research on strategy, organizational design, and building companies that compound.",
  searchPlaceholder: "Search by title, topic, or keyword...",
  allFilterLabel: "All",
  emptyStateTitle: "No articles found",
  emptyStateDescription: "Try adjusting your search or filter criteria.",
};

export const fallbackSiteSettings = (locale: LocaleKey): SiteSettingsDTO => ({
  ...baseSettings,
  locale,
});

export const fallbackCategories = (locale: LocaleKey): CategoryDTO[] =>
  baseCategories.map((category, index) => ({
    ...category,
    id: `fallback-category-${locale}-${index}`,
    locale,
  }));

export const fallbackPosts = (locale: LocaleKey): PostCardDTO[] => {
  const categoriesByKey = new Map(fallbackCategories(locale).map((item) => [item.translationKey, item]));

  return postsSeed.map((post, index) => ({
    id: `fallback-post-${locale}-${index}`,
    locale,
    translationKey: post.key,
    title: post.title,
    titleEmphasis: post.titleEmphasis,
    slug: post.key,
    excerpt: post.excerpt,
    category: categoriesByKey.get(post.category) || null,
    publishedAt: post.date,
    readTimeMinutes: post.readTimeMinutes,
    featuredOnHome: post.featuredOnHome,
    featuredInArchive: post.featuredInArchive,
  }));
};

export const fallbackHomePage = (locale: LocaleKey): HomePageDTO => {
  const posts = fallbackPosts(locale);
  return {
    ...baseHome,
    locale,
    featuredMainPost: posts[0],
    featuredInsightPost: posts[1],
    featuredRecentPosts: [posts[2], posts[3]],
  };
};

export const fallbackAboutPage = (locale: LocaleKey): AboutPageDTO => ({
  ...baseAbout,
  locale,
});

export const fallbackWritingPage = (locale: LocaleKey): WritingPageDTO => ({
  ...baseWriting,
  locale,
});
