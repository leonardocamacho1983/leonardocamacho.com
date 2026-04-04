import { createImageUrlBuilder, type ImageUrlBuilder } from "@sanity/image-url";
import { sanityEnvironment } from "./client";

const builder = createImageUrlBuilder({
  projectId: sanityEnvironment.projectId || "demo1234",
  dataset: sanityEnvironment.dataset || "production",
});

export const urlFor = (source: unknown): ImageUrlBuilder => builder.image(source as never);
