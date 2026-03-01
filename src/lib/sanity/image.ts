import imageUrlBuilder from "@sanity/image-url";
import type { ImageUrlBuilder } from "@sanity/image-url/lib/types/builder";
import { sanityEnvironment } from "./client";

const builder = imageUrlBuilder({
  projectId: sanityEnvironment.projectId || "demo1234",
  dataset: sanityEnvironment.dataset || "production",
});

export const urlFor = (source: unknown): ImageUrlBuilder => builder.image(source as never);
