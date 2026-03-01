import { createClient } from "@sanity/client";

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN;
const apiVersion = process.env.SANITY_API_VERSION || "2025-02-01";

if (!projectId || !token) {
  console.error("Missing required env vars. Set PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN (or SANITY_API_READ_TOKEN).");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion,
  useCdn: false,
});

const locales = ["en-us", "en-gb", "pt-br", "pt-pt", "fr-fr"];

const languageMeta = {
  "en-us": { label: "English (US)", flag: "🇺🇸" },
  "en-gb": { label: "English (UK)", flag: "🇬🇧" },
  "pt-br": { label: "Português (BR)", flag: "🇧🇷" },
  "pt-pt": { label: "Português (PT)", flag: "🇵🇹" },
  "fr-fr": { label: "Français (FR)", flag: "🇫🇷" },
};

const categories = [
  { key: "essay", title: "Essays", slug: "essays", color: "#b8564f", order: 0 },
  { key: "insight", title: "Insights", slug: "insights", color: "#6b8f71", order: 1 },
  { key: "research", title: "Research", slug: "research", color: "#5b7b9a", order: 2 },
  { key: "note", title: "Notes", slug: "notes", color: "#9a8b6b", order: 3 },
];

const posts = [
  {
    key: "architecture-durable-companies",
    title: "The Architecture of",
    titleEmphasis: "Durable Companies",
    excerpt:
      "What structural properties make an organization capable of growing for decades — and what causes the rest to plateau after their first inflection point.",
    category: "essay",
    publishedAt: "2025-03-01T00:00:00.000Z",
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
    publishedAt: "2024-11-01T00:00:00.000Z",
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
    publishedAt: "2025-02-01T00:00:00.000Z",
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
    publishedAt: "2024-09-01T00:00:00.000Z",
    readTimeMinutes: 18,
    featuredOnHome: false,
    featuredInArchive: false,
  },
  {
    key: "compound-effect-organizational-culture",
    title: "The Compound Effect in",
    titleEmphasis: "Organizational Culture",
    excerpt:
      "Culture compounds like interest. Small, consistent leadership signals create exponential divergence in organizational outcomes.",
    category: "essay",
    publishedAt: "2024-07-01T00:00:00.000Z",
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
    publishedAt: "2024-06-01T00:00:00.000Z",
    readTimeMinutes: 6,
    featuredOnHome: false,
    featuredInArchive: false,
  },
  {
    key: "scaling-without-losing-soul",
    title: "Notes on Scaling Without",
    titleEmphasis: "Losing Your Soul",
    excerpt:
      "A reflection on what happens when companies cross the 200-person threshold and the compromises that erode founding intent.",
    category: "note",
    publishedAt: "2024-05-01T00:00:00.000Z",
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
    publishedAt: "2024-04-01T00:00:00.000Z",
    readTimeMinutes: 12,
    featuredOnHome: false,
    featuredInArchive: false,
  },
  {
    key: "lessons-quiet-compounders",
    title: "Lessons from the Quiet",
    titleEmphasis: "Compounders",
    excerpt:
      "The companies that compound longest are rarely the ones making headlines. A study of under-the-radar organizations.",
    category: "insight",
    publishedAt: "2024-02-01T00:00:00.000Z",
    readTimeMinutes: 9,
    featuredOnHome: false,
    featuredInArchive: false,
  },
  {
    key: "finding-your-strategic-edge",
    title: "On Finding Your Strategic Edge",
    excerpt:
      "A letter to a founder: how to know when your strategy is working versus when outcomes are mostly luck.",
    category: "note",
    publishedAt: "2024-01-01T00:00:00.000Z",
    readTimeMinutes: 4,
    featuredOnHome: false,
    featuredInArchive: false,
  },
];

const documents = [];

