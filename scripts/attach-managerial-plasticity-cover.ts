import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { getCmsWriteClient } from '../ops/shared/cms/write';
import { inspectPostById } from '../ops/shared/cms/read';

const filePath = process.argv[2] || path.join(process.env.HOME || '', 'Downloads', 'on_managerial_plasticity.webp');
const draftId = 'drafts.post-managerial-plasticity-en-us';

const main = async () => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Image file not found: ${filePath}`);
  }

  const client = getCmsWriteClient();
  const filename = path.basename(filePath);

  const asset = await client.assets.upload('image', fs.createReadStream(filePath), {
    filename,
    contentType: 'image/webp',
  });

  await client
    .patch(draftId)
    .set({
      coverImage: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id,
        },
        alt: 'Editorial illustration of a businessman walking inside a circular stone maze',
        hotspot: {
          x: 0.5,
          y: 0.43,
          width: 0.24,
          height: 0.24,
        },
      },
    })
    .commit({ autoGenerateArrayKeys: true });

  const inspection = await inspectPostById(draftId);
  console.log(
    JSON.stringify(
      {
        ok: true,
        draftId,
        filePath,
        assetId: asset._id,
        coverImageAttached: Boolean(inspection.draft),
        draft: inspection.draft
          ? {
              id: inspection.draft.presentedId,
              locale: inspection.draft.locale,
              title: inspection.draft.title,
              slug: inspection.draft.slug,
            }
          : null,
      },
      null,
      2,
    ),
  );
};

main().catch((error) => {
  console.error('[attach-managerial-plasticity-cover] Failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
