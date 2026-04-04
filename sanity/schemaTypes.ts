import { aboutPageType } from "./schemas/documents/aboutPage";
import { categoryType } from "./schemas/documents/category";
import { homePageType } from "./schemas/documents/homePage";
import { postType } from "./schemas/documents/post";
import { siteSettingsType } from "./schemas/documents/siteSettings";
import { writingPageType } from "./schemas/documents/writingPage";
import { diagramEmbedBlock } from "./schemas/blocks/diagramEmbed";
import { blockContentType } from "./schemas/objects/blockContent";

export const schemaTypes = [
  diagramEmbedBlock,
  blockContentType,
  siteSettingsType,
  homePageType,
  aboutPageType,
  writingPageType,
  categoryType,
  postType,
];
