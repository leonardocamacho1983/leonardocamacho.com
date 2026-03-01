import { createClient } from "@sanity/client";

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET;
const apiVersion = process.env.SANITY_API_VERSION || "2025-02-01";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error("Missing required env vars: PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN");
  process.exit(1);
}

const apply = process.argv.includes("--apply");

const translationsByLocale = {
  "pt-br": {
    essay: "Artigos",
    insight: "Insights",
    research: "Pesquisa",
    note: "Notas",
  },
  "pt-pt": {
    essay: "Artigos",
    insight: "Insights",
    research: "Pesquisa",
    note: "Notas",
  },
  "fr-fr": {
    essay: "Essais",
    insight: "Perspectives",
    research: "Recherche",
    note: "Notes",
  },
};

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

const categories = await client.fetch(
  '*[_type == "category"]{_id, locale, translationKey, title}',
);

const updates = categories
  .map((category) => {
    const locale = String(category.locale || "").toLowerCase();
    const key = String(category.translationKey || "").toLowerCase();
    const desiredTitle = translationsByLocale[locale]?.[key];

    if (!desiredTitle || category.title === desiredTitle) {
      return null;
    }

    return {
      id: category._id,
      locale,
      key,
      from: category.title,
      to: desiredTitle,
    };
  })
  .filter(Boolean);

if (!updates.length) {
  console.log("No category translation updates needed.");
  process.exit(0);
}

console.log(`Found ${updates.length} category title update(s):`);
for (const update of updates) {
  console.log(`- ${update.id} [${update.locale}/${update.key}]: "${update.from}" -> "${update.to}"`);
}

if (!apply) {
  console.log('\nDry run only. Re-run with "--apply" to write changes.');
  process.exit(0);
}

for (const update of updates) {
  await client.patch(update.id).set({ title: update.to }).commit();
}

console.log(`\nApplied ${updates.length} category translation update(s).`);
