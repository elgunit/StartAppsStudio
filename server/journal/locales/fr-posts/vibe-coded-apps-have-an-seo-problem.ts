import { getPost, type Block, type Post } from "../../posts";

const source = getPost("vibe-coded-apps-have-an-seo-problem");
if (!source) {
  throw new Error('Missing journal source post "vibe-coded-apps-have-an-seo-problem".');
}
const sourcePost: Post = source;

type LocalizedBlock =
  | string
  | { title: string; text: string }
  | readonly string[]
  | readonly { q: string; a: string }[];

const copy: readonly LocalizedBlock[] = [
  "Les applications codées au feeling effectuent leur rendu côté client : les robots voient donc un <div> vide. Pour corriger cela, placez soit un Cloudflare Worker entre votre domaine et Lovable afin de renvoyer du HTML rendu côté serveur aux robots, soit migrez le projet vers une véritable stack (Claude Code + Supabase + Vercel) avant d'investir dans le marketing.",
  'Des outils comme Lovable, Bolt et v0 sont formidables pour publier une idée en un après-midi. Ils ne sont pas formidables pour le SEO. Toute la page est un bundle React côté client, ce qui signifie que Googlebot, lors de sa première exploration, voit un <div id="root" /> vide. Aucun contenu. Aucun titre. Aucun schema. Aucun classement. Pour un MVP qui dépend du trafic organique, c’est un problème dès la première année.',
  "Voici les deux correctifs que nous utilisons chez Start Apps Studio, classés du moindre effort au meilleur retour.",
  "Correctif 1 : proxy SSR avec Cloudflare Worker",
  "Un Cloudflare Worker se place entre votre domaine et Lovable. Lorsqu’une requête arrive, le Worker vérifie le User-Agent : les vrais visiteurs sont transmis à Lovable comme d’habitude ; les robots (Googlebot, Bingbot, GPTBot, PerplexityBot, ClaudeBot) reçoivent, depuis la même URL, du HTML rendu côté serveur avec du vrai contenu et un balisage schema complet.",
  "Ce n’est pas du cloaking si c’est fait correctement. Le contenu reçu par le robot doit correspondre à celui que l’utilisateur finit par voir une fois le JS exécuté. La configuration se fait en deux étapes :",
  [
    "Ajoutez un CNAME à votre DNS qui pointe votre domaine personnalisé vers le Cloudflare Worker.",
    "Collez un prompt dans Lovable afin que le Worker dispose d’un inventaire canonique des pages à rendre côté serveur.",
  ],
  {
    title: "Quand utiliser l’approche Worker",
    text: "Si vous n’êtes pas prêt à quitter Lovable et que vous avez besoin de faire indexer des pages cette semaine, le Cloudflare Worker est le bon choix. C’est le seul correctif qui préserve le flux d’édition visuelle de Lovable.",
  },
  "Correctif 2 : migrer de Lovable avec Claude Code",
  "Le Worker vous fait gagner du temps. Mais si l’application doit réellement se classer, gérer du contenu dynamique ou être maintenue par des humains dans un an, vous voudrez passer à une stack Web « normale ». La méthode la plus rapide que nous ayons vue consiste à laisser Claude Code effectuer la migration pour vous.",
  "La recette de migration en 10 étapes",
  [
    "Poussez votre projet Lovable sur GitHub pour que Claude puisse facilement travailler avec.",
    "Installez Claude Code en local afin qu’il puisse lire et modifier directement votre repo.",
    "Indiquez à Claude votre repo (remote GitHub ou chemin local).",
    "Créez un projet Supabase pour la base de données et l’auth (environ cinq minutes).",
    "Demandez à Claude de migrer le projet hors de Lovable avec ce prompt : « Migre ce projet Lovable vers une stack Web normale et organise clairement le repo. »",
    "Configurez l’hébergement sur Vercel. L’offre gratuite couvre la plupart des MVP.",
    "Demandez à Claude quelles variables d’environnement et API keys sont nécessaires ; il est étonnamment efficace pour les identifier.",
    "Générez les clés et créez un fichier .env (clés Supabase, API tokens, etc.).",
    "Demandez à Claude de configurer le déploiement. Il peut relier le flux GitHub → Vercel et connecter Supabase.",
    "Corrigez tout ce qui casse en demandant à Claude de déboguer, une erreur à la fois.",
  ],
  "Cette configuration devient plus flexible que Lovable lui-même. Vous cessez de payer des crédits par prompt pour les modifications de l’application et pouvez recourir à des modèles gratuits pour les petites retouches, puisque Lovable utilise déjà Claude en coulisses pour la majeure partie de sa génération.",
  "L’hybride Lovable + Claude",
  "Si votre projet est en cours et que vous n’êtes pas prêt à migrer, il existe une voie intermédiaire validée par plusieurs utilisateurs de r/lovable : connectez Lovable à GitHub, puis donnez à Claude Code accès au même repo. Claude se place à un niveau au-dessus de Lovable, le guide pour les fonctionnalités complexes, le débogage et les améliorations, tandis que vous exécutez directement du SQL dans Supabase pour les changements de base de données (Lovable ne facture pas l’exécution d’une requête, c’est donc gratuit).",
  "Résultats : moins de crédits gaspillés sur des composants bloquants (des utilisateurs signalent 100+ crédits économisés sur un seul composant), une meilleure gestion de la logique emmêlée et, point essentiel pour cet article, assez de contrôle sur le HTML produit pour ajouter SSR et schema progressivement.",
  "Quel correctif choisir ?",
  [
    "Site marketing ou landing page uniquement → Cloudflare Worker SSR. Le moins cher et le plus rapide.",
    "Produit avec du contenu dynamique qui doit se classer → migration vers Claude Code + Supabase + Vercel.",
    "Projet en cours impossible à reconstruire → hybride Lovable + Claude, puis ajout de SSR aux pages importantes.",
  ],
  {
    title: "Notre intervention",
    text: "Start Apps Studio a migré une poignée de MVP Lovable hors de la plateforme en utilisant exactement cette recette. Si vous préférez ne pas consacrer une semaine à la plomberie, nous pouvons aller du prompt à une production indexée, généralement en moins de deux semaines.",
  },
  "Questions fréquentes",
  [
    {
      q: "Pourquoi Google ne peut-il pas indexer directement les pages Lovable ?",
      a: "Lovable livre un bundle React rendu côté client ; le HTML initial est donc un root div vide. L’exploration de premier passage de Googlebot capture ce HTML vide ; il peut (ou non) revenir plus tard pour rendre le JavaScript. Pour les nouveaux domaines sans autorité, ce rendu de second passage n’est souvent jamais déclenché.",
    },
    {
      q: "Le correctif Cloudflare Worker est-il considéré comme du cloaking ?",
      a: "Non, si le robot voit le même contenu que l’utilisateur finit par voir une fois le JS exécuté. Servir du HTML pré-rendu aux robots est une pratique SEO établie ; cela ne devient du cloaking que si vous servez un contenu différent aux robots et aux utilisateurs.",
    },
    {
      q: "Combien coûte la migration complète ?",
      a: "En autonomie : un week-end et un compte Vercel + Supabase avec offre gratuite. Réalisée par Start Apps Studio : généralement autour d’un sprint, incluse dans notre package MVP Production.",
    },
    {
      q: "Puis-je continuer à modifier visuellement après la migration ?",
      a: "Vous perdez l’éditeur dans le navigateur de Lovable, mais gagnez une boucle de développement normale et pouvez ajouter n’importe quel outil visuel (ou un autre AI builder) sur le repo. La plupart des équipes ne le regrettent pas une fois qu’elles constatent à quel point Claude Code itère plus vite.",
    },
  ],
];

