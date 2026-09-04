import { getPost, type Block, type Post } from "../../posts";

type LocalizedBlock =
  | string
  | readonly string[]
  | readonly { q: string; a: string }[]
  | { text: string; cite: string }
  | { title: string; text: string };

const source = getPost("design-systems-matter-more-in-the-ai-era");
if (!source) {
  throw new Error(
    'Missing journal source post "design-systems-matter-more-in-the-ai-era".',
  );
}

const copy: readonly LocalizedBlock[] = [
  "À l’ère de l’AI, votre design system cesse d’être un simple plus et devient le plafond de ce à quoi les interfaces générées par l’AI pourront jamais ressembler. Un système robuste est un multiplicateur de force pour les livrables automatisés. Un système faible impose une limite de qualité qu’aucun prompt ne peut vous permettre de dépasser.",
  "Une histoire séduisante circule selon laquelle l’AI rend les design systems inutiles. Si un modèle peut générer n’importe quelle interface à la demande, pourquoi entretenir des tokens, des composants et des directives ? La réponse honnête est l’inverse. Plus votre interface est générée, plus votre design system détermine ce qu’est la qualité. L’AI n’invente pas la qualité. Elle amplifie les fondations que vous lui fournissez.",
  "Les trois changements auxquels chaque équipe SaaS fait face",
  "1. Les API sont la nouvelle surface produit",
  "Les agents AI ne cliquent pas sur des boutons et ne naviguent pas dans des menus. Ils appellent des API. Si vos actions les plus importantes ne sont disponibles que derrière une modale ou un assistant en plusieurs étapes, un agent ne peut pas les utiliser et contournera de plus en plus votre produit entièrement. La norme est désormais de disposer de endpoints propres, complets et bien documentés pour chaque action significative qu’un humain peut accomplir. Votre API n’est plus un back office : elle est la porte d’entrée d’une part croissante de vos utilisateurs.",
  "2. Les design systems sont un multiplicateur de force, pas une surcharge",
  "Lorsque l’AI assemble des écrans à la demande, les composants, tokens et patterns que vous maintenez deviennent le vocabulaire que parle le modèle. Un système rigoureux, avec une nomenclature claire, des espacements prévisibles et un petit ensemble de primitives bien testées, permet au modèle de produire à chaque fois des interfaces cohérentes. Un système lâche produit de la dérive, des incohérences et une lente érosion de la confiance. Le même prompt appliqué à un système fort et à un système faible donne des produits visiblement différents.",
  "3. Vous concevez désormais pour deux utilisateurs à la fois",
  "Chaque produit a maintenant deux publics. L’humain, qui a besoin de signaux de confiance, d’annulations, de pistes d’audit et d’une compréhension claire de ce qui se passe en son nom. L’agent, qui a besoin de données structurées, d’identifiants stables, d’endpoints idempotents et de messages d’erreur lisibles par machine. Le même workflow a souvent besoin des deux surfaces en parallèle : un écran de confirmation pour la personne, une réponse JSON pour l’agent. Les traiter tous deux comme des utilisateurs de première classe à part entière dès le premier jour est la nouvelle norme.",
  "Pourquoi un design system solide est l’investissement au plus fort levier",
  "Imaginez deux équipes qui construisent des produits concurrents. Toutes deux utilisent le même modèle pour générer certaines parties de l’interface. L’équipe A a passé l’année précédente à renforcer son design system : tokens documentés, composants accessibles, états clairs, directives écrites pour les espacements et la densité. L’équipe B a livré vite et accumulé des dizaines de styles ponctuels. Donnez le même prompt aux deux. L’équipe A obtient un écran soigné et cohérent auquel l’utilisateur fait immédiatement confiance. L’équipe B obtient quelque chose qui paraît plausible au premier regard et semble de moins en moins juste à mesure qu’on l’utilise. Le modèle est le même. Le plafond ne l’est pas.",
  [
    "Des tokens qui nomment en langage clair la couleur, l’espacement, le rayon et le mouvement",
    "Un petit ensemble de primitives qui gèrent 80 percent des mises en page : carte, liste, tableau, formulaire, dialogue",
    "Des états documentés pour l’absence de données, le chargement, l’erreur, le succès et les données partielles",
    "L’accessibilité intégrée, et non ajoutée après coup, afin que les écrans générés ne soient jamais livrés avec des réglages par défaut inaccessibles",
    "Un court guide écrit de voix et de ton pour que le texte généré reste fidèle à votre marque",
  ],
  "Ce que cela signifie pour les designers",
  "Le travail au pixel diminue. Le travail de jugement augmente. Quand le modèle peut générer un écran acceptable en quelques secondes, ce qu’un designer fait de plus précieux est de décider ce qui doit ou non être généré, ce qui exige un humain dans la boucle et ce que le système sous-jacent doit rendre facile par défaut. Le goût, la retenue et une compréhension profonde du modèle mental de l’utilisateur deviennent l’avantage défendable. Le rôle du designer est de rendre les tâches complexes évidentes, puis d’encoder cette évidence dans le système qu’utilise le modèle.",
  {
    text: "Le clavier nous a libérés de la machine à écrire, la charrue nous a libérés de la bêche. L’AI nous libère de la construction des écrans. Ce qui nous appartient encore, c’est ce qu’il faut construire et pourquoi cela compte.",
    cite: "paraphrasé à partir de la présentation originale",
  },
  {
    title: "Comment nous envisageons cela chez Start Apps Studio",
    text: "Chaque MVP que nous livrons commence désormais par deux artefacts avant la conception du moindre écran : un contrat d’API qu’un agent pourrait piloter de bout en bout, et un design system modeste mais réel. Tous deux sont délibérément minimaux au lancement et évoluent avec le produit. Le résultat est un logiciel cohérent dès le premier jour, qui le reste à mesure qu’une plus grande partie de sa surface est générée par l’AI.",
  },
  "Questions fréquentes",
  [
    {
      q: "L’AI rend-elle les design systems inutiles ?",
      a: "Non. Elle les rend plus importants. Le modèle n’invente pas la qualité : il amplifie les fondations que vous lui donnez. Un design system solide est désormais le plafond de ce à quoi vos interfaces générées par l’AI pourront jamais ressembler.",
    },
    {
      q: "Par où une petite équipe doit-elle commencer avec un design system ?",
      a: "Choisissez cinq tokens, cinq composants et cinq états documentés, puis utilisez-les partout. Un petit système réellement suivi l’emporte sur un système tentaculaire auquel personne ne fait confiance. Ne le développez que lorsqu’un besoin produit réel vous y pousse.",
    },
    {
      q: "À quoi ressemble concrètement un produit API-first ?",
      a: "Chaque action qu’un utilisateur peut effectuer dans l’UI est aussi accessible via un endpoint documenté, avec des ID stables, des erreurs prévisibles et un comportement idempotent. L’UI devient l’un de plusieurs clients, et non le seul chemin vers le produit.",
    },
    {
      q: "Le design comme carrière est-il en train de disparaître ?",
      a: "C’est l’inverse. La part consistant à pousser des pixels diminue, mais le jugement, le goût, la pensée systémique et l’empathie utilisateur deviennent les compétences au plus fort levier dans la création de logiciels. Les designers qui maîtrisent le système à partir duquel le modèle assemble seront plus précieux, pas moins.",
    },
  ],
];

