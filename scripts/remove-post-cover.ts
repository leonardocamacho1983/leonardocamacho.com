import "dotenv/config";
import { getCmsWriteClient } from "../ops/shared/cms/write";

const usage = () => {
  throw new Error(
    "Usage: npx tsx scripts/remove-post-cover.ts --locale <locale> --slug <slug>",
  );
};

const args = process.argv.slice(2);
const readFlag = (flag: string): string => {
  const index = args.indexOf(flag);
  if (index === -1) return "";
  return args[index + 1] || "";
};

const locale = readFlag("--locale");
const slug = readFlag("--slug");

if (!locale || !slug) {
  usage();
}

const main = async () => {
  const client = getCmsWriteClient();
  const doc = await client.fetch<{ id: string; title?: string; translationKey?: string } | null>(
    `*[_type == "post" && locale == $locale && slug.current == $slug][0]{
      "id": _id,
      title,
      translationKey
    }`,
    { locale, slug },
  );

  if (!doc?.id) {
    throw new Error(`Post not found for ${locale}/${slug}`);
  }

  await client.patch(doc.id).unset(["coverImage"]).commit();

  console.log(
    JSON.stringify(
      {
        ok: true,
        locale,
        slug,
        postId: doc.id,
        title: doc.title || null,
        translationKey: doc.translationKey || null,
        removed: ["coverImage"],
      },
      null,
      2,
    ),
  );
};

main().catch((error) => {
  console.error("[remove-post-cover] Failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
