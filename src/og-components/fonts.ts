import dmSans300DataUrl from "@fontsource/dm-sans/files/dm-sans-latin-300-normal.woff?inline";
import playfair400ItalicDataUrl from "@fontsource/playfair-display/files/playfair-display-latin-400-italic.woff?inline";
import playfair400DataUrl from "@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff?inline";
import playfair700DataUrl from "@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff?inline";

const decodeBase64 = (value: string): string => {
  if (typeof atob === "function") {
    return atob(value);
  }
  return Buffer.from(value, "base64").toString("binary");
};

const dataUrlToArrayBuffer = (dataUrl: string): ArrayBuffer => {
  const parts = dataUrl.split(",", 2);
  const base64 = parts[1];
  if (!base64) {
    throw new Error("Invalid inline font data URL.");
  }

  const binary = decodeBase64(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
};

let cachedFonts:
  | Array<{
      name: string;
      data: ArrayBuffer;
      style: "normal" | "italic";
      weight: 300 | 400 | 700;
    }>
  | null = null;

export const getOgFonts = async () => {
  cachedFonts ??= [
    {
      name: "Playfair Display",
      data: dataUrlToArrayBuffer(playfair700DataUrl),
      style: "normal",
      weight: 700,
    },
    {
      name: "Playfair Display",
      data: dataUrlToArrayBuffer(playfair400DataUrl),
      style: "normal",
      weight: 400,
    },
    {
      name: "Playfair Display",
      data: dataUrlToArrayBuffer(playfair400ItalicDataUrl),
      style: "italic",
      weight: 400,
    },
    {
      name: "DM Sans",
      data: dataUrlToArrayBuffer(dmSans300DataUrl),
      style: "normal",
      weight: 300,
    },
  ];

  return cachedFonts;
};
