import fs from "node:fs/promises";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";

const projectRoot = process.cwd();
const inputPath = path.join(projectRoot, "public", "favicons", "mono-black.svg");
const outputPath = path.join(projectRoot, "public", "favicons", "apple-touch-icon.png");

const svg = await fs.readFile(inputPath, "utf8");
const png = new Resvg(svg, {
  fitTo: {
    mode: "width",
    value: 180,
  },
}).render().asPng();

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, png);
console.log(`Generated ${path.relative(projectRoot, outputPath)}`);
