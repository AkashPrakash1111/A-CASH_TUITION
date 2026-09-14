import leaf from "../../assets/mascots/leaf.png";
import water from "../../assets/mascots/water.png";
import fire from "../../assets/mascots/fire.png";
import cosmic from "../../assets/mascots/cosmic.png";
import cloud from "../../assets/mascots/cloud.png";
import crystal from "../../assets/mascots/crystal.png";
import ice from "../../assets/mascots/ice.png";
import blossom from "../../assets/mascots/blossom.png";
import lightning from "../../assets/mascots/lightning.png";

const MASCOTS = [
  { image: leaf, bg: "#DCFCE7" },
  { image: water, bg: "#CFFAFE" },
  { image: fire, bg: "#FFEDD5" },
  { image: cosmic, bg: "#EDE9FE" },
  { image: cloud, bg: "#F1F5F9" },
  { image: crystal, bg: "#FEF3C7" },
  { image: ice, bg: "#E0F2FE" },
  { image: blossom, bg: "#FCE7F3" },
  { image: lightning, bg: "#FEF9C3" },
];

/**
 * Picks a mascot deterministically from a name/id, so the same student
 * always gets the same mascot (not re-randomized on every render), without
 * needing to store the assignment anywhere.
 */
export function getMascotFor(seed) {
  const str = String(seed || "student");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return MASCOTS[hash % MASCOTS.length];
}
