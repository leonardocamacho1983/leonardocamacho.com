export const SITE_SETTINGS_QUERY = `
*[_type == "siteSettings" && locale == $locale][0] {
  locale,
  siteTitle,
  siteSubtitle,
  navigation[]{label, route},
  languageOptions[]{locale, label, flag},
  footerQuote,
  footerLinks[]{label, url},
  copyrightLine,
  newsletterEndpoint,
  newsletterMethod,
  newsletterPrivacyUrl,
  newsletterConsentPolicyVersion,
  contactEmail,
  seoTitle,
  seoDescription,
  seoImage
}`;

export const HOME_PAGE_QUERY = `
*[_type == "homePage" && locale == $locale][0] {
  locale,
  heroKicker,
  heroTitle,
  heroTitleEmphasis,
  heroDescription,
  heroCtaLabel,
  "heroCtaPost": heroCtaPost->{"slug": slug.current},
  heroImage,
  heroLocationLabel,
  credibilityLabel,
  credibilityItems[]{name},
  featuredSectionTitle,
  featuredViewAllLabel,
  featuredRecentPostsLabel,
  "featuredMainPost": featuredMainPost->{
    "id": _id,
    locale,
    translationKey,
    templateVariant,
    title,
    titleEmphasis,
    "slug": slug.current,
    excerpt,
    coverImage,
    "category": category->{
      "id": _id,
      locale,
      translationKey,
      title,
      "slug": slug.current,
      color,
      order
    },
    publishedAt,
    "updatedAt": _updatedAt,
    readTimeMinutes,
    featuredOnHome,
    featuredInArchive
  },
  "featuredInsightPost": featuredInsightPost->{
    "id": _id,
    locale,
    translationKey,
    templateVariant,
    title,
    titleEmphasis,
    "slug": slug.current,
    excerpt,
    coverImage,
    "category": category->{
      "id": _id,
      locale,
      translationKey,
      title,
      "slug": slug.current,
      color,
      order
    },
    publishedAt,
    "updatedAt": _updatedAt,
    readTimeMinutes,
    featuredOnHome,
    featuredInArchive
  },
  "featuredRecentPosts": featuredRecentPosts[]->{
    "id": _id,
    locale,
    translationKey,
    templateVariant,
    title,
    titleEmphasis,
    "slug": slug.current,
    excerpt,
    coverImage,
    "category": category->{
      "id": _id,
      locale,
      translationKey,
      title,
      "slug": slug.current,
      color,
      order
    },
    publishedAt,
    "updatedAt": _updatedAt,
    readTimeMinutes,
    featuredOnHome,
    featuredInArchive
  },
  aboutKicker,
  aboutHeadline,
  aboutBody,
  aboutCtaLabel,
  stayUpdatedTitle,
  stayUpdatedDescription,
  stayUpdatedPlaceholder,
  stayUpdatedButtonLabel,
  stayUpdatedTexture
}`;

export const ABOUT_PAGE_QUERY = `
*[_type == "aboutPage" && locale == $locale][0] {
  locale,
  backToHomeLabel,
  introKicker,
  introTitle,
  introTitleEmphasis,
  introParagraphOne,
  introParagraphTwo,
  introImage,
  beliefKicker,
  beliefQuote,
  beliefBody,
  whatIDoKicker,
  services[]{icon, title, description},
  careerPathKicker,
  timeline[]{period, title, description, highlight},
  galleryImages,
  galleryCaption,
  connectTitle,
  connectTitleEmphasis,
  connectDescription,
  connectPrimaryLabel,
  connectPrimaryUrl,
  connectSecondaryLabel,
  connectSecondaryRoute
}`;

export const WRITING_PAGE_QUERY = `
*[_type == "writingPage" && locale == $locale][0] {
  locale,
  backToHomeLabel,
  archiveKicker,
  archiveTitle,
  archiveTitleEmphasis,
  archiveDescription,
  searchPlaceholder,
  allFilterLabel,
  emptyStateTitle,
  emptyStateDescription
}`;

export const CATEGORIES_QUERY = `
*[_type == "category" && locale == $locale] | order(order asc) {
  "id": _id,
  locale,
  translationKey,
  title,
  "slug": slug.current,
  color,
  order
}`;

export const POSTS_QUERY = `
*[_type == "post" && locale == $locale && defined(slug.current)] | order(publishedAt desc) {
  "id": _id,
  locale,
  translationKey,
  templateVariant,
  title,
  titleEmphasis,
  "slug": slug.current,
  excerpt,
  coverImage,
  "category": category->{
    "id": _id,
    locale,
    translationKey,
    title,
    "slug": slug.current,
    color,
    order
  },
  publishedAt,
  "updatedAt": _updatedAt,
  readTimeMinutes,
  featuredOnHome,
  featuredInArchive
}`;

export const POST_BY_SLUG_QUERY = `
*[_type == "post" && locale == $locale && slug.current == $slug][0] {
  "id": _id,
  locale,
  translationKey,
  templateVariant,
  title,
  titleEmphasis,
  "slug": slug.current,
  excerpt,
  coverImage,
  "category": category->{
    "id": _id,
    locale,
    translationKey,
    title,
    "slug": slug.current,
    color,
    order
  },
  publishedAt,
  "updatedAt": _updatedAt,
  readTimeMinutes,
  featuredOnHome,
  featuredInArchive,
  flagshipHeroMode,
  body[]{
    ...,
    _type == "diagramEmbed" => {
      _type,
      _key,
      diagramKey,
      label,
      caption
    }
  },
  editorialPlan{
    clusterRole,
    mustLinkTo,
    internalLinkPlan[]{
      target,
      kind,
      purpose,
      anchorHint
    }
  },
  seoTitle,
  seoDescription,
  seoImage,
  "translations": *[_type == "post" && translationKey == ^.translationKey && defined(slug.current)] {
    locale,
    "slug": slug.current
  }
}`;
