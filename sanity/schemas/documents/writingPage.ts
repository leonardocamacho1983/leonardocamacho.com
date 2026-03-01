import { defineField, defineType } from "sanity";
import { localeList } from "../../lib/locales";

export const writingPageType = defineType({
  name: "writingPage",
  title: "Writing Page",
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
      name: "backToHomeLabel",
      title: "Back to home label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "archiveKicker",
      title: "Archive kicker",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "archiveTitle",
      title: "Archive title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "archiveTitleEmphasis",
      title: "Archive title emphasis",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "archiveDescription",
      title: "Archive description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "searchPlaceholder",
      title: "Search placeholder",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "allFilterLabel",
      title: "All filter label",
      type: "string",
      validation: (Rule) => Rule.required(),
      initialValue: "All",
    }),
    defineField({
      name: "emptyStateTitle",
      title: "Empty state title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "emptyStateDescription",
      title: "Empty state description",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "archiveTitle",
      subtitle: "locale",
    },
  },
});