if (source.body.length !== copy.length) {
  throw new Error(
    'French translation block count does not match "design-systems-matter-more-in-the-ai-era".',
  );
}

export const FR_POST_7: Post = {
  ...source,
  title: "Votre design system compte davantage à l’ère de l’AI, pas moins",
  seoTitle: "Votre design system compte davantage à l’ère de l’AI | Start Apps Studio",
  description:
    "Lorsque l’AI génère votre interface, la qualité du résultat est limitée par celle de votre design system. Découvrez pourquoi les API deviennent la nouvelle surface produit, pourquoi un système solide est désormais un multiplicateur de force, pourquoi chaque produit a deux utilisateurs et pourquoi le design comme jugement a plus de valeur que jamais.",
  seoDescription:
    "Lorsque l’AI génère votre UI, votre design system fixe le plafond de qualité. Découvrez pourquoi les API deviennent la surface produit et pourquoi le jugement de design compte davantage.",
  excerpt:
    "Si l’AI va générer vos écrans, le plafond de ce qu’elle peut produire est votre design system. Un système faible produit des résultats faibles, à chaque fois. Voici ce qui change.",
  category: "Essai",
  tags: ["Design Systems", "AI-native", "API", "Design"],
  body: source.body.map((block, index): Block => {
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
    if (block.type === "quote") {
      if (typeof value === "string" || !("cite" in value)) {
        throw new Error(`French quote does not match source at block ${index}.`);
      }
      return { ...block, text: value.text, cite: value.cite };
    }
    if (block.type === "callout") {
      if (typeof value === "string" || !("title" in value)) {
        throw new Error(`French callout does not match source at block ${index}.`);
      }
      return { ...block, title: value.title, text: value.text };
    }
    if (typeof value !== "string") {
      throw new Error(`French text does not match source at block ${index}.`);
    }
    return { ...block, text: value };
  }),
};