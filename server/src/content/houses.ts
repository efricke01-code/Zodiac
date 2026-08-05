export interface HouseMeta {
  house: number;
  title: string;
  domain: string; // short phrase describing the life area
  keywords: string[];
  /** A concrete, natural-language phrase for "this house's energy shows up through ___" —
   * written to read smoothly as the object of a sentence, unlike the bare `keywords`. */
  expression: string;
}

export const HOUSE_META: Record<number, HouseMeta> = {
  1: {
    house: 1, title: "House of Self", domain: "identity, appearance, and how you meet the world",
    keywords: ["identity", "first impressions", "vitality"],
    expression: "how you come across when people first meet you, and the image you project outwardly",
  },
  2: {
    house: 2, title: "House of Value", domain: "money, possessions, and personal self-worth",
    keywords: ["income", "resources", "self-worth"],
    expression: "how you earn, spend, and relate to money and possessions",
  },
  3: {
    house: 3, title: "House of Communication", domain: "everyday communication, learning, siblings, and short trips",
    keywords: ["communication", "learning", "local community"],
    expression: "your everyday communication style, how you learn, and your relationships with siblings or neighbors",
  },
  4: {
    house: 4, title: "House of Home", domain: "home, family, roots, and your inner emotional foundation",
    keywords: ["home", "family", "roots"],
    expression: "your home life, family relationships, and sense of emotional roots",
  },
  5: {
    house: 5, title: "House of Expression", domain: "romance, creativity, pleasure, and self-expression",
    keywords: ["romance", "creativity", "play"],
    expression: "how you romance, create, and enjoy yourself",
  },
  6: {
    house: 6, title: "House of Routine", domain: "daily habits, work, health, and acts of service",
    keywords: ["work", "health", "routine"],
    expression: "your daily habits, work style, and how you take care of your health",
  },
  7: {
    house: 7, title: "House of Partnership", domain: "committed relationships, marriage, and open rivals",
    keywords: ["partnership", "marriage", "contracts"],
    expression: "how you show up in committed relationships and one-on-one partnerships",
  },
  8: {
    house: 8, title: "House of Transformation", domain: "intimacy, shared resources, and deep transformation",
    keywords: ["intimacy", "shared finances", "transformation"],
    expression: "how you handle intimacy, shared resources, and deep personal change",
  },
  9: {
    house: 9, title: "House of Expansion", domain: "travel, higher education, philosophy, and belief systems",
    keywords: ["travel", "philosophy", "higher learning"],
    expression: "how you explore new places, ideas, beliefs, and higher learning",
  },
  10: {
    house: 10, title: "House of Vocation", domain: "career, public reputation, and life direction",
    keywords: ["career", "reputation", "ambition"],
    expression: "your public reputation, career path, and long-term ambitions",
  },
  11: {
    house: 11, title: "House of Community", domain: "friendships, groups, and hopes for the future",
    keywords: ["friendship", "community", "aspirations"],
    expression: "your friendships, communities, and hopes for the future",
  },
  12: {
    house: 12, title: "House of the Unconscious", domain: "solitude, the subconscious, spirituality, and letting go",
    keywords: ["subconscious", "solitude", "spirituality"],
    expression: "how you spend time alone, what goes on in your dreams and subconscious, and your spiritual or introspective side",
  },
};
