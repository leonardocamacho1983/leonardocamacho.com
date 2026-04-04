import { defineField, defineType } from "sanity";
import { localeList } from "../../lib/locales";

export const postType = defineType({
  name: "post",
  title: "Post",
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
      name: "translationKey",
      title: "Translation key",
      type: "string",
      description: "Use the same key for translated versions of this post.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "templateVariant",
      title: "Template variant",
      type: "string",
      options: {
        list: [
          { title: "Standard", value: "standard" },
          { title: "Flagship", value: "flagship" },
        ],
      },
      initialValue: "standard",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "titleEmphasis",
      title: "Title emphasis",
      type: "string",
      description: "Optional emphasized part of the title.",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required().max(360),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alternative text", type: "string" }),
      ],
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      options: {
        filter: ({ document }) => ({
          filter: "locale == $locale",
          params: { locale: (document as { locale?: string }).locale || "en-us" },
        }),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "readTimeMinutes",
      title: "Read time (minutes)",
      type: "number",
      validation: (Rule) => Rule.required().min(1),
      initialValue: 8,
    }),
    defineField({
      name: "featuredOnHome",
      title: "Featured on home",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "featuredInArchive",
      title: "Featured in archive top row",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "blockContent",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "flagshipHeroMode",
      title: "Flagship hero mode",
      type: "string",
      hidden: ({ document }) => (document as { templateVariant?: string })?.templateVariant !== "flagship",
      options: {
        list: [
          { title: "Image", value: "image" },
          { title: "Illustration", value: "illustration" },
        ],
      },
      initialValue: "image",
    }),
    defineField({
      name: "editorialPlan",
      title: "Editorial plan",
      type: "object",
      fields: [
        defineField({
          name: "clusterRole",
          title: "Cluster role",
          type: "string",
          options: { list: ["pillar", "support", "bridge"] },
        }),
        defineField({
          name: "mustLinkTo",
          title: "Must link to",
          type: "array",
          of: [{ type: "string" }],
        }),
        defineField({
          name: "internalLinkPlan",
          title: "Internal link plan",
          type: "array",
          of: [
            defineField({
              name: "item",
              title: "Link target",
              type: "object",
              fields: [
                defineField({
                  name: "target",
                  title: "Target",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "kind",
                  title: "Kind",
                  type: "string",
                  options: { list: ["post", "core-page"] },
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "purpose",
                  title: "Purpose",
                  type: "string",
                  options: { list: ["reinforce", "bridge", "next-step"] },
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "anchorHint",
                  title: "Anchor hint",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "seoTitle",
      title: "SEO title",
      type: "string",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "seoImage",
      title: "SEO image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alternative text", type: "string" }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "locale",
      media: "coverImage",
    },
  },
});
