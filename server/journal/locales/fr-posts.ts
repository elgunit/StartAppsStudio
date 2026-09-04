import type { Post } from "../posts";
import { FR_POST_1 } from "./fr-posts/ai-overviews-citation-playbook-for-mvps";
import { FR_POST_2 } from "./fr-posts/make-your-brand-visible-in-chatgpt";
import { FR_POST_3 } from "./fr-posts/vibe-coded-apps-have-an-seo-problem";
import { FR_POST_4 } from "./fr-posts/ai-at-work-2026-what-it-means-for-founders";
import { FR_POST_5 } from "./fr-posts/backlinks-still-decide-who-gets-recommended";
import { FR_POST_6 } from "./fr-posts/designing-for-the-ai-native-era";
import { FR_POST_7 } from "./fr-posts/design-systems-matter-more-in-the-ai-era";
import { FR_POST_8 } from "./fr-posts/base44-vs-lovable-which-one-for-your-next-app";

export const FR_TRANSLATED_POSTS: Readonly<Record<string, Post>> = {
  [FR_POST_1.slug]: FR_POST_1,
  [FR_POST_2.slug]: FR_POST_2,
  [FR_POST_3.slug]: FR_POST_3,
  [FR_POST_4.slug]: FR_POST_4,
  [FR_POST_5.slug]: FR_POST_5,
  [FR_POST_6.slug]: FR_POST_6,
  [FR_POST_7.slug]: FR_POST_7,
  [FR_POST_8.slug]: FR_POST_8,
};