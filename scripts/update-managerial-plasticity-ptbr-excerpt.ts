import "dotenv/config";

import { updatePost } from "../ops/shared/cms/write";

const text =
  "Por que equipes de liderança altamente inteligentes não revisam premissas que já não se encaixam na realidade, e por que a execução trava muito antes de a estratégia falhar.";

const main = async () => {
  const result = await updatePost({
    postId: "post-managerial-plasticity-pt-br",
    patch: {
      excerpt: text,
      seoDescription: text,
    },
    dryRun: false,
  });

  console.log(JSON.stringify(result, null, 2));
};

main().catch((error) => {
  console.error(
    "[update-managerial-plasticity-ptbr-excerpt] Failed:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
