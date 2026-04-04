import 'dotenv/config';
import { createContent } from "../ops/publishing/workflows/createContent.ts";
import { parseArgsFromArgv } from "./lib/create-content-cli-args.ts";

const parseArgs = () => parseArgsFromArgv(process.argv);

const main = async () => {
  const args = parseArgs();

  const result = await createContent({
    topic: args.topic,
    contentType: args.contentType,
    audience: args.audience,
    locale: args.locale,
    plannerInput: args.plannerInput,
    dryRun: args.dryRun,
  });

  console.log(JSON.stringify(result, null, 2));
};

main().catch((error) => {
  console.error("[run-create-content] Failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
