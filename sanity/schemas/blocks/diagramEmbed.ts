import { defineField, defineType } from "sanity";

export const diagramEmbedBlock = defineType({
  type: "object",
  name: "diagramEmbed",
  title: "Diagram",
  icon: () => "◫",
  fields: [
    defineField({
      name: "diagramKey",
      title: "Diagram",
      type: "string",
      description: "Which diagram to display. Each key maps to a static SVG file.",
      options: {
        list: [
          {
            title: "Figure 1 — Single/Double-Loop Learning",
            value: "loop-learning",
          },
          {
            title: "Figure 2 — Revision Cost Curve",
            value: "revision-cost",
          },
          {
            title: "Figure 3 — Signal Filter",
            value: "signal-filter",
          },
          {
            title: "Figure 4 — Three Moments Timeline",
            value: "three-moments",
          },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required().error("Select a diagram."),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: 'Short identifier shown above the caption. Example: "Figure 1"',
      placeholder: "Figure 1",
      validation: (Rule) => Rule.required().max(32),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "text",
      rows: 3,
      description: "One sentence describing what the diagram shows. Displayed in italic below the diagram.",
      validation: (Rule) => Rule.required().max(280),
    }),
  ],
  preview: {
    select: {
      title: "label",
      subtitle: "diagramKey",
    },
    prepare({ title, subtitle }) {
      const labels: Record<string, string> = {
        "loop-learning": "Single/Double-Loop Learning",
        "revision-cost": "Revision Cost Curve",
        "signal-filter": "Signal Filter",
        "three-moments": "Three Moments Timeline",
      };
      return {
        title: title || "Diagram",
        subtitle: labels[subtitle] ?? subtitle,
      };
    },
  },
});
