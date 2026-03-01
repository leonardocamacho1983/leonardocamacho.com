import { defineArrayMember, defineField, defineType } from "sanity";
import { localeList } from "../../lib/locales";

export const aboutPageType = defineType({
  name: "aboutPage",
  title: "About Page",
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
      name: "introKicker",
      title: "Intro kicker",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "introTitle",
      title: "Intro title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "introTitleEmphasis",
      title: "Intro title emphasis",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "introParagraphOne",
      title: "Intro paragraph one",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "introParagraphTwo",
      title: "Intro paragraph two",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "introImage",
      title: "Intro image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alternative text", type: "string" }),
      ],
    }),
    defineField({
      name: "beliefKicker",
      title: "Core belief kicker",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "beliefQuote",
      title: "Core belief quote",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "beliefBody",
      title: "Core belief body",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "whatIDoKicker",
      title: "What I do kicker",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "services",
      title: "Services",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "icon",
              title: "Icon",
              type: "string",
              options: {
                list: [
                  { title: "Target", value: "target" },
                  { title: "Users", value: "users" },
                  { title: "Book", value: "book" },
                  { title: "Graduation", value: "graduation" },
                  { title: "Briefcase", value: "briefcase" },
                  { title: "Lightbulb", value: "lightbulb" },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 3,
              validation: (Rule) => Rule.required(),
            }),
          ],
        }),
      ],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "careerPathKicker",
      title: "Career path kicker",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "timeline",
      title: "Timeline",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "period",
              title: "Period",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 3,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "highlight",
              title: "Highlight entry",
              type: "boolean",
              initialValue: false,
            }),
          ],
        }),
      ],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "galleryImages",
      title: "Gallery images",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alternative text",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
          ],
        }),
      ],
      validation: (Rule) => Rule.min(1).max(3),
    }),
    defineField({
      name: "galleryCaption",
      title: "Gallery caption",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "connectTitle",
      title: "Connect title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "connectTitleEmphasis",
      title: "Connect title emphasis",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "connectDescription",
      title: "Connect description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "connectPrimaryLabel",
      title: "Connect primary label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "connectPrimaryUrl",
      title: "Connect primary URL",
      type: "url",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "connectSecondaryLabel",
      title: "Connect secondary label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "connectSecondaryRoute",
      title: "Connect secondary route",
      type: "string",
      options: {
        list: [
          { title: "Writing", value: "writing" },
          { title: "Home", value: "home" },
        ],
      },
      validation: (Rule) => Rule.required(),
      initialValue: "writing",
    }),
  ],
  preview: {
    select: {
      title: "introTitle",
      subtitle: "locale",
    },
  },
});
