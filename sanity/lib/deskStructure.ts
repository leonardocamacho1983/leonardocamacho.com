import type { StructureResolver } from "sanity/structure";
import { LOCALES } from "./locales";

const singletonGroups = [
  { type: "siteSettings", title: "Site Settings" },
  { type: "homePage", title: "Home Page" },
  { type: "aboutPage", title: "About Page" },
  { type: "writingPage", title: "Writing Page" },
] as const;

export const deskStructure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      ...singletonGroups.map((group) =>
        S.listItem()
          .title(group.title)
          .child(
            S.list()
              .title(group.title)
              .items(
                LOCALES.map((locale) =>
                  S.listItem()
                    .title(locale.title)
                    .child(
                      S.editor()
                        .id(`${group.type}-${locale.value}`)
                        .schemaType(group.type)
                        .documentId(`${group.type}-${locale.value}`),
                    ),
                ),
              ),
          ),
      ),
      S.divider(),
      S.listItem()
        .title("Categories")
        .schemaType("category")
        .child(
          S.list()
            .title("Categories")
            .items([
              S.listItem()
                .title("All Categories")
                .child(S.documentTypeList("category").title("All Categories")),
              ...LOCALES.map((locale) =>
                S.listItem()
                  .title(locale.title)
                  .child(
                    S.documentTypeList("category")
                      .title(`Categories (${locale.title})`)
                      .filter('_type == "category" && locale == $locale')
                      .params({ locale: locale.value }),
                  ),
              ),
            ]),
        ),
      S.listItem()
        .title("Posts")
        .schemaType("post")
        .child(
          S.list()
            .title("Posts")
            .items([
              S.listItem()
                .title("All Posts")
                .child(
                  S.documentTypeList("post")
                    .title("All Posts")
                    .filter('_type == "post"')
                    .defaultOrdering([
                      { field: "publishedAt", direction: "desc" },
                      { field: "_updatedAt", direction: "desc" },
                    ]),
                ),
              ...LOCALES.map((locale) =>
                S.listItem()
                  .title(locale.title)
                  .child(
                    S.documentTypeList("post")
                      .title(`Posts (${locale.title})`)
                      .filter('_type == "post" && locale == $locale')
                      .params({ locale: locale.value })
                      .defaultOrdering([
                        { field: "publishedAt", direction: "desc" },
                        { field: "_updatedAt", direction: "desc" },
                      ]),
                  ),
              ),
              S.listItem()
                .title("Draft Posts")
                .child(
                  S.documentTypeList("post")
                    .title("Draft Posts")
                    .filter('_type == "post" && _id in path("drafts.**")')
                    .defaultOrdering([{ field: "_updatedAt", direction: "desc" }]),
                ),
            ]),
        ),
    ]);
