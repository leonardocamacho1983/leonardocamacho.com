import { defineArrayMember, defineField, defineType } from "sanity";
import { localeList } from "../../lib/locales";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fieldsets: [
    {
      name: "newsletter",
      title: "Newsletter & Consent",
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: "locale",
      title: "Locale",
      type: "string",
      options: { list: localeList },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "siteTitle",
      title: "Site title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "siteSubtitle",
      title: "Site subtitle",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "navigation",
      title: "Navigation",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "route",
              title: "Route",
              type: "string",
              options: {
                list: [
                  { title: "Home", value: "home" },
                  { title: "About", value: "about" },
                  { title: "Writing", value: "writing" },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
          ],
        }),
      ],
      validation: (Rule) => Rule.min(3).max(6),
    }),
    defineField({
      name: "languageOptions",
      title: "Language switcher options",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "locale",
              title: "Locale key",
              type: "string",
              options: { list: localeList },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "flag",
              title: "Flag emoji",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
          ],
        }),
      ],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "footerQuote",
      title: "Footer quote",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "footerLinks",
      title: "Footer links",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (Rule) => Rule.required(),
            }),
          ],
        }),
      ],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "copyrightLine",
      title: "Copyright line",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "newsletterEndpoint",
      title: "Newsletter endpoint",
      type: "url",
      description: "POST endpoint used by the subscribe form.",
      fieldset: "newsletter",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "newsletterMethod",
      title: "Newsletter method",
      type: "string",
      fieldset: "newsletter",
      options: {
        list: [
          { title: "POST", value: "POST" },
          { title: "GET", value: "GET" },
        ],
      },
      initialValue: "POST",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "newsletterPrivacyUrl",
      title: "Privacy policy URL",
      type: "url",
      fieldset: "newsletter",
      description: "Used in the newsletter consent checkbox text.",
    }),
    defineField({
      name: "newsletterConsentPolicyVersion",
      title: "Consent policy version",
      type: "string",
      fieldset: "newsletter",
      description: "Version marker stored with newsletter consent (example: v1, v2).",
      initialValue: "v1",
    }),
    defineField({
      name: "contactEmail",
      title: "Contact email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "seoTitle",
      title: "Default SEO title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "seoDescription",
      title: "Default SEO description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required().max(180),
    }),
    defineField({
      name: "seoImage",
      title: "Default SEO image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alternative text", type: "string" }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "siteTitle",
      locale: "locale",
    },
    prepare({ title, locale }) {
      return {
        title: title || "Site settings",
        subtitle: locale,
      };
    },
  },
});
