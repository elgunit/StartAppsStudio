import { getPost, type Post } from "../../posts";

const SOURCE_SLUG = "base44-vs-lovable-which-one-for-your-next-app";
const sourcePost = getPost(SOURCE_SLUG);

if (!sourcePost) {
  throw new Error(`Article source introuvable : "${SOURCE_SLUG}".`);
}

export const FR_POST_8: Post = {
  slug: sourcePost.slug,
  title: "Base44 ou Lovable : lequel choisir pour votre prochaine application ?",
  seoTitle: "Base44 ou Lovable : lequel choisir pour votre prochaine application ? | Start Apps Studio",
  description: "Base44 et Lovable privilégient des formes de rapidité différentes. Comparez leur contrôle du backend, workflow IA, SEO et modalités de passation avant de choisir où construire.",
  seoDescription: "Base44 est une voie rapide vers une application cloisonnée. Lovable offre un backend plus ouvert et un meilleur point de départ pour des pages publiques et trouvables. Comparez les compromis avant de construire.",
  excerpt: "Base44 et Lovable peuvent tous deux faire avancer une idée rapidement. La différence importante apparaît plus tard, lorsque votre application a besoin d’une authentification personnalisée, de visibilité dans les recherches ou d’une passation nette.",
  publishedAt: sourcePost.publishedAt,
  updatedAt: sourcePost.updatedAt,
  readMinutes: sourcePost.readMinutes,
  category: "Notes de terrain",
  tags: ["Base44", "Lovable", "Vibe-coding", "SEO", "Stratégie produit"],
  body: [
    { type: "answer", text: "Base44 convient mieux à une application cloisonnée et authentifiée, où la rapidité et les conventions intégrées comptent. Lovable convient mieux lorsque vous avez besoin d’un backend Supabase ouvert, de place pour des intégrations personnalisées ou de pages publiques que les moteurs de recherche peuvent lire. Si le produit devient essentiel à l’activité, considérez l’un ou l’autre comme un point de départ et planifiez la passation avant de trop construire." },
    { type: "p", text: "Choisir un constructeur d’applications IA est facile lorsque la seule mesure est la rapidité avec laquelle il produit un premier écran. La question plus difficile est ce qui se passe après cet écran : lorsqu’un flux de connexion devient inhabituel, que le modèle de données doit changer, que Google doit explorer une page de destination ou qu’un autre ingénieur doit reprendre le code." },
    { type: "p", text: "Base44 et Lovable sont tous deux efficaces pour transformer une idée approximative en un flux fonctionnel. Ils font des compromis différents pour y parvenir. Base44 paraît plus cloisonné et plus pratique sur le plan opérationnel. Lovable vous offre des primitives plus familières et portables autour de Supabase. Aucun n’est le gagnant universel. Le bon choix dépend des domaines où vous avez besoin de contrôle." },
    { type: "h2", text: "La vraie décision est de savoir où vous avez besoin de contrôle", id: "where-you-need-control" },
    { type: "p", text: "Un constructeur n’est pas seulement une surface où écrire des prompts. C’est aussi une décision concernant votre backend, votre modèle de déploiement, votre présence dans les recherches et votre futur cycle de maintenance. Ces choix peuvent rester invisibles tant qu’une application est petite. Ils deviennent coûteux dès que des utilisateurs, des paiements, des données privées et du trafic marketing en dépendent." },
    { type: "h2", text: "1. Backend : primitives ouvertes ou plateforme cloisonnée ?", id: "backend-control" },
    { type: "h3", text: "Lovable : des briques familières", id: "lovable-backend" },
    { type: "p", text: "Lovable s’appuie sur Supabase, ce qui donne au projet un backend que de nombreux ingénieurs comprennent déjà : Postgres pour les données, des schémas d’authentification standard, du stockage et des API documentées. Cela ne rend pas automatiquement chaque implémentation bonne, mais vous donne une base plus portable lorsque le produit exige des rôles personnalisés, un fournisseur OAuth moins courant ou une intégration qui ne suit pas le chemin standard." },
    { type: "p", text: "L’avantage pratique n’est pas que Supabase élimine la complexité. C’est que cette complexité est visible. Vous pouvez examiner la base de données, comprendre le flux d’authentification et trouver des ingénieurs ayant déjà travaillé avec les mêmes primitives." },
    { type: "h3", text: "Base44 : plus rapide dans un périmètre défini", id: "base44-backend" },
    { type: "p", text: "Base44 intègre une plus grande partie de l’expérience backend dans son propre environnement géré. C’est exactement ce qu’un fondateur non technique peut rechercher : moins de services à configurer, des valeurs par défaut judicieuses et moins de temps consacré à relier la première version. Pour un tableau de bord privé, un outil interne ou un flux authentifié simple, cette commodité a une vraie valeur." },
    { type: "p", text: "Le compromis est que des exigences inhabituelles peuvent vous pousser vers des solutions de contournement. Les limites d’un backend propriétaire peuvent restreindre votre liberté de concevoir une authentification personnalisée, d’ajouter un fournisseur d’identité spécialisé ou de déplacer une partie du système ailleurs. C’est une bonne raison de tester l’exigence la plus difficile en premier, et non en dernier." },
    { type: "callout", title: "Posez-vous cette question avant de choisir", text: "Quelle est la chose la moins standard que ce produit doit faire ? Testez ce flux avant d’investir dans le reste de l’interface. Un constructeur qui gère magnifiquement la démo mais ne peut pas répondre à la contrainte déterminante ne vous fait pas gagner de temps." },
    { type: "h2", text: "2. Workflow IA : commodité ou choix délibéré ?", id: "ai-workflow" },
    { type: "p", text: "Les deux outils diffèrent également par le degré de visibilité qu’ils offrent sur le choix du modèle. Cela compte moins pour une page de destination que pour un produit avec des états complexes, des règles métier peu familières ou un problème de débogage où la cohérence est plus utile que la nouveauté." },
    { type: "h3", text: "Lovable maintient un cycle sans friction", id: "lovable-ai-workflow" },
    { type: "p", text: "Le mode automatique de Lovable choisit le modèle selon la tâche, ce qui simplifie l’expérience. Vous décrivez la modification, examinez le résultat et avancez. C’est utile lorsque le principal goulot d’étranglement consiste à transformer l’idée d’un fondateur en une forme testable, plutôt qu’à ajuster le processus d’implémentation." },
    { type: "h3", text: "Base44 vous donne un sélecteur de modèle", id: "base44-ai-workflow" },
    { type: "p", text: "Base44 place davantage de choix entre les mains du créateur. Choisir entre des modèles tels qu’Opus ou Sonnet peut être utile lorsque vous savez que l’un est meilleur pour une tâche de débogage, une intégration ou une importante refactorisation. Cela facilite aussi l’utilisation constante d’un modèle préféré sur une partie sensible du projet." },
    { type: "p", text: "Le contrôle du modèle n’est pas le contrôle du produit. Un modèle plus puissant peut encore produire la mauvaise abstraction, et un modèle rapide peut encore effectuer une modification risquée. Quel que soit l’outil utilisé, conservez un périmètre écrit, examinez le modèle de données et testez le flux de travail principal en dehors du chemin standard." },
    { type: "h2", text: "3. SEO : un robot d’exploration peut-il voir le produit ?", id: "seo-and-crawling" },
    { type: "p", text: "Le SEO ne compte que pour les parties de votre produit qui doivent être découvertes. Un tableau de bord privé pour les opérations n’a pas besoin de se positionner. Une page de destination publique, un annuaire, une page de comparaison ou une boucle d’acquisition pilotée par le produit en ont absolument besoin." },
    { type: "h3", text: "Lovable offre le meilleur point de départ pour les pages publiques", id: "lovable-seo" },
    { type: "p", text: "Le rendu côté serveur de Lovable signifie qu’un robot d’exploration peut recevoir du HTML pertinent au lieu d’attendre l’exécution d’un bundle côté client. Cela donne à Googlebot et aux autres systèmes de découverte un meilleur premier aperçu des titres, textes, liens et contenus structurés qui expliquent le sujet de la page." },
    { type: "p", text: "Le SSR n’est pas une garantie de positionnement. Vous avez toujours besoin de contenu utile, d’URL stables, de liens internes, de métadonnées et d’un schéma qui correspond à ce que les visiteurs voient. C’est simplement une bien meilleure fondation que de supposer que chaque robot rendra correctement une application React lors d’un second passage." },
    { type: "h3", text: "Base44 est souvent le choix raisonnable pour les applications privées", id: "base44-seo" },
    { type: "p", text: "L’approche React et Vite de Base44 peut être parfaitement adéquate lorsque l’application est derrière une authentification et que les pages publiques d’acquisition se trouvent ailleurs. Elle devient préoccupante lorsque l’application Base44 est elle-même le site marketing. Les réglages de métadonnées ne signifient pas nécessairement qu’un robot brut peut voir le contenu complet de la page ; testez donc le HTML initial avant de vous engager dans un plan de croissance organique." },
    { type: "h2", text: "4. Le test de la passation : pouvez-vous partir de façon responsable ?", id: "handoff" },
    { type: "p", text: "Le meilleur constructeur n’est pas seulement celui qui vous amène à la version un. C’est celui que vous pouvez quitter sans perdre le produit. Avant de commencer, répondez à quatre questions peu glamour :" },
    { type: "ul", items: ["Pouvez-vous exporter ou examiner le code, les données et la configuration sans le constructeur ?", "Un autre ingénieur peut-il exécuter le projet localement et comprendre où se trouvent les décisions importantes ?", "Pouvez-vous remplacer le service d’authentification, de paiements ou de données par défaut si le produit le dépasse ?", "Quel est le chemin de migration si la première version fonctionne et que les exigences cessent d’être standard ?"] },
    { type: "p", text: "Ces questions ne sont pas un argument contre les outils gérés. Elles permettent de les utiliser délibérément. Une application interne cloisonnée n’aura peut-être jamais besoin de migration. Un produit public avec une équipe qui grandit aura probablement besoin d’un plan de propriété et de passation plus clair que ne le laisse entendre son premier prompt." },
    { type: "h2", text: "Lequel devriez-vous choisir ?", id: "decision-guide" },
    { type: "ul", items: ["Choisissez Lovable pour une page de destination publique, une présence produit trouvable ou une application qui a besoin des primitives backend ouvertes de Supabase.", "Choisissez Base44 pour un tableau de bord privé, un outil interne ou un flux authentifié simple où la configuration gérée constitue le principal avantage.", "Choisissez Lovable lorsque l’authentification personnalisée, des relations de données inhabituelles ou des intégrations tierces sont centrales au produit.", "Choisissez l’un ou l’autre pour un sprint de validation court, mais consignez le plan de passation avant l’arrivée de vrais utilisateurs, de paiements ou de données sensibles.", "Optez plus tôt pour une base de code classique lorsque la valeur du produit dépend d’exigences qu’aucun constructeur ne prend correctement en charge."] },
    { type: "quote", text: "L’outil le plus rapide est celui qui rend votre prochaine décision produit moins coûteuse, pas celui qui génère le plus de code au cours du premier après-midi.", cite: "une règle que nous utilisons pour choisir un chemin de construction" },
    { type: "callout", title: "Notre approche chez Start Apps Studio", text: "Nous utilisons les constructeurs IA lorsqu’ils raccourcissent le chemin vers des preuves, et non lorsqu’ils permettent à une équipe de repousser les décisions difficiles. Avant de construire, nous identifions le premier utilisateur, le flux de travail principal, les exigences de confiance et la partie du système qui doit rester flexible. C’est ainsi qu’un prototype rapide devient un produit plutôt qu’une première ébauche impressionnante." },
    { type: "h2", text: "Questions fréquentes", id: "faq" },
    { type: "faq", items: [
      { q: "Base44 est-il meilleur que Lovable ?", a: "Aucun n’est meilleur dans toutes les situations. Base44 est convaincant pour les applications authentifiées et cloisonnées où la configuration gérée et le choix du modèle comptent. Lovable convient mieux lorsque vous avez besoin d’un backend Supabase plus ouvert, d’intégrations personnalisées ou de pages publiques qui doivent pouvoir être explorées." },
      { q: "Puis-je utiliser Base44 ou Lovable pour un MVP ?", a: "Oui, surtout lorsque le MVP est conçu pour répondre à une question produit ciblée. Gardez un périmètre restreint, testez tôt la contrainte déterminante et décidez ce qu’il advient du code et des données si l’expérience justifie une construction plus importante." },
      { q: "Quelle plateforme est la meilleure pour le SEO ?", a: "Lovable offre le meilleur point de départ pour le SEO public, car le HTML rendu côté serveur donne immédiatement aux robots du contenu à lire. Vous devez tout de même examiner la réponse initiale réelle et tester vos métadonnées, liens et schéma, plutôt que de vous fier à l’étiquette d’une plateforme." },
      { q: "Quand devrais-je aller au-delà d’un constructeur d’applications IA ?", a: "Passez à autre chose lorsque les exigences importantes du produit deviennent des contournements : identité personnalisée, autorisations complexes, intégrations inhabituelles, contraintes de performance ou équipe ayant besoin d’une propriété prévisible. Une migration est plus facile lorsque vous planifiez la sortie avant que la première version ne devienne essentielle à l’activité." },
    ] },
  ],
  sources: [
    { label: "Source de comparaison fournie pour cette note de terrain : discussion sur l’architecture backend et l’authentification (0:55–13:05)." },
    { label: "Source de comparaison fournie pour cette note de terrain : discussion sur le workflow des modèles IA et la sélection des modèles (27:41–34:12)." },
    { label: "Source de comparaison fournie pour cette note de terrain : SEO, SSR et recommandations finales sur les plateformes (37:16–1:22:23)." },
  ],
};

function structure(post: Post) {
  return post.body.map((block) => ({
    type: block.type,
    id: "id" in block ? block.id : undefined,
    items: block.type === "ul" || block.type === "ol" || block.type === "faq" ? block.items.length : undefined,
  }));
}

if (JSON.stringify(structure(FR_POST_8)) !== JSON.stringify(structure(sourcePost))) {
  throw new Error(`L’article localisé "${SOURCE_SLUG}" ne conserve pas la structure du corps source.`);
}

const sourceUrls = sourcePost.sources?.map((source) => source.url);
const localizedUrls = FR_POST_8.sources?.map((source) => source.url);
if (JSON.stringify(localizedUrls) !== JSON.stringify(sourceUrls)) {
  throw new Error(`L’article localisé "${SOURCE_SLUG}" ne conserve pas les URL des sources.`);
}