import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { getCmsWriteClient } from "../ops/shared/cms/write";

const usage = () => {
  throw new Error(
    "Usage: npx tsx scripts/attach-post-cover.ts --locale <locale> --slug <slug> --file <path> [--alt <text>] [--hotspot <x,y,width,height>]",
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
const filePath = readFlag("--file");
const alt =
  readFlag("--alt") ||
  "Editorial illustration of a corporate building gaining mass while its foundations crack open";
const hotspotRaw = readFlag("--hotspot");

if (!locale || !slug || !filePath) {
  usage();
}

const resolveContentType = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".avif") return "image/avif";
  if (ext === ".webp") return "image/webp";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  throw new Error(`Unsupported image extension: ${ext}`);
};

const resolveHotspot = (): { x: number; y: number; width: number; height: number } => {
  if (!hotspotRaw) {
    return { x: 0.5, y: 0.46, width: 0.68, height: 0.7 };
  }

  const parts = hotspotRaw.split(",").map((value) => Number(value.trim()));
  if (parts.length !== 4 || parts.some((value) => Number.isNaN(value))) {
    throw new Error("Invalid --hotspot. Expected x,y,width,height");
  }

  const [x, y, width, height] = parts;
  return { x, y, width, height };
};

const main = async () => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Image file not found: ${filePath}`);
  }

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

  const filename = path.basename(filePath);
  const asset = await client.assets.upload("image", fs.createReadStream(filePath), {
    filename,
    contentType: resolveContentType(filename),
  });

  const hotspot = resolveHotspot();

  await client
    .patch(doc.id)
    .set({
      coverImage: {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: asset._id,
        },
        alt,
        hotspot,
      },
    })
    .commit({ autoGenerateArrayKeys: true });

  console.log(
    JSON.stringify(
      {
        ok: true,
        locale,
        slug,
        postId: doc.id,
        title: doc.title || null,
        translationKey: doc.translationKey || null,
        filePath,
        assetId: asset._id,
        alt,
        hotspot,
      },
      null,
      2,
    ),
  );
};

main().catch((error) => {
  console.error("[attach-post-cover] Failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
