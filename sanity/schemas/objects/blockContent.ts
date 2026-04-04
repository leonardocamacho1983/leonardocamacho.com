import { defineArrayMember, defineType } from "sanity";

export const blockContentType = defineType({
  name: "blockContent",
  title: "Block Content",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
        ],
        annotations: [
          {
            title: "External Link",
            name: "link",
            type: "object",
            fields: [
              {
                name: "href",
                title: "URL",
                type: "url",
                validation: (Rule) => Rule.required(),
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          title: "Alternative text",
          type: "string",
        },
      ],
    }),
    defineArrayMember({
      name: "pullQuote",
      title: "Pull quote",
      type: "object",
      fields: [
        {
          name: "text",
          title: "Text",
          type: "text",
          rows: 4,
          validation: (Rule) => Rule.required(),
        },
      ],
      preview: {
        select: { title: "text" },
        prepare: ({ title }) => ({
          title: title || "Pull quote",
          subtitle: "Flagship essay block",
        }),
      },
    }),
    defineArrayMember({
      type: "diagramEmbed",
    }),
    defineArrayMember({
      name: "epigraph",
      title: "Epigraph",
      type: "object",
      fields: [
        {
          name: "text",
          title: "Text",
          type: "text",
          rows: 4,
          validation: (Rule) => Rule.required(),
        },
      ],
      preview: {
        select: { title: "text" },
        prepare: ({ title }) => ({
          title: title || "Epigraph",
          subtitle: "Flagship essay block",
        }),
      },
    }),
  ],
});
