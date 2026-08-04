export interface HouseMeta {
  house: number;
  title: string;
  domain: string; // short phrase describing the life area
  keywords: string[];
}

export const HOUSE_META: Record<number, HouseMeta> = {
  1: { house: 1, title: "House of Self", domain: "identity, appearance, and how you meet the world", keywords: ["identity", "first impressions", "vitality"] },
  2: { house: 2, title: "House of Value", domain: "money, possessions, and personal self-worth", keywords: ["income", "resources", "self-worth"] },
  3: { house: 3, title: "House of Communication", domain: "everyday communication, learning, siblings, and short trips", keywords: ["communication", "learning", "local community"] },
  4: { house: 4, title: "House of Home", domain: "home, family, roots, and your inner emotional foundation", keywords: ["home", "family", "roots"] },
  5: { house: 5, title: "House of Expression", domain: "romance, creativity, pleasure, and self-expression", keywords: ["romance", "creativity", "play"] },
  6: { house: 6, title: "House of Routine", domain: "daily habits, work, health, and acts of service", keywords: ["work", "health", "routine"] },
  7: { house: 7, title: "House of Partnership", domain: "committed relationships, marriage, and open rivals", keywords: ["partnership", "marriage", "contracts"] },
  8: { house: 8, title: "House of Transformation", domain: "intimacy, shared resources, and deep transformation", keywords: ["intimacy", "shared finances", "transformation"] },
  9: { house: 9, title: "House of Expansion", domain: "travel, higher education, philosophy, and belief systems", keywords: ["travel", "philosophy", "higher learning"] },
  10: { house: 10, title: "House of Vocation", domain: "career, public reputation, and life direction", keywords: ["career", "reputation", "ambition"] },
  11: { house: 11, title: "House of Community", domain: "friendships, groups, and hopes for the future", keywords: ["friendship", "community", "aspirations"] },
  12: { house: 12, title: "House of the Unconscious", domain: "solitude, the subconscious, spirituality, and letting go", keywords: ["subconscious", "solitude", "spirituality"] },
};
