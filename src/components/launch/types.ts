import type { LocaleKey } from "@/lib/locales";
import type { PostCardDTO } from "@/lib/types";

export type LaunchVariant = "v1" | "v2" | "v3";

export interface LaunchLocaleMeta {
  key: LocaleKey;
  label: string;
  flag: string;
}

export interface LaunchCopy {
  domainLabel: string;
  title: string;
  titleLines: Array<{ text: string; accent?: boolean }>;
  subtitle: string;
  cta: string;
  placeholder: string;
  footerNote: string;
  secondaryLink: string;
  featuredLabelFallback: string;
  readPrefix: string;
  linkedinLabel: string;
}

export interface LaunchVariantProps {
  locale: LocaleKey;
  variant: LaunchVariant;
  featured: PostCardDTO | null;
  coverlines: PostCardDTO[];
  launchPath: string;
  archivePath: string;
  homePath: string;
  launchImage: string;
  currentLocaleMeta: LaunchLocaleMeta;
  localeOptions: LaunchLocaleMeta[];
  localeLinkSuffix?: string;
  copy: LaunchCopy;
}
