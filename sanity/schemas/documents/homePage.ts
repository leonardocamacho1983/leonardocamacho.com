import { defineArrayMember, defineField, defineType } from "sanity";
import { localeList } from "../../lib/locales";

export const homePageType = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    defineField({
      name: "locale",
      title: "Locale",
      type: "string",
      options: { list: localeList },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroKicker",
      title: "Hero kicker",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroTitle",
      title: "Hero title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroTitleEmphasis",
      title: "Hero title emphasis",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroDescription",
      title: "Hero description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroCtaLabel",
      title: "Hero CTA label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroCtaPost",
      title: "Hero CTA post",
      type: "reference",
      to: [{ type: "post" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alternative text", type: "string" }),
      ],
    }),
    defineField({
      name: "heroLocationLabel",
      title: "Hero location label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "credibilityLabel",
      title: "Credibility strip label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "credibilityItems",
      title: "Credibility items",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Name",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
          ],
        }),
      ],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "featuredSectionTitle",
      title: "Featured section title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "featuredViewAllLabel",
      title: "Featured view-all label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "featuredMainPost",
      title: "Featured main post",
      type: "reference",
      to: [{ type: "post" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "featuredInsightPost",
      title: "Featured insight post",
      type: "reference",
      to: [{ type: "post" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "featuredRecentPostsLabel",
      title: "Recent writings label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "featuredRecentPosts",
      title: "Featured recent posts",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "post" }],
        }),
      ],
      validation: (Rule) => Rule.min(1).max(3),
    }),
    defineField({
      name: "aboutKicker",
      title: "About teaser kicker",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "aboutHeadline",
      title: "About teaser headline",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "aboutBody",
      title: "About teaser body",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "aboutCtaLabel",
      title: "About teaser CTA label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "stayUpdatedTitle",
      title: "Stay updated title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "stayUpdatedDescription",
      title: "Stay updated description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "stayUpdatedPlaceholder",
      title: "Stay updated placeholder",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "stayUpdatedButtonLabel",
      title: "Stay updated button label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "stayUpdatedTexture",
      title: "Stay updated texture image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alternative text", type: "string" }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "heroTitle",
      subtitle: "locale",
    },
  },
});
