import { AspectType } from "../astro/aspects.js";

export interface AspectMeta {
  type: AspectType;
  verb: string; // "blends with", "clashes with"
  description: string;
}

export const ASPECT_META: Record<AspectType, AspectMeta> = {
  conjunction: {
    type: "conjunction",
    verb: "merges intensely with",
    description: "an intense fusion of energies that amplifies both planets, for better or worse",
  },
  sextile: {
    type: "sextile",
    verb: "opens a supportive opportunity with",
    description: "an easy, opportunity-rich connection that takes a little initiative to use well",
  },
  square: {
    type: "square",
    verb: "creates productive friction with",
    description: "a tension that demands action and often becomes a source of real growth",
  },
  trine: {
    type: "trine",
    verb: "flows harmoniously with",
    description: "a natural, easygoing flow of energy that can be a real strength if not taken for granted",
  },
  opposition: {
    type: "opposition",
    verb: "pulls against",
    description: "a push-pull polarity that asks for balance and awareness of both sides",
  },
};
