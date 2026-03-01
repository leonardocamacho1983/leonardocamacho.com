import { defineField, defineType } from "sanity";
import { localeList } from "../../lib/locales";

export const categoryType = defineType({
  name: "category",
  title: "Category",
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
      description: "Use the same translation key for this category across locales.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "color",
      title: "Color",
      type: "string",
      description: "Hex color used for badges and labels.",
      validation: (Rule) => Rule.required().regex(/^#([0-9A-Fa-f]{3}){1,2}$/),
      initialValue: "#b8564f",
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "locale",
    },
  },
});