for (const locale of locales) {
  for (const category of categories) {
    documents.push({
      _id: `category-${category.key}-${locale}`,
      _type: "category",
      locale,
      translationKey: category.key,
      title: category.title,
      slug: { current: category.slug },
      color: category.color,
      order: category.order,
    });
  }

  for (const post of posts) {
    documents.push({
      _id: `post-${post.key}-${locale}`,
      _type: "post",
      locale,
      translationKey: post.key,
      title: post.title,
      titleEmphasis: post.titleEmphasis,
      slug: { current: post.key },
      excerpt: post.excerpt,
      category: {
        _type: "reference",
        _ref: `category-${post.category}-${locale}`,
      },
      publishedAt: post.publishedAt,
      readTimeMinutes: post.readTimeMinutes,
      featuredOnHome: post.featuredOnHome,
      featuredInArchive: post.featuredInArchive,
      body: [
        {
          _type: "block",
          _key: `body-${post.key}-${locale}`,
          style: "normal",
          markDefs: [],
          children: [
            {
              _type: "span",
              _key: `span-${post.key}-${locale}`,
              text: `${post.excerpt}\n\nThis seed content is a placeholder. Replace it with the final article body in Studio.`,
              marks: [],
            },
          ],
        },
      ],
    });
  }

  documents.push(
    {
      _id: `siteSettings-${locale}`,
      _type: "siteSettings",
      locale,
      siteTitle: "Leonardo Camacho",
      siteSubtitle: "Executive · Doctoral Researcher",
      navigation: [
        { _type: "object", label: "Home", route: "home" },
        { _type: "object", label: "About", route: "about" },
        { _type: "object", label: "Writing", route: "writing" },
      ],
      languageOptions: locales.map((item) => ({
        _type: "object",
        locale: item,
        label: languageMeta[item].label,
        flag: languageMeta[item].flag,
      })),
      footerQuote: '"The best organizations are not built — they are cultivated."',
      footerLinks: [
        { _type: "object", label: "LinkedIn", url: "https://www.linkedin.com" },
        { _type: "object", label: "Twitter", url: "https://twitter.com" },
        { _type: "object", label: "Email", url: "mailto:hello@example.com" },
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
    },
    {
      _id: `homePage-${locale}`,
      _type: "homePage",
      locale,
      heroKicker: "On Strategy, Organizations & Compounding Advantage",
      heroTitle: "Building Companies",
      heroTitleEmphasis: "That Compound",
      heroDescription:
        "Executive and doctoral researcher focused on how leaders design organizations that adapt, scale, and sustain advantage.",
      heroCtaLabel: "Start with this essay",
      heroCtaPost: { _type: "reference", _ref: `post-architecture-durable-companies-${locale}` },
      heroLocationLabel: "Florianópolis, Brazil",
      credibilityLabel: "Featured & Referenced In",
      credibilityItems: [
        { _type: "object", name: "Harvard Business Review" },
        { _type: "object", name: "McKinsey & Company" },
        { _type: "object", name: "Stanford GSB" },
        { _type: "object", name: "World Economic Forum" },
        { _type: "object", name: "INSEAD" },
      ],
      featuredSectionTitle: "Featured Writing",
      featuredViewAllLabel: "View All",
      featuredMainPost: { _type: "reference", _ref: `post-architecture-durable-companies-${locale}` },
      featuredInsightPost: { _type: "reference", _ref: `post-patterns-founders-lose-clarity-${locale}` },
      featuredRecentPostsLabel: "Recent Writings",
      featuredRecentPosts: [
        { _type: "reference", _ref: `post-framework-organizational-adaptability-${locale}` },
        { _type: "reference", _ref: `post-managerial-plasticity-${locale}` },
      ],
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
    },
    {
      _id: `aboutPage-${locale}`,
      _type: "aboutPage",
      locale,
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
          _type: "object",
          icon: "target",
          title: "Strategic Advisory",
          description:
            "Working with founders and boards to clarify strategic direction, design competitive moats, and build decision-making frameworks that compound advantage over time.",
        },
        {
          _type: "object",
          icon: "users",
          title: "Organizational Design",
          description:
            "Helping leadership teams restructure their organizations for the next phase of growth without losing cultural coherence.",
        },
        {
          _type: "object",
          icon: "book",
          title: "Research & Writing",
          description:
            "Publishing original research on strategy, adaptive organizations, and the structural properties of durable companies.",
        },
        {
          _type: "object",
          icon: "graduation",
          title: "Executive Education",
          description:
            "Teaching and facilitating sessions for senior leaders on organizational adaptability, strategic clarity, and compounding advantage.",
        },
      ],
      careerPathKicker: "Career Path",
      timeline: [
        {
          _type: "object",
          period: "2024 –",
          title: "Doctoral Researcher, INSEAD",
          description:
            "Investigating why certain organizations compound strategic advantage while similar peers plateau — with a focus on adaptive capacity at scale.",
          highlight: true,
        },
        {
          _type: "object",
          period: "2021 – 2024",
          title: "Fractional Chief Strategy Officer",
          description:
            "Partnered with growth-stage companies to redesign organizational architecture for the next phase of compounding.",
          highlight: false,
        },
        {
          _type: "object",
          period: "2017 – 2021",
          title: "VP of Strategy, Meridian Group",
          description:
            "Led corporate strategy for a multi-billion industrial holding company across Latin America.",
          highlight: false,
        },
      ],
      galleryCaption: "Research · Teaching · Advisory",
      connectTitle: "Let's",
      connectTitleEmphasis: "Connect",
      connectDescription:
        "Whether you're rethinking your organization's architecture, working through a strategic inflection point, or simply want to exchange ideas — I'd welcome the conversation.",
      connectPrimaryLabel: "Get in Touch",
      connectPrimaryUrl: "mailto:hello@example.com",
      connectSecondaryLabel: "Read My Writing",
      connectSecondaryRoute: "writing",
    },
    {
      _id: `writingPage-${locale}`,
      _type: "writingPage",
      locale,
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
    },
  );
}

console.log(`Seeding ${documents.length} documents to ${projectId}/${dataset}...`);

for (const doc of documents) {
  await client.createOrReplace(doc);
}

console.log("Seed completed.");
