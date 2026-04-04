import 'dotenv/config';
import { getCmsWriteClient } from '../ops/shared/cms/write';

const locale = 'en-us';
const slug = 'on-managerial-plasticity';

const main = async () => {
  const client = getCmsWriteClient();
  const doc = await client.fetch<{ id: string } | null>(
    `*[_type == "post" && locale == $locale && slug.current == $slug][0]{"id": _id}`,
    { locale, slug },
  );

  if (!doc?.id) {
    throw new Error(`Post not found for ${locale}/${slug}`);
  }

  await client.patch(doc.id).set({
    templateVariant: 'flagship',
    flagshipHeroMode: 'image',
  }).commit();

  console.log(JSON.stringify({ ok: true, postId: doc.id, templateVariant: 'flagship', flagshipHeroMode: 'image' }, null, 2));
};

main().catch((error) => {
  console.error('[set-managerial-plasticity-flagship] Failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
