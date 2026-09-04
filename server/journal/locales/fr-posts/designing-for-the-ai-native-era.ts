import { getPost, type Post } from "../../posts";

const slug = "designing-for-the-ai-native-era";
const source = getPost(slug);

if (!source) {
  throw new Error(`Missing journal source post "${slug}".`);
}

export const FR_POST_6: Post = {
  ...source,
  title: "Concevoir pour l’ère native de l’IA : UI générative et création pour les agents",
  seoTitle: "Ère native de l’IA : UI générative et agents | Start Apps Studio",
  description:
    "Un guide de terrain pour les fondateurs sur le passage des tableaux de bord statiques aux interfaces génératives, les quatre étapes par lesquelles passe chaque produit natif de l’IA, et les trois choses à faire aujourd’hui pour que les agents IA puissent réellement utiliser votre produit.",
  seoDescription:
    "Un guide de terrain sur l’UI générative et les produits natifs de l’IA : les quatre étapes de chaque produit et trois mesures pour préparer votre produit aux agents dès aujourd’hui.",
  excerpt:
    "Remplacer votre tableau de bord par une barre de chat est une régression. Le vrai changement consiste à générer à la volée des interfaces pour la tâche en cours, et à concevoir des backends qu’un agent peut piloter sans jamais toucher votre UI.",
  category: "Essai",
  tags: ["Natif de l’IA", "UI générative", "Design", "API"],
  body: [
    {
      type: "answer",
      text:
        "Les produits natifs de l’IA ne remplacent pas les tableaux de bord par des chatbots. Ils génèrent la bonne interface pour chaque tâche, exposent chaque action via une API propre afin que les agents puissent piloter directement le produit, et sont conçus pour deux utilisateurs à la fois : un humain qui a besoin de confiance et de supervision, et un agent qui a besoin de données structurées et de points de terminaison fiables.",
    },
    {
      type: "p",
      text:
        "La plupart des équipes ajoutent encore une barre de chat à un tableau de bord traditionnel et qualifient le résultat de natif de l’IA. Ce n’est pas le cas. Une barre de chat échange la densité visuelle et le contexte contre une seule saisie de texte, puis demande à l’utilisateur de se souvenir de chaque commande. La prochaine génération de produits prend la direction inverse. L’interface est générée pour la tâche, le backend est conçu autant pour les agents que pour les humains, et le design passe de l’agencement des pixels à la structuration du jugement.",
    },
    { type: "h2", text: "Pourquoi une barre de chat est une régression, pas une amélioration", id: "chat-is-a-downgrade" },
    {
      type: "p",
      text:
        "Un bon tableau de bord condense des centaines de signaux en un seul regard. Le remplacer par une saisie de chat élimine cette densité et oblige l’utilisateur à retaper pour revenir à des informations qu’il voyait déjà. Le chat est une excellente entrée pour des demandes ambiguës et ouvertes. Il remplace mal la mémoire musculaire d’un écran bien conçu. La bonne approche n’est pas le chat au lieu de l’UI, mais une UI générée par le modèle en réponse à la demande.",
    },
    { type: "h2", text: "Les quatre étapes des produits natifs de l’IA", id: "four-stages" },
    { type: "h3", text: "1. Interfaces textuelles de base", id: "stage-text" },
    {
      type: "p",
      text:
        "C’est le point de départ où se trouvent aujourd’hui la plupart des produits. Une saisie de chat, un flux de réponses textuelles, peut-être quelques boutons. Utile pour l’exploration, mais faible pour les workflows répétés, car rien ne persiste et chaque réponse doit être retapée.",
    },
    { type: "h3", text: "2. Composants génératifs intégrés", id: "stage-inline" },
    {
      type: "p",
      text:
        "Le modèle renvoie plus que du texte. Des tableaux, graphiques, formulaires et petits widgets interactifs apparaissent dans la conversation, dimensionnés selon la question posée. L’interface commence à ressembler à une feuille de travail qui se construit elle-même au fil de votre conversation.",
    },
    { type: "h3", text: "3. Générateurs d’UI persistants", id: "stage-builders" },
    {
      type: "p",
      text:
        "Les composants générés sont épinglés, enregistrés et réorganisés en pages auxquelles l’utilisateur peut revenir. Le produit devient un établi personnel où le modèle assemble des écrans à la demande et où l’utilisateur conserve ceux qui fonctionnent. C’est là que se situeront la plupart des produits natifs de l’IA ambitieux pendant les deux prochaines années.",
    },
    { type: "h3", text: "4. Interfaces ambiantes et autonomes", id: "stage-ambient" },
    {
      type: "p",
      text:
        "L’état final. Le produit anticipe les besoins de l’utilisateur et affiche la bonne interface, action ou synthèse sans qu’on le lui demande. Les prompts deviennent rares. Le rôle de l’UI est de confirmer, corriger et approuver, non de donner des commandes. Très peu de produits ont encore gagné la confiance nécessaire pour fonctionner ainsi.",
    },
    { type: "h2", text: "Le nouveau rôle du design", id: "design-role" },
    {
      type: "p",
      text:
        "Quand le modèle peut produire une interface acceptable en quelques secondes, le design cesse de consister à déplacer des pixels et devient une affaire de jugement. Quels problèmes méritent une interface générée et lesquels méritent une interface fixe. Quelles actions ont besoin de friction. Quels états nécessitent un humain dans la boucle. Le goût, la retenue et une compréhension profonde du modèle mental de l’utilisateur deviennent le fossé défensif. Les équipes qui gagnent ne sont pas celles qui peuvent produire le plus de composants, mais celles qui décident de ce qui ne devrait jamais être généré.",
    },
    { type: "h2", text: "Concevoir pour les agents IA : trois éléments à livrer dès maintenant", id: "build-for-agents" },
    { type: "h3", text: "1. Architecture API-first", id: "api-first" },
    {
      type: "p",
      text:
        "Les agents ne cliquent pas sur des boutons. Ils appellent des API. Chaque action importante qu’un humain peut effectuer dans votre UI devrait aussi être accessible via un point de terminaison propre et documenté. Si la seule façon d’annuler un abonnement, d’exporter un rapport ou d’inviter un collègue passe par une modale, votre produit est invisible pour la couche d’agents qui devient rapidement la manière dont le travail s’accomplit.",
    },
    { type: "h3", text: "2. Un design system sur lequel le modèle peut s’appuyer", id: "design-system" },
    {
      type: "p",
      text:
        "La qualité d’une UI générée dépend des composants qu’elle est autorisée à assembler. Un design system solide, avec des tokens nommés, des espacements prévisibles et un petit ensemble de primitives bien documentées, donne au modèle un vocabulaire qui produit à chaque fois des interfaces cohérentes et conformes à la marque. Sans cela, chaque écran généré semble légèrement décalé et la confiance s’érode vite.",
    },
    { type: "h3", text: "3. Prise en charge de deux utilisateurs : humain et agent", id: "dual-user" },
    {
      type: "p",
      text:
        "Concevez pour deux utilisateurs à la fois. L’humain a besoin de signaux de confiance, d’annulation, de pistes d’audit et d’une propriété claire de chaque changement. L’agent a besoin de données structurées, d’ID stables, de points de terminaison idempotents et de messages d’erreur lisibles par machine. La même action nécessite souvent les deux surfaces : un écran de confirmation pour la personne et une réponse JSON pour l’agent. Traitez-les à égalité dès le premier jour.",
    },
    {
      type: "callout",
      title: "Comment nous appliquons cela chez Start Apps Studio",
      text:
        "Chaque MVP que nous livrons commence désormais par le contrat d’API, et non par les écrans. Nous documentons chaque point de terminaison comme si un agent allait en être le premier utilisateur, construisons un petit design system avant de maquettiser la première page, et réservons l’UI générative aux parties du produit dont l’entrée est réellement ouverte. Le résultat est un logiciel qu’un humain peut aimer aujourd’hui et qu’un agent peut piloter demain.",
    },
    { type: "h2", text: "Questions fréquentes", id: "faq" },
    {
      type: "faq",
      items: [
        {
          q: "Un chatbot est-il la même chose qu’un produit natif de l’IA ?",
          a: "Non. Un chatbot est un mode de saisie parmi d’autres. Un produit natif de l’IA réorganise son interface, ses actions et son modèle de données autour de l’hypothèse que les humains comme les agents IA l’utiliseront. De nombreux produits natifs de l’IA n’ont aucune surface de chat.",
        },
        {
          q: "Dois-je reconstruire mon produit pour qu’il soit natif de l’IA ?",
          a: "Rarement. La plupart des équipes peuvent avancer en exposant leurs actions principales via des API propres, en resserrant leur design system et en ajoutant quelques composants génératifs intégrés là où l’entrée est ouverte. Une reconstruction complète ne vaut la peine que lorsque les trois premières étapes sont en place et que vous êtes prêt à concevoir pour un usage ambiant.",
        },
        {
          q: "Les métiers du design vont-ils disparaître à l’ère native de l’IA ?",
          a: "Non, ils évoluent. Le travail sur les pixels diminue, le travail de jugement augmente. Choisir quelles interfaces générer, définir le système à partir duquel le modèle assemble, et protéger l’utilisateur des mauvaises sorties du modèle sont désormais les tâches de design à plus fort effet de levier.",
        },
        {
          q: "Quelle est la chose la plus importante à faire aujourd’hui ?",
          a: "Assurez-vous que chaque action qu’un utilisateur peut effectuer dans votre produit soit aussi accessible via un point de terminaison d’API documenté. Sans cela, les agents ne peuvent pas utiliser votre produit, et toute UI générative ajoutée plus tard reposera sur une fondation qui limite jusqu’où elle peut aller.",
        },
      ],
    },
  ],
};

const sourceStructure = source.body.map((block) => ({
  type: block.type,
  id: "id" in block ? block.id : undefined,
  items: block.type === "ul" || block.type === "ol" || block.type === "faq" ? block.items.length : undefined,
}));
const localizedStructure = FR_POST_6.body.map((block) => ({
  type: block.type,
  id: "id" in block ? block.id : undefined,
  items: block.type === "ul" || block.type === "ol" || block.type === "faq" ? block.items.length : undefined,
}));

if (JSON.stringify(sourceStructure) !== JSON.stringify(localizedStructure)) {
  throw new Error(`French translation structure does not match "${slug}".`);
}

const sourceUrls = (source.sources ?? []).map(({ url }) => url);
const localizedUrls = (FR_POST_6.sources ?? []).map(({ url }) => url);
if ((source.sources?.length ?? 0) !== (FR_POST_6.sources?.length ?? 0)) {
  throw new Error(`French translation source count does not match "${slug}".`);
}
if (JSON.stringify(sourceUrls) !== JSON.stringify(localizedUrls)) {
  throw new Error(`French translation source URLs do not match "${slug}".`);
}