/**
 * Real, confirmed DiceBear style slugs (v10 API) — pulled directly from
 * DiceBear's own style directory, not guessed. Switching between these
 * gives dramatic, unmistakable visual variety (a robot vs. a cartoon face
 * vs. a simple thumb-shape), unlike small variant differences within one
 * style which can be hard to see in a thumbnail.
 * https://www.dicebear.com/styles/
 */
export const STYLE_OPTIONS = [
  { id: "adventurer", label: "Adventurer" },
  { id: "big-smile", label: "Big Smile" },
  { id: "bottts", label: "Robot" },
  { id: "fun-emoji", label: "Emoji" },
  { id: "thumbs", label: "Thumbs" },
  { id: "micah", label: "Micah" },
  { id: "notionists", label: "Notionist" },
  { id: "personas", label: "Personas" },
];

/**
 * Real, confirmed option values for DiceBear's "adventurer" style (v10 API),
 * pulled directly from the style's published definition — not guessed.
 * https://api.dicebear.com/10.x/adventurer/svg
 *
 * These only apply when style === "adventurer" — other styles have their
 * own different option sets, which this picker doesn't expose yet (kept
 * safe/scoped rather than guessing option names for styles we haven't
 * verified).
 */
export const HAIR_OPTIONS = [
  "long01", "long02", "long03", "long04", "long05",
  "long06", "long07", "long08", "long09", "long10",
];

export const EYES_OPTIONS = [
  "variant01", "variant03", "variant05", "variant07",
  "variant09", "variant11", "variant13", "variant15",
];

export const EYEBROWS_OPTIONS = [
  "variant01", "variant04", "variant07", "variant10",
  "variant13", "variant16", "variant19", "variant22",
];

export const GLASSES_OPTIONS = [
  "variant01", "variant02", "variant03", "variant04", "variant05",
];

export const EARRINGS_OPTIONS = [
  "variant01", "variant02", "variant03", "variant04", "variant05", "variant06",
];

// Hex values without '#' — DiceBear's URL format expects bare hex.
export const SKIN_COLORS = ["f2d3b1", "ecad80", "d08b5b", "ae5d29", "614335"];

export const HAIR_COLORS = [
  "2c1b18", "4a312c", "724133", "a55728",
  "b58143", "d6b370", "e8e1e1", "6a4e35",
];

export const BACKGROUND_COLORS = [
  "b6e3f4", "c0aede", "d1d4f9", "ffd5dc",
  "ffdfbf", "c9f2c7", "f4f8fc", "ffffff",
];

const DEFAULT_CONFIG = {
  style: "adventurer",
  seed: "new-student",
  hair: HAIR_OPTIONS[0],
  hairColor: HAIR_COLORS[0],
  skinColor: SKIN_COLORS[0],
  eyes: EYES_OPTIONS[0],
  eyebrows: EYEBROWS_OPTIONS[0],
  glasses: null, // null = no glasses
  earrings: null, // null = no earrings
  backgroundColor: BACKGROUND_COLORS[6],
};

export function getDefaultAvatarConfig() {
  return { ...DEFAULT_CONFIG };
}

/**
 * Builds a DiceBear avatar URL from a config object. Unknown/missing
 * fields simply fall back to the style's own defaults — DiceBear ignores
 * params it doesn't recognize rather than erroring, so this is safe even
 * if a saved config is from an older version of this picker.
 *
 * `overrides` lets a swatch preview show "what would this look like with
 * X changed" without mutating the actual selected config — e.g. hiding
 * glasses specifically for eyes/eyebrows swatches so they're not obscured.
 */
export function buildAvatarUrl(config, overrides = {}) {
  const c = { ...DEFAULT_CONFIG, ...config, ...overrides };
  const style = c.style || "adventurer";
  const params = new URLSearchParams();

  params.set("seed", c.seed || "student");
  params.set("backgroundColor", c.backgroundColor);

  // Style-specific options only make sense for adventurer right now —
  // other styles just get seed + background, which every style supports.
  if (style === "adventurer") {
    params.set("hair", c.hair);
    params.set("hairColor", c.hairColor);
    params.set("skinColor", c.skinColor);
    params.set("eyes", c.eyes);
    params.set("eyebrows", c.eyebrows);

    if (c.glasses) {
      params.set("glasses", c.glasses);
      params.set("glassesProbability", "100");
    }

    if (c.earrings) {
      params.set("earrings", c.earrings);
      params.set("earringsProbability", "100");
    }
  }

  return `https://api.dicebear.com/10.x/${style}/svg?${params.toString()}`;
}