const sourceLabels = [
  "Présentation r/lovable : « J’ai résolu le plus grand problème SEO de Lovable » (modèle Cloudflare Worker).",
  "Tutoriel r/lovable : « Lovable <> Claude = performances 10X » par u/EIAMM.",
  "r/lovable : migration en 10 étapes vers Claude Code + Supabase + Vercel.",
] as const;

function localizedBody(): Block[] {
  if (sourcePost.body.length !== copy.length) {
    throw new Error('French translation block count does not match "vibe-coded-apps-have-an-seo-problem".');
  }

  return sourcePost.body.map((block, index): Block => {
    const value = copy[index];
    if (block.type === "ul" || block.type === "ol") {
      if (!Array.isArray(value) || value.length !== block.items.length) {
        throw new Error(`French list does not match source at block ${index}.`);
      }
      return { ...block, items: [...value] };
    }
    if (block.type === "faq") {
      if (!Array.isArray(value) || value.length !== block.items.length) {
        throw new Error(`French FAQ does not match source at block ${index}.`);
      }
      return { ...block, items: [...value] };
    }
    if (block.type === "callout") {
      if (typeof value !== "object" || Array.isArray(value) || !("title" in value)) {
        throw new Error(`French callout does not match source at block ${index}.`);
      }
      return { ...block, title: value.title, text: value.text };
    }
    if (typeof value !== "string") {
      throw new Error(`French text does not match source at block ${index}.`);
    }
    return { ...block, text: value };
  });
}

const body = localizedBody();
const sourceStructure = sourcePost.body.map((block) => ({
  type: block.type,
  id: "id" in block ? block.id : undefined,
  items: block.type === "ul" || block.type === "ol" || block.type === "faq" ? block.items.length : undefined,
}));
const localizedStructure = body.map((block) => ({
  type: block.type,
  id: "id" in block ? block.id : undefined,
  items: block.type === "ul" || block.type === "ol" || block.type === "faq" ? block.items.length : undefined,
}));
if (JSON.stringify(localizedStructure) !== JSON.stringify(sourceStructure)) {
  throw new Error('French translation structure does not match "vibe-coded-apps-have-an-seo-problem".');
}
if ((sourcePost.sources?.length ?? 0) !== sourceLabels.length) {
  throw new Error('French translation source count does not match "vibe-coded-apps-have-an-seo-problem".');
}

export const FR_POST_3: Post = {
  ...sourcePost,
  title: "Les applications codées au feeling ont un problème de SEO. Voici comment le résoudre",
  seoTitle: "Applications codées au feeling et SEO : comment résoudre le problème | Start Apps Studio",
  description: "Lovable, Bolt et v0 livrent des div vides aux robots. Voici comment corriger cela : un proxy SSR Cloudflare Worker, ou une migration complète vers Claude Code + Supabase + Vercel lorsque vous devez vous classer.",
  seoDescription: "Lovable, Bolt et v0 livrent des div vides aux robots. Corrigez cela avec un proxy SSR Cloudflare Worker pour un résultat rapide, ou migrez vers une véritable stack lorsque le classement compte.",
  excerpt: "Les créations Lovable sont publiées en quelques heures et deviennent invisibles pour Google en quelques secondes. Deux façons de résoudre le problème : un proxy Cloudflare Worker pour un gain rapide et une migration complète lorsque le classement devient sérieux.",
  category: "Notes de terrain",
  tags: ["Vibe coding", "Lovable", "SEO", "SSR", "Claude"],
  body,
  sources: sourcePost.sources?.map((item, index) => ({
    ...item,
    label: sourceLabels[index],
  })),
};