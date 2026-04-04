import "dotenv/config";
import { refreshContent } from "../ops/publishing/workflows/refreshContent";
import { parseRefreshArgsFromArgv } from "./lib/refresh-content-cli-args";

const main = async (): Promise<void> => {
  const args = parseRefreshArgsFromArgv(process.argv);
  const result = await refreshContent(args);
  console.log(JSON.stringify(result, null, 2));
};

main().catch((error) => {
  console.error("[run-refresh-content] Failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});

