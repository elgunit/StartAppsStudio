import { getPost, type Block, type Post } from "../posts";

const slugs = [
  "ai-overviews-citation-playbook-for-mvps",
  "make-your-brand-visible-in-chatgpt",
  "vibe-coded-apps-have-an-seo-problem",
  "ai-at-work-2026-what-it-means-for-founders",
  "backlinks-still-decide-who-gets-recommended",
  "designing-for-the-ai-native-era",
  "design-systems-matter-more-in-the-ai-era",
  "base44-vs-lovable-which-one-for-your-next-app",
] as const;

const translations: Readonly<Record<string, string>> = {
  "The AI Overviews citation playbook for MVPs":
    "Сборник цитирований «Обзоры ИИ» для MVP",
  "AI Overviews Citation Playbook for MVPs | Start Apps Studio":
    "Пособие по цитированию в AI Overviews для MVP | Start Apps Studio",
  "Five concrete patterns we see in pages pulled into Google AI Overviews: one-sentence answers, FAQPage schema, comparison tables, named entities up top, and dated stats. Applied to three Start Apps Studio MVPs.":
    "Пять конкретных шаблонов, которые мы видим на страницах, добавленных в обзоры Google AI: ответы в одно предложение, схема FAQPage, сравнительные таблицы, именованные объекты вверху и датированная статистика. Применяется к трем MVP Start Apps Studio.",
  "Five patterns that get MVPs cited in AI Overviews: direct answers, FAQPage schema, comparison tables, named entities, and dated stats. Real examples included.":
    "Пять шаблонов, по которым MVP упоминаются в обзорах AI: прямые ответы, схема FAQPage, сравнительные таблицы, именованные объекты и датированная статистика. Реальные примеры включены.",
  "Most MVPs wait months to be cited in Google's AI Overviews. The pages that get pulled in early all do the same five things, and none of them are luck.":
    "Большинство MVP месяцами ждут, чтобы их упомянули в обзорах искусственного интеллекта Google. Страницы, которые открываются раньше, выполняют одни и те же пять действий, и ни одна из них не является удачной.",
  Playbook: "Пособие",
  GEO: "GEO",
  "AI Overviews": "Обзоры ИИ",
  Schema: "Схема",
  MVP: "MVP",
  "Pages cited in Google AI Overviews share five traits: a one-sentence direct answer in the first 100 words, FAQPage JSON-LD with real shopper questions, at least one comparison table, named entities (brand, product, category) early on, and dated stats. Add all five and a brand-new MVP can earn its first AIO citation within two weeks of indexing.":
    "Страницы, цитируемые в обзорах Google AI, имеют пять общих черт: прямой ответ одним предложением в первых 100 словах, страница FAQ в формате JSON-LD с реальными вопросами покупателей, как минимум одна сравнительная таблица, названия объектов (бренд, продукт, категория) на ранней стадии и датированная статистика. Добавьте все пять, и совершенно новый MVP сможет получить свою первую награду AIO в течение двух недель после индексации.",
  "We've shipped enough MVPs at Start Apps Studio to see the pattern: the pages that get pulled into Google's AI Overviews aren't the longest, the prettiest, or the highest-DR. They're the most extractable. Below is the exact five-pattern playbook we apply to every MVP launch page, with three real before/after examples from our portfolio.":
    "Мы предоставили достаточно MVP в Start Apps Studio, чтобы увидеть закономерность: страницы, которые попадают в обзоры искусственного интеллекта Google, не являются самыми длинными, самыми красивыми или с самым высоким DR. Они наиболее извлекаемы. Ниже приведен точный сборник из пяти шаблонов, который мы применяем к каждой стартовой странице MVP, а также три реальных примера «до» и «после» из нашего портфолио.",
  "The five patterns": "Пять моделей",
  "1. One-sentence direct answer in the first 100 words":
    "1. Прямой ответ одним предложением в первых 100 словах.",
  "AI Overviews extract a single sentence and present it as the headline answer. If your page buries the answer under marketing copy, the model will pull from a competitor that didn't. Open every page with the literal sentence you'd like quoted.":
    "Обзоры AI извлекают одно предложение и представляют его в качестве ответа в заголовке. Если ваша страница скрывает ответ под маркетинговым текстом, модель будет отозвана у конкурента, который этого не сделал. Откройте каждую страницу с буквальным предложением, которое вы хотите процитировать.",
  "2. FAQPage JSON-LD with real shopper questions":
    "2. Страница часто задаваемых вопросов в формате JSON-LD с вопросами реальных покупателей.",
  "FAQPage schema is the single highest-leverage block of structured data for AIO citations. Use the actual questions your users ask in support, sales, and Reddit threads, not invented marketing questions. Three to six Q&As per page is the sweet spot.":
    "Схема FAQPage — это единый блок структурированных данных с самым высоким уровнем использования для цитирования AIO. Используйте реальные вопросы, которые ваши пользователи задают в обсуждениях поддержки, продаж и Reddit, а не придуманные маркетинговые вопросы. От трех до шести вопросов и ответов на странице — оптимальное решение.",
  "3. At least one comparison table": "3. Хотя бы одна сравнительная таблица",
  "AI Overviews lean heavily on comparative reasoning. A simple HTML table with rows for features and columns for alternatives gives the model an extractable grid it can summarize as 'X is better for Y because Z'. Even a 3x3 table outperforms a paragraph.":
    "Обзоры ИИ во многом опираются на сравнительные рассуждения. Простая таблица HTML со строками для функций и столбцами для альтернатив дает модели извлекаемую сетку, которую можно суммировать как «X лучше для Y, потому что Z». Даже таблица 3х3 эффективнее абзаца.",
  "4. Named entities (brand, product, category) in the first 100 words":
    "4. Названия объектов (бренд, продукт, категория) в первых 100 словах.",
  "Models disambiguate unknown brands by entity proximity. State your brand name, your product name, and the category it belongs to in the opening paragraph. 'Acme Notes is a privacy-first note-taking app' beats 'we believe writing should be private'.":
    "Модели устраняют неоднозначность неизвестных брендов по близости объектов. В первом абзаце укажите название своего бренда, название продукта и категорию, к которой он принадлежит. «Acme Notes — это приложение для создания заметок, ориентированное на конфиденциальность», а не «мы считаем, что написание должно быть конфиденциальным».",
  "5. Dated stats with a current-year reference":
    "5. Датированная статистика с привязкой к текущему году.",
  'Freshness is a tiebreaker. Include at least one statistic with a year attached ("as of 2026, 38% of..."). Pages with current-year context get re-crawled more often and are preferred by AIO over evergreen pages with no time signal.':
    "Свежесть решает тай-брейк. Включите хотя бы одну статистику с указанием года («по состоянию на 2026 год: 38% от...»). Страницы с контекстом текущего года сканируются повторно чаще, и AIO предпочитает их вечнозеленым страницам без сигнала времени.",
  "Three before/after examples": "Три примера до/после",
  "Example 1: A B2B scheduling MVP": "Пример 1: MVP по планированию B2B",
  'Before: a hero section with the tagline "meetings, reimagined" and no answer paragraph. After: opening line rewritten to "Acme Schedule is a calendar app for distributed engineering teams that need round-robin assignment without per-seat pricing." First AIO citation appeared 11 days after re-indexing on the query "calendar apps for engineering teams".':
    "До: главный раздел со слоганом «переосмысленные встречи» и без абзаца для ответов. После: первая строка переписана на «Acme Schedule — это приложение-календарь для распределенных инженерных групп, которым требуется циклическое назначение без оплаты за рабочее место». Первое упоминание AIO появилось через 11 дней после переиндексации по запросу «приложения-календари для инженерных команд».",
  "Example 2: A consumer fitness MVP": "Пример 2. MVP потребительского фитнеса",
  "Before: long-form testimonial-heavy landing page, no FAQ. After: added a six-question FAQPage block answering the literal questions from the brand's TikTok comments. Within two weeks the FAQ answers were quoted in AIOs for three different long-tail queries the brand wasn't targeting.":
    "До: целевая страница с длинными отзывами и отсутствием часто задаваемых вопросов. После: добавлен блок часто задаваемых вопросов из шести вопросов, отвечающий на вопросы из комментариев бренда в TikTok. В течение двух недель ответы на часто задаваемые вопросы цитировались в AIO по трем различным запросам с длинным хвостом, на которые бренд не ориентировался.",
  "Example 3: A developer tooling MVP":
    "Пример 3. MVP инструмента разработчика",
  'Before: "why we\'re better" prose section. After: replaced with a 4-row comparison table against the two named incumbents, plus a one-line summary above. AIOs began surfacing the brand for "X vs Y alternative" queries within nine days, sending qualified trial signups before any paid acquisition started.':
    'До: раздел прозы "почему мы лучше". После: заменено сравнительной таблицей из 4 строк с двумя названными действующими лицами, а также однострочным резюме выше. AIO начали предлагать бренд по запросам «альтернативы X против Y» в течение девяти дней, отправляя квалифицированные подписки на пробные версии еще до начала какого-либо платного привлечения.',
  "How to apply this to your MVP this week":
    "Как применить это к вашему MVP на этой неделе",
  "Rewrite the first 100 words of your highest-traffic page to lead with one direct-answer sentence that names your brand, product, and category.":
    "Перепишите первые 100 слов страницы с самым высоким трафиком, чтобы в начале было одно предложение с прямым ответом, в котором упоминается ваш бренд, продукт и категория.",
  "Ship a FAQPage JSON-LD block with three to six real questions taken from your support inbox or Reddit threads.":
    "Отправьте блок FAQPage JSON-LD с тремя-шестью реальными вопросами, взятыми из вашего почтового ящика поддержки или веток Reddit.",
  "Add at least one HTML comparison table. Even a 3x3 grid will do.":
    "Добавьте хотя бы одну таблицу сравнения HTML. Подойдет даже сетка 3х3.",
  "Audit every key page for at least one stat with a year attached. Refresh the year on January 1.":
    "Проверьте каждую ключевую страницу хотя бы на одну статистику с указанием года. Обновите год 1 января.",
  "Resubmit the page in Google Search Console and watch coverage in the Discover and AIO panels over the next two weeks.":
    "Повторно отправьте страницу в Google Search Console и следите за освещением на панелях Discover и AIO в течение следующих двух недель.",
  "Every MVP we ship at Start Apps Studio launches with all five patterns wired in from day one: direct answer, FAQPage schema, comparison table, named entities, dated stats. That's why our portfolio MVPs start collecting AI Overview citations before they've spent a dollar on paid acquisition.":
    "Каждый MVP, который мы выпускаем в Start Apps Studio, запускается со всеми пятью шаблонами, встроенными с первого дня: прямой ответ, схема страницы часто задаваемых вопросов, сравнительная таблица, именованные сущности, датированная статистика. Вот почему MVP нашего портфолио начинают собирать цитаты из Обзора ИИ еще до того, как потратят доллар на платное привлечение.",
  "Where we plug in": "Где мы подключаемся",
  "Frequently asked questions": "Часто задаваемые вопросы",
  "How fast can a brand-new MVP earn its first AI Overview citation?":
    "Как быстро новый MVP сможет получить свою первую награду в Обзоре AI?",
  "In our portfolio, between 9 and 21 days after the page is indexed and the five patterns are in place. The biggest variable is how quickly Google re-crawls the page. Submitting the URL in Search Console after the rewrite usually accelerates this to under two weeks.":
    "В нашем портфолио это происходит через 9–21 день после индексации страницы и появления пяти шаблонов. Самая большая переменная — это то, как быстро Google повторно сканирует страницу. Отправка URL-адреса в Search Console после перезаписи обычно ускоряет процесс до двух недель.",
  "Do I need a high domain rating to be cited in AI Overviews?":
    "Нужен ли мне высокий рейтинг домена, чтобы меня упоминали в обзорах AI?",
  "No. AIO citations are weighted toward extractability, not authority. Brand-new domains with strong on-page structure regularly out-cite older, higher-DR sites whose pages aren't optimized for extraction.":
    "Нет. Цитаты AIO ориентированы на извлекаемость, а не на авторитетность. Совершенно новые домены с четкой структурой страниц регулярно превосходят старые сайты с более высоким уровнем DR, страницы которых не оптимизированы для извлечения.",
  "Is FAQPage schema still safe to use in 2026?":
    "Безопасно ли использовать схему FAQPage в 2026 году?",
  "Yes for AI Overviews and ChatGPT extraction. Google removed rich-result eligibility for FAQPage on most sites in 2023, but the structured data is still consumed by AI surfaces and remains the single highest-leverage schema block for GEO.":
    "Да для обзоров AI и извлечения ChatGPT. В 2023 году Google отменил право на использование расширенных результатов на странице часто задаваемых вопросов на большинстве сайтов, но структурированные данные по-прежнему используются поверхностями искусственного интеллекта и остаются единственным блоком схемы с самым высоким уровнем использования для GEO.",
  "How many comparison tables should one page have?":
    "Сколько сравнительных таблиц должно быть на одной странице?",
  "One well-built table (3–6 rows, 2–4 columns) outperforms three weak ones. If you have multiple comparison angles, build them into separate dedicated comparison pages rather than stacking tables on one URL.":
    "Одна хорошо построенная таблица (3–6 строк, 2–4 столбца) превосходит по эффективности три слабые. Если у вас есть несколько точек сравнения, выделите их на отдельные страницы сравнения, а не размещайте таблицы на одном URL-адресе.",
  "Internal Start Apps Studio portfolio analysis: AI Overview citation timing across 14 MVP launches.":
    "Внутренний анализ портфолио Start Apps Studio: время цитирования обзора AI для 14 запусков MVP.",
  "Google Search Central: structured data guidelines for FAQPage and Article schema.":
    "Центр поиска Google: рекомендации по структурированию данных для схемы страниц часто задаваемых вопросов и статей.",
  "How to make your brand visible in ChatGPT and AI answers":
    "Как сделать свой бренд заметным в ChatGPT и ответах AI",
  "Brand Visible in ChatGPT & AI Overviews | Start Apps Studio":
    "Бренд виден в ChatGPT и обзоры AI | Запустить Студию приложений",
  "A 12-point GEO checklist covering answer-first writing, Q&A structure, schema, entity signals, social proof, fresh content and E-E-A-T, so ChatGPT, Perplexity and Google AI Overviews actually surface your brand.":
    "Контрольный список GEO из 12 пунктов, охватывающий написание ответов в первую очередь, структуру вопросов и ответов, схему, сигналы сущности, социальное доказательство, свежий контент и E-E-A-T, поэтому обзоры ChatGPT, Perplexity и Google AI фактически освещают ваш бренд.",
  "A 12-point GEO checklist so ChatGPT and AI Overviews surface your brand: answer-first writing, schema, entity signals, social proof, and E-E-A-T.":
    "Контрольный список GEO из 12 пунктов, позволяющий обзорам ChatGPT и AI раскрыть ваш бренд: написание ответов в первую очередь, схема, сигналы объектов, социальное доказательство и E-E-A-T.",
  "If ChatGPT never names your product when someone asks for a recommendation, your site is failing 12 specific tests. Here's the checklist we run on every MVP we ship.":
    "Если ChatGPT никогда не называет ваш продукт, когда кто-то просит рекомендации, ваш сайт не прошел 12 конкретных тестов. Вот контрольный список, который мы используем для каждого выпускаемого нами MVP.",
  "LLM SEO": "LLM SEO",
  Brand: "Бренд",
  "LLMs surface brands that lead with a direct answer, are structured as real Q&A, define their own entities clearly, expose structured data, and prove themselves with third-party social proof. If your site doesn't do those five things, ChatGPT won't mention you.":
    "LLM выявляет бренды, которые дают прямой ответ, структурированы как настоящие вопросы и ответы, четко определяют свою сущность, предоставляют структурированные данные и доказывают свою эффективность с помощью сторонних социальных доказательств. Если ваш сайт не выполняет эти пять вещей, ChatGPT не упомянет вас.",
  "Generative Engine Optimization (GEO) is the new SEO. Your MVP can rank on Google and still be invisible inside ChatGPT, Claude, Perplexity and Google's AI Overviews, because LLMs don't index pages the way crawlers do; they extract answers. Below is the 12-point audit we run on every MVP we ship at Start Apps Studio, based on the patterns we see across brands that actually get quoted by AI.":
    "Генеративная оптимизация (GEO) — это новый SEO. Ваш MVP может ранжироваться в Google и при этом оставаться невидимым в ChatGPT, Claude, Perplexity и обзорах искусственного интеллекта Google, поскольку LLM не индексирует страницы так, как это делают сканеры; они извлекают ответы. Ниже приведен аудит из 12 пунктов, который мы проводим для каждого MVP, который мы выпускаем в Start Apps Studio, на основе закономерностей, которые мы наблюдаем у брендов, которые на самом деле цитируются ИИ.",
  "Why this matters for MVPs": "Почему это важно для MVP",
  "Roughly a third of product discovery is already happening inside chat interfaces. For an MVP the stakes are higher than for an incumbent: you don't have the 10,000 third-party mentions Stripe or Notion have, so every signal you send has to be intentional. The good news is that GEO wins compound quickly. A single well-structured page can start getting quoted within days of indexing.":
    "Примерно треть знакомства с продуктом уже происходит внутри интерфейсов чата. Для MVP ставки выше, чем для действующего игрока: у вас нет 10 000 сторонних упоминаний, которые есть у Stripe или Notion, поэтому каждый посылаемый вами сигнал должен быть преднамеренным. Хорошей новостью является то, что GEO быстро выигрывает. Одна хорошо структурированная страница может начать цитироваться уже через несколько дней после индексации.",
  "The 12-point GEO checklist": "Контрольный список ГЕО из 12 пунктов",
  "1. Lead with a 1-sentence direct answer":
    "1. Начните с прямого ответа из 1 предложения.",
  "AI models favor front-loaded responses. Every page should open with a single sentence that answers the obvious question. Pages that bury the answer in marketing copy lose visibility to competitors who don't.":
    "Модели искусственного интеллекта предпочитают предварительные ответы. Каждая страница должна начинаться с одного предложения, отвечающего на очевидный вопрос. Страницы, которые скрывают ответ в маркетинговом тексте, теряют видимость для конкурентов, которые этого не делают.",
  "2. Use a real question-and-answer structure":
    "2. Используйте реальную структуру вопросов и ответов.",
  "Use real shopper questions as section headings on every page. Follow each with a short, factual answer, then expand the detail below. This mirrors the format LLMs are trained to extract.":
    "Используйте реальные вопросы покупателей в качестве заголовков разделов на каждой странице. После каждого из них дайте краткий, основанный на фактах ответ, а затем раскройте подробности ниже. Это отражает формат, который LLM обучены извлекать.",
  "3. Cover each product end-to-end":
    "3. Украсьте каждый продукт от начала до конца",
  "Thin product pages are invisible product pages. Cover the use case, ingredients or components, who it's for, and when to use it. LLMs reward completeness over keyword repetition.":
    "Тонкие страницы продукта — это невидимые страницы продукта. Опишите вариант использования, ингредиенты или компоненты, для кого это предназначено и когда его использовать. LLM вознаграждает полноту, а не повторение ключевых слов.",
  "4. Send clear entity signals": "4. Отправляйте четкие сигналы сущности",
  "Clearly state brand name, product name, category and use case on every page. That's how an AI knows what you sell and surfaces you to the right shopper. Weak entity signals are the #1 reason new MVPs are ignored.":
    "Четко укажите название бренда, название продукта, категорию и вариант использования на каждой странице. Таким образом ИИ узнает, что вы продаете, и направляет вас нужному покупателю. Слабые сигналы организаций — причина №1, по которой игнорируются новые MVP.",
  "5. Define your own terms, inline":
    "5. Определите свои собственные термины, встроенные",
  "Add product glossaries or inline schema to power entity extraction. LLMs quote clean definitions verbatim; undefined jargon gets skipped entirely.":
    "Добавьте глоссарии продуктов или встроенную схему для извлечения сущностей. Студенты LLM дословно цитируют ясные определения; неопределенный жаргон полностью пропускается.",
  "6. Publish structured product data":
    "6. Публикуйте структурированные данные о продуктах",
  "Use schema markup, bullet specs, comparison tables and short sections. Structured schemas help AI parse, extract and recommend your products accurately. Every MVP should ship with Product, FAQPage and Article JSON-LD wherever it applies.":
    "Используйте разметку схемы, спецификации маркеров, сравнительные таблицы и короткие разделы. Структурированные схемы помогают ИИ анализировать, извлекать и точно рекомендовать ваши продукты. Каждый MVP должен поставляться с продуктом, страницей часто задаваемых вопросов и статьей в формате JSON-LD, где бы это ни было применимо.",
  "7. Make social proof verifiable":
    "7. Сделайте социальное доказательство проверяемым",
  "Review counts, star ratings, third-party mentions and real user-generated content. LLMs prefer verifiable evidence over brand-generated claims. A handful of Reddit threads, Product Hunt reviews and press mentions outperform a page of testimonials.":
    "Количество обзоров, звездные рейтинги, упоминания третьих лиц и реальный пользовательский контент. LLM предпочитают поддающиеся проверке доказательства заявлениям, созданным брендом. Несколько тем на Reddit, обзоры Product Hunt и упоминания в прессе превосходят по эффективности страницу с отзывами.",
  "8. Keep content fresh and dated":
    "8. Сохраняйте контент свежим и устаревшим",
  'LLMs prioritize fresh, crawlable pages over static content. Update regularly, and add "last updated" dates, recent data and current-year context so your pages stay indexed and re-crawled.':
    "LLM отдают приоритет свежим, доступным для сканирования страницам, а не статическому контенту. Регулярно обновляйте и добавляйте даты «последнего обновления», последние данные и контекст текущего года, чтобы ваши страницы оставались в индексе и повторно сканировались.",
  "9. Build comparison pages": "9. Создайте страницы сравнения",
  'Create pages structured as "X vs Y", "Best for [use case]" and "When to choose us over alternatives". LLMs rely heavily on comparative reasoning to recommend products. A single comparison page can earn more LLM mentions than a whole product catalog.':
    "Создавайте страницы со структурой «X против Y», «Лучше всего для [варианта использования]» и «Когда выбирать нас среди альтернатив». LLM в значительной степени полагаются на сравнительные рассуждения, чтобы рекомендовать продукты. Одна страница сравнения может заработать больше упоминаний LLM, чем целый каталог продуктов.",
  "10. Link topics into clusters": "10. Связывайте темы в кластеры",
  "Avoid siloed pages. Link related topics to build topical authority clusters. LLMs favor well-linked sites; siloed pages break the context chain AI needs to recommend confidently.":
    "Избегайте разрозненных страниц. Свяжите связанные темы для создания тематических авторитетных кластеров. LLM отдают предпочтение сайтам с хорошими ссылками; Разрозненные страницы нарушают контекстную цепочку, которую ИИ должен уверенно рекомендовать.",
  "11. Swap jargon for E-E-A-T signals":
    "11. Замените жаргон на сигналы E-E-A-T.",
  "Add author credentials, cite real expertise, and include real-world examples. Google and AI both reward Experience, Expertise, Authority and Trust over hype.":
    "Добавьте учетные данные автора, укажите реальный опыт и приведите примеры из реальной жизни. И Google, и искусственный интеллект вознаграждают опыт, экспертность, авторитет и доверие, а не шумиху.",
  "12. Write unique descriptions": "12. Напишите уникальные описания",
  "Every page needs unique, structured product schema, not copy-pasted text. Duplicate content collapses topical authority and confuses AI indexing. If you have 20 near-identical SKU pages, LLMs will pick none of them.":
    "На каждой странице должна быть уникальная, структурированная схема продукта, а не скопированный текст. Дублированный контент снижает авторитет темы и затрудняет индексацию ИИ. Если у вас есть 20 почти идентичных страниц SKU, LLM не выберет ни одну из них.",
  "The brand identity layer underneath": "Слой фирменного стиля внизу",
  "GEO works only when your brand identity is well-defined. Before you audit a single page, you should be able to answer five questions in one sentence each: why this brand needs to exist, who it is not for, what success looks like, the competitive landscape, and the clarity (not a hunch) you're designing toward. That clarity becomes the source of truth every piece of copy and schema inherits from.":
    "GEO работает только тогда, когда идентичность вашего бренда четко определена. Прежде чем провести аудит одной страницы, вы должны быть в состоянии ответить на пять вопросов в одном предложении каждый: почему этот бренд должен существовать, для кого он не предназначен, как выглядит успех, конкурентная среда и ясность (а не догадка), к которой вы стремитесь. Эта ясность становится источником истины, от которой наследуется каждая часть текста и схемы.",
  "Every MVP we ship at Start Apps Studio launches with brand identity, on-page GEO, structured data and at least one comparison page wired in from day one. That's why our MVPs start getting AI citations before they've shipped their first marketing campaign.":
    "Каждый MVP, который мы выпускаем в Start Apps Studio, запускается с фирменным стилем, гео-географией на странице, структурированными данными и как минимум одной страницей сравнения, подключенной с первого дня. Вот почему наши MVP начинают получать отзывы об искусственном интеллекте еще до того, как запустили свою первую маркетинговую кампанию.",
  "What is GEO (Generative Engine Optimization)?":
    "Что такое GEO (генеративная оптимизация двигателя)?",
  "GEO is the practice of optimizing a site so large language models like ChatGPT, Claude and Perplexity surface and cite it when users ask product questions. It overlaps with SEO but prioritizes direct answers, entity clarity and structured data over keyword density.":
    "GEO — это практика оптимизации сайта, чтобы большие языковые модели, такие как ChatGPT, Claude и Perplexity, появлялись и цитировались, когда пользователи задают вопросы о продукте. Он частично совпадает с SEO, но отдает приоритет прямым ответам, ясности сущности и структурированным данным, а не плотности ключевых слов.",
  "How fast can a new MVP start getting cited by ChatGPT?":
    "Как быстро новый MVP начнет цитироваться ChatGPT?",
  "Typically within 2–6 weeks once the site is crawlable, has clear entity signals, structured data and a few third-party mentions. Pages that lead with a one-sentence answer and include FAQ schema tend to get picked up first.":
    "Обычно в течение 2–6 недель после того, как сайт становится доступным для сканирования, имеет четкие признаки сущности, структурированные данные и несколько упоминаний третьих лиц. Страницы, которые начинаются с ответа из одного предложения и содержат схему часто задаваемых вопросов, обычно выбираются в первую очередь.",
  "Is GEO different from SEO?": "Отличается ли GEO от SEO?",
  "They share foundations (crawlability, schema, authority) but diverge on format. SEO rewards keyword-targeted pages; GEO rewards answer-first structure, explicit definitions and comparative content that LLMs can extract in one shot.":
    "У них общие основы (возможность сканирования, схема, авторитетность), но они различаются по формату. SEO вознаграждает страницы, ориентированные на ключевые слова; GEO поощряет структуру ответов, четкие определения и сравнительный контент, которые студенты LLM могут извлечь за один раз.",
  "Do small MVPs really need schema markup?":
    "Действительно ли небольшим MVP нужна разметка схемы?",
  "Yes, more than big brands do. Schema is the cheapest way for a small site to punch above its weight in AI answers, because LLMs use structured data to disambiguate unknown brands.":
    "Да, больше, чем крупные бренды. Схема — это самый дешевый способ для небольшого сайта превзойти свой вес в ответах ИИ, поскольку LLM используют структурированные данные для устранения неоднозначности неизвестных брендов.",
  "'12 Reasons Your Brand Is Invisible in ChatGPT Responses' by Francesco Gatti (LinkedIn).":
    "«12 причин, по которым ваш бренд невидим в ответах ChatGPT», Франческо Гатти (LinkedIn).",
  "'The key to nailing every brand identity project' by Maik Noblovits (Instagram).":
    "«Ключ к реализации каждого проекта фирменного стиля», Майк Нобловиц (Instagram).",
  "Vibe-coded apps have an SEO problem. Here's how to fix it":
    "Приложения с кодом Vibe имеют проблемы с SEO. Вот как это исправить",
  "Vibe-Coded Apps & SEO: How to Fix It | Start Apps Studio":
    "Приложения с кодом Vibe и SEO: как это исправить | Запустить Студию приложений",
  "Lovable, Bolt and v0 ship empty divs to crawlers. This is how to fix it: a Cloudflare Worker SSR proxy pattern, or a full migration to Claude Code + Supabase + Vercel when you need to rank.":
    "Lovable, Bolt и v0 отправляют сканерам пустые элементы div. Вот как это исправить: шаблон прокси-сервера Cloudflare Worker SSR или полная миграция на Claude Code + Supabase + Vercel, когда вам нужно ранжироваться.",
  "Lovable, Bolt, and v0 ship empty divs to crawlers. Fix it with a Cloudflare Worker SSR proxy for a quick win, or migrate to a real stack when ranking matters.":
    "Lovable, Bolt и v0 отправляют сканерам пустые элементы div. Исправьте это с помощью SSR-прокси Cloudflare Worker для быстрого выигрыша или перейдите на реальный стек, когда рейтинг имеет значение.",
  "Lovable builds ship in hours and are invisible to Google in seconds. Two ways to fix it: a Cloudflare Worker proxy for a quick win, and a full migration pattern when you're serious about ranking.":
    "Lovable создается за считанные часы и становится невидимым для Google за считанные секунды. Два способа исправить это: прокси-сервер Cloudflare Worker для быстрого выигрыша и полная схема миграции, если вы серьезно относитесь к ранжированию.",
  "Field Notes": "Полевые примечания",
  "Vibe coding": "Кодирование Vibe",
  Lovable: "Милый",
  SEO: "SEO",
  SSR: "ССР",
  Claude: "Клод",
  "Vibe-coded apps render client-side, so crawlers see an empty <div>. You fix it either by putting a Cloudflare Worker between your domain and Lovable that returns server-rendered HTML to bots, or by migrating the project to a real stack (Claude Code + Supabase + Vercel) before you invest in marketing.":
    "Приложения с кодом Vibe визуализируются на стороне клиента, поэтому сканеры видят пустой <div>. Вы исправляете это, либо помещая Cloudflare Worker между вашим доменом и Lovable, который возвращает ботам HTML, обработанный сервером, либо перенося проект в реальный стек (Claude Code + Supabase + Vercel), прежде чем инвестировать в маркетинг.",
  'Tools like Lovable, Bolt and v0 are amazing for shipping an idea in an afternoon. They are not amazing at SEO. The whole page is a client-side React bundle, which means Googlebot on its first crawl sees an empty <div id="root" />. No content. No headings. No schema. No rankings. For an MVP that relies on organic traffic, that is a founding-year problem.':
    'Такие инструменты, как Lovable, Bolt и v0, отлично подходят для реализации идеи за полдня. Они не очень хороши в SEO. Вся страница представляет собой пакет React на стороне клиента, что означает, что робот Googlebot при первом сканировании видит пустой <div id="root" />. Никакого содержания. Никаких заголовков. Никакой схемы. Никаких рейтингов. Для MVP, который полагается на органический трафик, это проблема года основания.',
  "Here are the two fixes we use at Start Apps Studio, ordered from smallest effort to largest payoff.":
    "Вот два исправления, которые мы используем в Start Apps Studio, в порядке убывания от наименьших усилий до наибольшей отдачи.",
  "Fix 1: Cloudflare Worker SSR proxy":
    "Исправление 1: SSR-прокси Cloudflare Worker",
  "A Cloudflare Worker sits between your domain and Lovable. When a request comes in, the Worker checks the User-Agent: real visitors are proxied through to Lovable as usual; bots (Googlebot, Bingbot, GPTBot, PerplexityBot, ClaudeBot) get server-rendered HTML with real content and full schema markup, from the same URL.":
    "Cloudflare Worker находится между вашим доменом и Lovable. Когда поступает запрос, Worker проверяет User-Agent: реальные посетители перенаправляются в Lovable, как обычно; Боты (Googlebot, Bingbot, GPTBot, PerplexityBot, ClaudeBot) получают обработанный сервером HTML с реальным контентом и полной разметкой схемы с одного и того же URL-адреса.",
  "This is not cloaking when it's done correctly. The content the bot receives has to match what the user eventually sees once the JS executes. The setup is two steps:":
    "Это не клоакинг, если все сделано правильно. Содержимое, которое получает бот, должно соответствовать тому, что пользователь в конечном итоге увидит после выполнения JS. Настройка состоит из двух шагов:",
  "Add one CNAME to your DNS pointing your custom domain at the Cloudflare Worker.":
    "Добавьте один CNAME в свой DNS, указав свой личный домен на Cloudflare Worker.",
  "Paste one prompt inside Lovable so the worker has a canonical page inventory to server-render from.":
    "Вставьте одно приглашение в Lovable, чтобы у работника была инвентаризация канонических страниц для рендеринга на сервере.",
  "If you are not ready to migrate off Lovable, and you need pages indexed this week, the Cloudflare Worker is the right call. It's the only fix that keeps Lovable's visual editing flow intact.":
    "Если вы не готовы перейти с Lovable и вам нужны страницы, проиндексированные на этой неделе, Cloudflare Worker — то, что вам нужно. Это единственное исправление, которое сохраняет процесс визуального редактирования Lovable нетронутым.",
  "When to use the Worker approach": "Когда использовать рабочий подход",
  "Fix 2: Migrate off Lovable with Claude Code":
    "Исправление 2: миграция с Lovable с помощью Claude Code",
  "The Worker buys you time. But if the app has to rank seriously, handle dynamic content, or be maintained by humans a year from now, you'll want to move to a \"normal\" web stack. The fastest way we've seen is to let Claude Code do the migration for you.":
    "Рабочий покупает вам время. Но если через год приложению необходимо серьезно ранжироваться, обрабатывать динамический контент или поддерживаться людьми, вам захочется перейти на «нормальный» веб-стек. Самый быстрый способ, который мы видели, — позволить Claude Code выполнить миграцию за вас.",
  "The 10-step migration recipe": "Рецепт миграции из 10 шагов",
  "Push your Lovable project to GitHub so Claude can work with it easily.":
    "Разместите свой проект Lovable на GitHub, чтобы Клод мог легко с ним работать.",
  "Install Claude Code locally so it can read and edit your repo directly.":
    "Установите Claude Code локально, чтобы он мог напрямую читать и редактировать ваш репозиторий.",
  "Point Claude at your repo (GitHub remote or local path).":
    "Укажите Клоду ваш репозиторий (удаленный или локальный путь GitHub).",
  "Create a Supabase project for database and auth (roughly five minutes).":
    "Создайте проект Supabase для базы данных и аутентификации (примерно пять минут).",
  'Ask Claude to migrate the project away from Lovable with this prompt: "Migrate this Lovable project into a normal web stack and organize the repo cleanly."':
    "Попросите Клода перенести проект из Lovable, используя следующую подсказку: «Перенесите этот проект Lovable в обычный веб-стек и аккуратно организуйте репозиторий».",
  "Set up hosting on Vercel. The free tier covers most MVPs.":
    "Настройте хостинг на Верселе. Уровень бесплатного пользования распространяется на большинство MVP.",
  "Ask Claude which environment variables and API keys are required; it's surprisingly good at identifying them.":
    "Спросите Клода, какие переменные среды и ключи API необходимы; он на удивление хорошо их распознает.",
  "Generate the keys and create a .env file (Supabase keys, API tokens, etc).":
    "Сгенерируйте ключи и создайте файл .env (ключи Supabase, токены API и т. д.).",
  "Ask Claude to configure deployment. It can wire the GitHub → Vercel flow and connect Supabase.":
    "Попросите Клода настроить развертывание. Он может связать поток GitHub → Vercel и подключить Supabase.",
  "Fix anything that breaks by asking Claude to debug, one error at a time.":
    "Исправьте все, что сломалось, попросив Клода отладить одну ошибку за раз.",
  "This setup ends up more flexible than Lovable itself. You stop paying per-prompt credits for app changes, and you can fall back to free models for small edits, since Lovable is already using Claude under the hood for most of its generation.":
    "Эта установка оказывается более гибкой, чем сам Lovable. Вы перестаете платить кредиты за каждое изменение приложения и можете вернуться к бесплатным моделям для небольших изменений, поскольку Lovable уже использует Claude под капотом на протяжении большей части своего поколения.",
  "The Lovable + Claude hybrid": "Гибрид Lovable + Claude",
  "If you're mid-project and not ready to migrate, there's a middle path that multiple r/lovable users have validated: connect Lovable to GitHub, then give Claude Code access to the same repo. Claude sits on a layer above Lovable, guiding it through complex features, debugging, and enhancements, while you run SQL directly in Supabase for database changes (Lovable doesn't charge to run a query, so it's free).":
    "Если вы находитесь в середине проекта и не готовы к миграции, есть средний путь, проверенный несколькими пользователями r/lovable: подключите Lovable к GitHub, а затем предоставьте Claude Code доступ к тому же репозиторию. Клод находится на уровне выше Lovable, проводя его через сложные функции, отладку и улучшения, в то время как вы запускаете SQL непосредственно в Supabase для внесения изменений в базу данных (Lovable не взимает плату за выполнение запроса, поэтому это бесплатно).",
  "Results: fewer burned credits on blocking components (users report 100+ credits saved on a single component), better handling of tangled logic, and, critically for this article, enough control over the output HTML that you can retrofit SSR and schema incrementally.":
    "Результаты: меньше потраченных кредитов на блокирующие компоненты (пользователи сообщают, что на одном компоненте сэкономлено более 100 кредитов), лучшая обработка запутанной логики и, что критически важно для этой статьи, достаточный контроль над выходным HTML, позволяющий постепенно модифицировать SSR и схему.",
  "Which fix should you pick?": "Какое исправление выбрать?",
  "Marketing site or landing page only → Cloudflare Worker SSR. Cheapest, fastest.":
    "Только маркетинговый сайт или целевая страница → Cloudflare Worker SSR. Самый дешевый, быстрый.",
  "Product with dynamic content that needs to rank → migrate to Claude Code + Supabase + Vercel.":
    "Продукт с динамическим контентом, которому необходимо ранжироваться → перейти на Claude Code + Supabase + Vercel.",
  "Mid-project and can't rebuild → Lovable + Claude hybrid, then retrofit SSR on the pages that matter.":
    "В середине проекта и не могу перестроить → гибрид Lovable + Claude, а затем модифицировать SSR на важных страницах.",
  "Start Apps Studio has migrated a handful of Lovable MVPs off the platform using exactly this recipe. If you'd rather not burn a week on the plumbing, we can take it from prompt to indexed production, usually in under two weeks.":
    "Студия Start Apps перенесла с платформы несколько Lovable MVP, используя именно этот рецепт. Если вы не хотите тратить неделю на сантехнику, мы можем перейти от оперативного производства к индексированному, обычно менее чем за две недели.",
  "Why can't Google index Lovable pages directly?":
    "Почему Google не может напрямую индексировать страницы Lovable?",
  "Lovable ships a client-rendered React bundle, so the initial HTML is an empty root div. Googlebot's first-pass crawl captures that empty HTML; it may (or may not) come back later to render JavaScript. For new domains with no authority, that second-pass render is often never triggered.":
    "Lovable поставляет пакет React, отображаемый клиентом, поэтому исходный HTML-код представляет собой пустой корневой элемент div. При первом проходе сканирования роботом Googlebot этот пустой HTML-код фиксируется; он может (или не может) вернуться позже для рендеринга JavaScript. Для новых доменов без полномочий второй этап рендеринга часто никогда не запускается.",
  "Is the Cloudflare Worker fix considered cloaking?":
    "Считается ли исправление Cloudflare Worker маскировкой?",
  "Not if the bot sees the same content a user eventually sees once JS executes. Serving pre-rendered HTML to bots is an established SEO pattern; it only becomes cloaking if you serve different content to bots than to users.":
    "Нет, если бот видит тот же контент, который в конечном итоге увидит пользователь после выполнения JS. Предоставление предварительно обработанного HTML-кода ботам является устоявшимся шаблоном SEO; это становится клоакингом только в том случае, если вы предоставляете ботам другой контент, чем пользователям.",
  "How much does the full migration cost?": "Сколько стоит полная миграция?",
  "DIY: a weekend and a Vercel + Supabase free-tier account. Delivered by Start Apps Studio: typically around one sprint, bundled into our MVP Production package.":
    "Сделай сам: выходные и учетная запись уровня бесплатного пользования Vercel + Supabase. Поставляется Start Apps Studio: обычно в течение одного спринта, входит в наш производственный пакет MVP.",
  "Can I keep editing visually after migrating?":
    "Могу ли я продолжить визуальное редактирование после миграции?",
  "You lose Lovable's in-browser editor, but gain a normal dev loop and can bring any visual tool (or another AI builder) on top of the repo. Most teams don't miss it once they see how much faster Claude Code iterates.":
    "Вы теряете браузерный редактор Lovable, но получаете обычный цикл разработки и можете добавить любой визуальный инструмент (или другой конструктор ИИ) поверх репозитория. Большинство команд не упускают этого из виду, когда видят, насколько быстрее выполняется итерация Claude Code.",
  "r/lovable showcase: 'I solved Lovable's biggest SEO problem' (Cloudflare Worker pattern).":
    "r/lovable showcase: «Я решил самую большую SEO-проблему Lovable» (шаблон Cloudflare Worker).",
  "r/lovable tutorial: 'Lovable <> Claude = 10X performance' by u/EIAMM.":
    "Учебное пособие по r/lovable: «Lovable <> Claude = 10-кратное увеличение производительности» от u/EIAMM.",
  "r/lovable: 10-step migration to Claude Code + Supabase + Vercel.":
    "r/lovable: 10-шаговый переход на Claude Code + Supabase + Vercel.",
  "AI at work in 2026: what the exposure data means for founders":
    "Искусственный интеллект в действии в 2026 году: что данные о риске означают для основателей",
  "AI at Work 2026: What It Means for Founders | Start Apps Studio":
    "ИИ на работе 2026: что это значит для основателей | Запустить Студию приложений",
  "74.5% of programmers are AI-exposed, observed usage trails theoretical capability, and HubSpot's 2026 marketing report is about lead generation, not content. What that means if you're building an MVP in 2026.":
    "74,5% программистов подвержены воздействию ИИ, наблюдаемое использование отстает от теоретических возможностей, а маркетинговый отчет HubSpot за 2026 год посвящен привлечению потенциальных клиентов, а не контенту. Что это значит, если вы создаете MVP в 2026 году?",
  "74.5% of programmers are AI-exposed yet real usage lags capability. What the 2026 AI data means for founders building and marketing MVPs right now.":
    "74,5% программистов подвержены воздействию ИИ, но возможности его реального использования отстают. Что данные ИИ за 2026 год значат для основателей, создающих и продвигающих MVP прямо сейчас.",
  "The gap between what AI can do and what workers actually use it for is now the biggest arbitrage of the decade. Here's how to read the 2026 data as a founder.":
    "Разрыв между тем, что может сделать ИИ, и тем, для чего работники на самом деле его используют, сейчас является крупнейшим арбитражем десятилетия. Вот как читать данные за 2026 год в качестве основателя.",
  Research: "Исследовать",
  "AI at work": "ИИ за работой",
  "State of marketing 2026": "Состояние маркетинга 2026 г.",
  Founders: "Основатели",
  "In 2026, AI exposure is highest for white-collar knowledge work (programmers 74.5%, customer service 70.1%, data entry 67.1%), but observed usage still trails theoretical capability in almost every sector. HubSpot's 2026 marketing report confirms the shift: marketers are being measured on revenue and leads, not content output. The founders who win are the ones who turn that gap into leverage.":
    "В 2026 году уровень воздействия ИИ будет самым высоким среди служащих (74,5% программистов, служба поддержки клиентов 70,1%, ввод данных 67,1%), но наблюдаемое использование по-прежнему отстает от теоретических возможностей почти во всех секторах. Маркетинговый отчет HubSpot за 2026 год подтверждает этот сдвиг: маркетологов оценивают по доходам и лидам, а не по объему контента. Побеждают основатели, которые превращают этот разрыв в рычаг.",
  "Three pieces of research landed in the last quarter that should reshape how you think about building an MVP in 2026. Read together, they tell a clear story: AI capability is sprinting ahead of AI adoption, and the founders who close that gap for their customers are the ones getting paid.":
    "В последнем квартале были опубликованы три исследования, которые должны изменить ваше представление о создании MVP в 2026 году. Если прочитать их вместе, они расскажут ясную историю: возможности ИИ опережают внедрение ИИ, и основатели, которые устраняют этот разрыв для своих клиентов, получают зарплату.",
  "1. Exposure is now a job-level fact":
    "1. Разоблачение теперь стало фактом на уровне работы",
  "The headline numbers": "Цифры в заголовке",
  "Computer programmers: 74.5% exposure. The leading automated tasks are writing, updating and maintaining software programs.":
    "Программисты: 74,5% воздействия. Ведущими автоматизированными задачами являются написание, обновление и поддержка программного обеспечения.",
  "Customer service reps: 70.1% exposure. AI is taking over information delivery, order intake and complaint handling.":
    "Представители службы поддержки клиентов: воздействие 70,1%. ИИ берет на себя доставку информации, прием заказов и обработку жалоб.",
  "Data entry keyers: 67.1% exposure. Automation focuses on reading source documents and entering data into digital systems.":
    "Ключники ввода данных: раскрытие 67,1%. Автоматизация фокусируется на чтении исходных документов и вводе данных в цифровые системы.",
  "Who is most exposed": "Кто наиболее подвержен",
  "Workers with a bachelor's degree are 23.8 percentage points more likely to be in the top AI-exposure quartile (37.1% vs 13.3%).":
    "Работники со степенью бакалавра на 23,8 процентных пункта чаще попадают в верхний квартиль воздействия ИИ (37,1% против 13,3%).",
  "The average hourly wage in high-exposure roles is $32.69, versus $22.23 in no-exposure roles, a $10.45 wage premium.":
    "Средняя почасовая оплата на высокоактивных должностях составляет 32,69 доллара по сравнению с 22,23 доллара на непубличных должностях, что составляет надбавку к заработной плате в 10,45 доллара.",
  "Female workers are 15.5 percentage points more represented in high-exposure roles than in no-exposure roles.":
    "Работники-женщины на 15,5 процентных пункта больше представлены на должностях с высокой степенью воздействия, чем на должностях, которые не подвергаются воздействию.",
  "Translation for founders: the most expensive hours in your organization are also the most automatable. Your MVP's best wedge is almost always an internal productivity one, not a brand-new consumer category.":
    "Перевод для основателей: самые дорогие часы в вашей организации также и наиболее автоматизированы. Лучшим преимуществом вашего MVP почти всегда является внутренняя продуктивность, а не совершенно новая потребительская категория.",
  "2. Theoretical capability ≫ observed usage":
    "2. Теоретическая возможность ≫ наблюдаемое использование",
  'Across every occupational category we looked at (management, business and finance, computer and math, architecture and engineering, legal, arts and media), observed AI usage is a fraction of theoretical capability. Even in office and admin work, where exposure is highest, the red-shaded "observed" footprint sits at roughly a third of the blue "theoretical" one.':
    "Во всех рассмотренных нами профессиональных категориях (менеджмент, бизнес и финансы, компьютеры и математика, архитектура и инженерия, юриспруденция, искусство и средства массовой информации) наблюдаемое использование ИИ составляет лишь часть теоретических возможностей. Даже в офисной и административной работе, где уровень воздействия самый высокий, «наблюдаемый» след, заштрихованный красным, составляет примерно треть синего «теоретического».",
  'That gap is the arbitrage. Enterprise users are not short on access to LLMs; they are short on workflows that turn access into outcomes. Every startup that closes one such workflow ("draft the contract", "reconcile the invoice", "write the follow-up") is pricing on the gap.':
    "Этот разрыв и есть арбитраж. Корпоративные пользователи не испытывают недостатка в доступе к LLM; им не хватает рабочих процессов, которые превращают доступ в результаты. Каждый стартап, который закрывает один из таких рабочих процессов («составить договор», «согласовать счет», «написать отчет»), рассчитывает цену на разрыв.",
  "3. HubSpot's 2026 marketing report reframes the funnel":
    "3. Маркетинговый отчет HubSpot за 2026 год меняет структуру воронки",
  "Top marketing goals in 2026": "Главные маркетинговые цели в 2026 году",
  "Increasing revenue and sales.": "Увеличение доходов и продаж.",
  "Driving traffic to your website.": "Привлечение трафика на ваш сайт.",
  "Increasing engagement.": "Увеличение вовлеченности.",
  "Improving the customer experience.":
    "Улучшение качества обслуживания клиентов.",
  "Closing more deals.": "Закрытие большего количества сделок.",
  "Top marketing challenges in 2026":
    "Главные маркетинговые задачи в 2026 году",
  "Generating traffic.": "Генерация трафика.",
  "Generating leads.": "Генерация лидов.",
  "Hiring top talent.": "Найм лучших талантов.",
  "Driving purchases.": "Сопровождение покупок.",
  "Securing the budget you need.": "Обеспечение необходимого бюджета.",
  'The shift from 2025 is subtle but real. "Producing content" has dropped out of the top goals entirely; marketers are being measured on revenue and lead velocity. In a world where AI content is effectively free, the scarce resource is distribution: traffic, leads and trust.':
    "Переход от 2025 года незаметен, но реален. «Производство контента» полностью выпало из числа главных целей; маркетологов оценивают по доходам и скорости привлечения потенциальных клиентов. В мире, где контент ИИ фактически бесплатен, дефицитным ресурсом является его распространение: трафик, лиды и доверие.",
  "What this means if you're shipping an MVP":
    "Что это значит, если вы выпускаете MVP",
  "Price on the capability gap. If you can ship a workflow that converts a 'theoretical' AI capability into a reliable 'observed' outcome for a specific role, you have a business.":
    "Цена на разрыв в возможностях. Если вы можете реализовать рабочий процесс, который преобразует «теоретические» возможности ИИ в надежный «наблюдаемый» результат для конкретной роли, у вас есть бизнес.",
  "Target the high-exposure, high-wage seats first. Programmers, customer service leads, finance and legal analysts. They have both the budget and the pain.":
    "В первую очередь ориентируйтесь на наиболее востребованные и высокооплачиваемые места. Программисты, руководители службы поддержки клиентов, финансовые и юридические аналитики. У них есть и бюджет, и боль.",
  "Assume AI content is free. Don't compete on output. Compete on distribution: SEO, GEO, partnerships and owned audience.":
    "Предположим, контент ИИ бесплатен. Не конкурируйте по объему производства. Конкурируйте в распространении: SEO, GEO, партнерство и собственная аудитория.",
  "Measure on revenue, not reach. HubSpot's 2026 data says every B2B buyer is doing the same. Tie every marketing dollar to a pipeline number or cut it.":
    "Измеряйте доходы, а не охват. Данные HubSpot за 2026 год показывают, что каждый покупатель B2B делает то же самое. Привяжите каждый маркетинговый доллар к номеру конвейера или сократите его.",
  "Every MVP we ship at Start Apps Studio is built around a single measurable outcome: revenue, leads, or time saved. We don't ship pretty demos. If you've got a capability-gap idea, we can get you from signal to shipped in weeks, not quarters.":
    "Каждый MVP, который мы выпускаем в Start Apps Studio, построен вокруг одного измеримого результата: дохода, потенциальных клиентов или экономии времени. Мы не выпускаем красивые демо-версии. Если у вас есть идея о нехватке возможностей, мы можем помочь вам от сигнала до отправки за несколько недель, а не кварталов.",
  "Which occupations have the highest AI exposure in 2026?":
    "Какие профессии будут наиболее подвержены воздействию ИИ в 2026 году?",
  "Computer programmers (74.5%), customer service representatives (70.1%) and data entry keyers (67.1%) top the exposure charts. All three are knowledge-work roles with high automation potential.":
    "Компьютерные программисты (74,5%), представители службы поддержки клиентов (70,1%) и специалисты по вводу данных (67,1%) возглавляют рейтинги подверженности. Все три должности связаны с умственной работой и имеют высокий потенциал автоматизации.",
  "Why is observed AI usage lower than theoretical capability?":
    "Почему наблюдаемое использование ИИ ниже теоретических возможностей?",
  "Because adoption lags capability. LLMs are accessible; reliable, integrated workflows that translate capability into outcomes inside specific roles are not. That gap is the single biggest opportunity for 2026 MVPs.":
    "Потому что принятие отстает от возможностей. LLM доступны; надежные, интегрированные рабочие процессы, которые преобразуют возможности в результаты внутри конкретных ролей, таковыми не являются. Этот разрыв — самая большая возможность для MVP 2026 года.",
  "What are HubSpot's top marketing goals for 2026?":
    "Каковы главные маркетинговые цели HubSpot на 2026 год?",
  "Increasing revenue and sales, driving traffic, increasing engagement, improving the customer experience, and closing more deals. Notably, 'producing content' is no longer a top-tier goal.":
    "Увеличение доходов и продаж, привлечение трафика, повышение вовлеченности, улучшение качества обслуживания клиентов и заключение большего количества сделок. Примечательно, что «производство контента» больше не является целью высшего уровня.",
  "What should an early-stage founder prioritize in 2026?":
    "Что должен сделать основатель ранней стадии развития в 2026 году?",
  "Revenue-tied distribution over content volume, plus a tight wedge into a high-exposure, high-wage role. Shipping a pretty demo is no longer a differentiator; shipping a workflow that replaces or augments an expensive hour is.":
    "Распределение, привязанное к доходам, по объему контента, а также жесткое вклинивание в высокооплачиваемую и высокооплачиваемую должность. Доставка красивой демо-версии больше не является отличительной чертой; доставка рабочего процесса, который заменяет или дополняет дорогостоящий час.",
  "'AI at Work: Mapping the Landscape of Occupational Exposure' (research summary infographic).":
    "«ИИ на работе: картирование ландшафта профессионального воздействия» (инфографика с резюме исследования).",
  "'Theoretical capability and observed usage by occupational category' (occupational radar chart).":
    "«Теоретические возможности и наблюдаемое использование по профессиональным категориям» (диаграмма профессионального радара).",
  "HubSpot State of Marketing 2026, in-app dashboard.":
    "HubSpot State of Marketing 2026, панель мониторинга в приложении.",
  "Backlinks still decide who gets recommended in 2026":
    "Обратные ссылки по-прежнему решают, кого рекомендовать в 2026 году.",
  "Backlinks Decide Who Gets Recommended in 2026 | Start Apps Studio":
    "Обратные ссылки решают, кого будут рекомендовать в 2026 году | Запустить Студию приложений",
  "Why backlinks remain the single biggest off-page signal for both Google and AI answer engines, what a healthy MVP backlink profile actually looks like, and the four-step outreach loop we run for every Start Apps Studio launch.":
    "Почему обратные ссылки остаются самым важным сигналом за пределами страницы как для Google, так и для систем ответов AI, как на самом деле выглядит здоровый профиль обратных ссылок MVP, и четырехэтапный цикл распространения информации, который мы запускаем при каждом запуске Start Apps Studio.",
  "Backlinks remain the top off-page signal for Google and AI answer engines. Learn what a healthy MVP backlink profile looks like and our four-step outreach loop.":
    "Обратные ссылки остаются основным сигналом вне страницы для систем ответов Google и AI. Узнайте, как выглядит здоровый профиль обратных ссылок MVP, и наш четырехэтапный цикл распространения информации.",
  "Schema and answer-first writing get you eligible to be cited. Backlinks are what tip a brand-new MVP from eligible to actually recommended.":
    "Схема и написание ответа в первую очередь дают вам право на цитирование. Обратные ссылки — это то, что помогает новому MVP перейти от подходящего к действительно рекомендованному.",
  Backlinks: "Обратные ссылки",
  "Off-page": "Вне страницы",
  "Backlinks are still the strongest off-page signal a new MVP can earn. Google uses them to rank, and large language models use the same link graph to decide which brands are trustworthy enough to name in an answer. A small, clean profile of 15 to 30 relevant links beats a large profile of generic ones, every time.":
    "Обратные ссылки по-прежнему являются самым сильным внешним сигналом, который может получить новый MVP. Google использует их для ранжирования, а крупные языковые модели используют один и тот же граф ссылок, чтобы решить, какие бренды достаточно надежны, чтобы их назвать в ответе. Небольшой, чистый профиль, содержащий от 15 до 30 релевантных ссылок, всегда превосходит большой профиль общих ссылок.",
  "Founders ask us all the time whether backlinks still matter in a world where ChatGPT, Perplexity and Google AI Overviews answer most product questions directly. The short answer is yes, more than ever. Both classical search and the new AI answer layer lean on the open web link graph to decide who is credible. Without inbound links, an MVP can have perfect on-page SEO and still never be named.":
    "Основатели постоянно спрашивают нас, имеют ли обратные ссылки значение в мире, где обзоры ChatGPT, Perplexity и Google AI напрямую отвечают на большинство вопросов о продуктах. Короткий ответ: да, больше, чем когда-либо. И классический поиск, и новый уровень ответов AI опираются на граф открытых веб-ссылок, чтобы решить, кому можно доверять. Без входящих ссылок MVP может иметь идеальное SEO на странице и при этом никогда не быть названным.",
  "Why backlinks still move the needle":
    "Почему обратные ссылки все еще меняют ситуацию",
  "A backlink is a public vote from one site to another. Search engines treat each one as a tiny endorsement, and AI models trained on the open web inherit those endorsements. When a model has to pick between two brands it has never heard of, the one with more high-quality inbound links wins almost every time. For an MVP this is the single fastest way to earn the trust larger competitors already have.":
    "Обратная ссылка — это публичное голосование с одного сайта на другой. Поисковые системы рассматривают каждое из них как крошечную поддержку, а модели ИИ, обученные в открытой сети, наследуют эту поддержку. Когда модели приходится выбирать между двумя брендами, о которых она никогда не слышала, почти всегда побеждает тот, у которого больше качественных входящих ссылок. Для MVP это самый быстрый способ заслужить доверие более крупных конкурентов.",
  "What a healthy MVP backlink profile looks like":
    "Как выглядит здоровый ссылочный профиль MVP",
  "15 to 30 inbound links from sites in or adjacent to your niche, not generic directories":
    "От 15 до 30 входящих ссылок с сайтов в вашей нише или рядом с ней, а не с общих каталогов.",
  "A mix of editorial mentions, guest posts, podcasts, partner pages and resource lists":
    "Сочетание редакционных упоминаний, гостевых постов, подкастов, партнерских страниц и списков ресурсов.",
  "Anchor text that uses your brand name far more often than exact-match keywords":
    "Анкорный текст, в котором название вашего бренда используется гораздо чаще, чем в ключевых словах с точным соответствием.",
  "At least one link from a recognised industry publication or a respected community hub":
    "По крайней мере одна ссылка из признанного отраслевого издания или уважаемого центра сообщества.",
  "A natural growth curve, never 200 links in a single week from sites that have nothing in common":
    "Естественная кривая роста, никогда не 200 ссылок за неделю с сайтов, которые не имеют ничего общего.",
  "The four-step outreach loop":
    "Четырехэтапный цикл информационно-пропагандистской деятельности",
  "1. Map the competitor link graph":
    "1. Составьте карту графа ссылок конкурентов.",
  "Pull the inbound links of three direct competitors and three adjacent leaders. The overlap is your shortlist: sites that already link to brands like yours and are statistically the most likely to link to you too.":
    "Подтяните входящие ссылки трех прямых конкурентов и трех соседних лидеров. Перекрытие — это ваш короткий список: сайты, которые уже ссылаются на такие бренды, как ваш, и по статистике с наибольшей вероятностью ссылаются и на вас.",
  "2. Build a link-worthy asset": "2. Создайте актив, достойный ссылок",
  "Outreach without an asset is begging. Ship one piece of original content per quarter that another editor would actually want to cite, such as a benchmark, a survey, a comparison table, or a free tool. Every email after that has something concrete to point to.":
    "Пропагандистская деятельность без актива требует попрошайничества. Ежеквартально отправляйте один фрагмент оригинального контента, который другой редактор действительно захочет процитировать, например, эталон, опрос, сравнительную таблицу или бесплатный инструмент. В каждом электронном письме после этого есть что-то конкретное, на что можно указать.",
  "3. Run small, personal outreach": "3. Проведите небольшую личную работу",
  "Twenty-five tailored emails a week beat a thousand templated ones. Reference a specific piece the editor wrote, explain in one line why your asset deepens it, and make the link easy to add. Reply rates above 10 percent are realistic when the asset is good.":
    "Двадцать пять индивидуальных писем в неделю превосходят тысячу шаблонных. Сделайте ссылку на конкретную статью, написанную редактором, объясните в одной строке, почему ваш ресурс углубляет ее, и упростите добавление ссылки. Доля ответов выше 10 процентов вполне реальна, если актив хороший.",
  "4. Recycle wins into new wins": "4. Превращайте победы в новые победы",
  "Every time you land a link, screenshot it and add it to a public press page. New editors are far more likely to link to a brand that other editors already linked to. Social proof compounds and shortens the next outreach cycle.":
    "Каждый раз, когда вы размещаете ссылку, делайте скриншот и добавляйте ее на общедоступную страницу для прессы. Новые редакторы с гораздо большей вероятностью будут ссылаться на бренд, на который уже ссылались другие редакторы. Социальное доказательство усугубляет и сокращает следующий цикл информационно-пропагандистской работы.",
  "Inside the Start Apps Studio app, the Grow tab now includes a Backlink Strategy and Outreach service. We map your competitor link graph, ship a quarterly link-worthy asset, and run the personal outreach loop on your behalf so backlinks become a steady drumbeat rather than a one-off scramble.":
    "В приложении Start Apps Studio вкладка «Расширение» теперь включает службу «Стратегия обратных ссылок и информационно-пропагандистская деятельность». Мы составляем график ссылок вашего конкурента, ежеквартально отправляем актив, достойный ссылок, и запускаем цикл персональной работы от вашего имени, чтобы обратные ссылки стали постоянным барабанным боем, а не разовой схваткой.",
  "Do backlinks still matter for SEO in 2026?":
    "Будут ли обратные ссылки иметь значение для SEO в 2026 году?",
  "Yes. Backlinks remain the strongest off-page ranking signal for Google and one of the most important trust signals for AI answer engines that draw on the open web. Sites with no inbound links are systematically under-recommended.":
    "Да. Обратные ссылки остаются самым сильным сигналом ранжирования за пределами страницы для Google и одним из наиболее важных сигналов доверия для систем ответов AI, которые используют открытую сеть. Сайты без входящих ссылок систематически не рекомендуются.",
  "How many backlinks does a new MVP actually need?":
    "Сколько обратных ссылок на самом деле нужно новому MVP?",
  "For most niches, 15 to 30 links from relevant, real sites are enough to start moving rankings and AI mentions. Quality and topical relevance matter far more than raw count.":
    "Для большинства ниш от 15 до 30 ссылок с релевантных реальных сайтов достаточно, чтобы начать повышать рейтинг и упоминать ИИ. Качество и тематическая актуальность имеют гораздо большее значение, чем простое количество.",
  "Are paid links worth it?": "Платные ссылки стоят того?",
  "Almost never for an MVP. Paid link networks are easy for Google to detect and can trigger ranking penalties. Earned links from outreach, partnerships and original content are slower but durable.":
    "Почти никогда для MVP. Сети платных ссылок легко обнаружить Google и могут вызвать штрафы за ранжирование. Ссылки, полученные в результате информационно-просветительской деятельности, партнерства и оригинального контента, работают медленнее, но долговечны.",
  "How long until new backlinks affect rankings?":
    "Как долго новые обратные ссылки повлияют на рейтинг?",
  "Two to eight weeks for Google, sometimes faster for AI answer engines that re-ingest the open web more often. The compounding effect shows up around month three when a critical mass of links is in place.":
    "От двух до восьми недель для Google, иногда быстрее для систем ответов AI, которые чаще повторно используют открытую сеть. Эффект усугубления проявляется примерно на третьем месяце, когда имеется критическая масса ссылок.",
  "Designing for the AI-native era: generative UI and building for agents":
    "Проектирование для эпохи искусственного интеллекта: генеративный пользовательский интерфейс и создание агентов",
  "AI-Native Era: Generative UI & Agents | Start Apps Studio":
    "Эра AI-Native: генеративный интерфейс и агенты | Запустить Студию приложений",
  "A field guide for founders on the shift from static dashboards to generative interfaces, the four stages every AI-native product moves through, and the three things you must do today so AI agents can actually use your product.":
    "Полевое руководство для основателей о переходе от статических информационных панелей к генеративным интерфейсам, о четырех этапах, через которые проходит каждый продукт, основанный на искусственном интеллекте, и о трех вещах, которые вы должны сделать сегодня, чтобы агенты искусственного интеллекта могли действительно использовать ваш продукт.",
  "A field guide on generative UI and AI-native products: the four stages every product moves through and three steps to make your product agent-ready today.":
    "Полевое руководство по продуктам с генеративным пользовательским интерфейсом и искусственным интеллектом: четыре этапа, через которые проходит каждый продукт, и три шага, которые помогут вашему агенту продукта быть готовым уже сегодня.",
  "Replacing your dashboard with a chat bar is a downgrade. The real shift is to interfaces that get generated on the fly for the task at hand, and to backends that an agent can drive without ever touching your UI.":
    "Замена панели управления панелью чата — это понижение версии. Настоящий сдвиг заключается в интерфейсах, которые генерируются на лету для выполнения поставленной задачи, и в бэкэндах, которыми агент может управлять, даже не касаясь вашего пользовательского интерфейса.",
  Essay: "Эссе",
  "AI-native": "AI-родной",
  "Generative UI": "Генеративный интерфейс",
  Design: "Дизайн",
  API: "API",
  "AI-native products do not replace dashboards with chatbots. They generate the right interface for each task, expose every action through a clean API so agents can drive the product directly, and design for two users at once: a human who needs trust and oversight, and an agent who needs structured data and reliable endpoints.":
    "Продукты на основе искусственного интеллекта не заменяют информационные панели чат-ботами. Они создают правильный интерфейс для каждой задачи, предоставляют каждое действие через чистый API, чтобы агенты могли напрямую управлять продуктом, и проектируют для двух пользователей одновременно: человека, которому нужно доверие и контроль, и агента, которому нужны структурированные данные и надежные конечные точки.",
  "Most teams are still bolting a chat bar onto a traditional dashboard and calling the result AI-native. It is not. A chat bar trades visual density and context for a single text input, then asks the user to remember every command. The next generation of products goes the other way. The interface is generated for the task, the backend is built for agents as much as humans, and design shifts from arranging pixels to shaping judgment.":
    "Большинство команд до сих пор прикручивают панель чата к традиционной информационной панели и называют результат искусственным интеллектом. Это не. Панель чата меняет визуальную плотность и контекст на один ввод текста, а затем просит пользователя запомнить каждую команду. Следующее поколение продуктов идет другим путем. Интерфейс создается под задачу, серверная часть создается как для агентов, так и для людей, а дизайн переходит от упорядочения пикселей к формированию суждений.",
  "Why a chat bar is a downgrade, not an upgrade":
    "Почему панель чата — это понижение, а не обновление",
  "A good dashboard packs hundreds of signals into a single glance. Replacing it with a chat input throws away that density and forces the user to type their way back to information they could already see. Chat is a great input for ambiguous, open-ended requests. It is a poor replacement for the muscle memory of a well-designed screen. The right move is not chat instead of UI, but UI generated by the model in response to the request.":
    "Хорошая информационная панель объединяет сотни сигналов в одном взгляде. Замена его вводом в чате устраняет эту плотность и заставляет пользователя вводить информацию, которую он уже видел. Чат — отличный способ ответить на неоднозначные и открытые запросы. Это плохая замена мышечной памяти хорошо продуманного экрана. Правильный ход — не чат вместо UI, а UI, генерируемый моделью в ответ на запрос.",
  "The four stages of AI-native products":
    "Четыре этапа создания продуктов на базе искусственного интеллекта",
  "1. Basic text interfaces": "1. Базовые текстовые интерфейсы",
  "The starting point most products are at today. A chat input, a stream of text replies, maybe a few buttons. Useful for exploration, weak for repeated workflows because nothing persists and every answer has to be re-typed.":
    "Отправная точка, в которой находится большинство продуктов сегодня. Ввод в чат, поток текстовых ответов, возможно, несколько кнопок. Полезно для исследования, слабо для повторяющихся рабочих процессов, потому что ничего не сохраняется и каждый ответ приходится вводить заново.",
  "2. Inline generative components": "2. Встроенные генеративные компоненты",
  "The model returns more than text. Tables, charts, forms, and small interactive widgets appear inside the conversation, sized to the question that was asked. The interface starts to feel like a worksheet that builds itself as you talk to it.":
    "Модель возвращает не только текст. Внутри разговора появляются таблицы, диаграммы, формы и небольшие интерактивные виджеты, размер которых соответствует заданному вопросу. Интерфейс начинает напоминать рабочий лист, который создается по мере того, как вы с ним разговариваете.",
  "3. Persistent UI builders":
    "3. Постоянные конструкторы пользовательского интерфейса",
  "Generated components get pinned, saved, and rearranged into pages the user can return to. The product becomes a personal workbench where the model assembles screens on demand and the user keeps the ones that work. This is where most ambitious AI-native products will sit for the next two years.":
    "Сгенерированные компоненты закрепляются, сохраняются и переупорядочиваются на страницы, к которым пользователь может вернуться. Продукт становится личным верстаком, где модель собирает экраны по требованию, а пользователь оставляет те, которые работают. Именно здесь в ближайшие два года будут находиться самые амбициозные продукты, основанные на искусственном интеллекте.",
  "4. Ambient, autonomous interfaces": "4. Окружающие автономные интерфейсы",
  "The end state. The product anticipates what the user needs and surfaces the right interface, action, or summary without being asked. Prompts become rare. The job of the UI is to confirm, correct, and approve, not to issue commands. Very few products have earned the trust to operate here yet.":
    "Конечное состояние. Продукт предвидит, что нужно пользователю, и предлагает правильный интерфейс, действие или сводку без каких-либо вопросов. Подсказки становятся редкими. Задача пользовательского интерфейса — подтверждать, исправлять и утверждать, а не отдавать команды. Пока очень немногие продукты заслужили доверие и работают здесь.",
  "The new role of design": "Новая роль дизайна",
  "When the model can render a passable interface in seconds, design stops being about pushing pixels and starts being about judgment. Which problems deserve a generated interface and which deserve a fixed one. Which actions need friction. Which states need a human in the loop. Taste, restraint, and a deep grasp of the user's mental model become the moat. The teams that win are not the ones who can render the most components, they are the ones who decide what should never be generated at all.":
    "Когда модель может визуализировать приемлемый интерфейс за считанные секунды, дизайн перестает сводиться к перемещению пикселей и начинает сводиться к оценке. Какие проблемы заслуживают сгенерированного интерфейса, а какие — фиксированного. Какие действия требуют трения. Каким штатам нужен человек в курсе? Вкус, сдержанность и глубокое понимание ментальной модели пользователя становятся рвом. Побеждают не те команды, которые смогут отрендерить наибольшее количество компонентов, а те, кто решает, что вообще никогда не следует генерировать.",
  "Building for AI agents: three things to ship now":
    "Создание агентов ИИ: три вещи, которые нужно выпустить прямо сейчас",
  "1. API-first architecture": "1. Архитектура, ориентированная на API",
  "Agents do not click buttons. They call APIs. Every meaningful action a human can take in your UI should also be reachable through a clean, documented endpoint. If the only way to cancel a subscription, export a report, or invite a teammate is through a modal, your product is invisible to the agent layer that is rapidly becoming how work gets done.":
    "Агенты не нажимают кнопки. Они вызывают API. Каждое значимое действие, которое человек может предпринять в вашем пользовательском интерфейсе, также должно быть доступно через чистую, документированную конечную точку. Если единственный способ отменить подписку, экспортировать отчет или пригласить товарища по команде — через модальное окно, ваш продукт невидим для уровня агента, который быстро становится способом выполнения работы.",
  "2. A design system the model can lean on":
    "2. Система дизайна, на которую может опираться модель.",
  "Generated UI is only as good as the components it is allowed to assemble. A strong design system with named tokens, predictable spacing, and a small set of well-documented primitives gives the model a vocabulary that produces consistent, on-brand interfaces every time. Without it, every generated screen feels slightly off, and trust erodes fast.":
    "Сгенерированный пользовательский интерфейс хорош настолько, насколько хороши компоненты, которые он может собрать. Сильная система дизайна с именованными токенами, предсказуемыми интервалами и небольшим набором хорошо документированных примитивов дает модели словарь, который каждый раз создает согласованные фирменные интерфейсы. Без этого каждый сгенерированный экран кажется немного странным, и доверие быстро подрывается.",
  "3. Dual-user support: human and agent":
    "3. Поддержка двух пользователей: человек и агент.",
  "Design for two users at once. The human needs trust signals, undo, audit trails, and clear ownership of every change. The agent needs structured data, stable IDs, idempotent endpoints, and machine-readable error messages. The same action often needs both surfaces: a confirmation screen for the person and a JSON response for the agent. Treat them as equals from day one.":
    "Дизайн для двух пользователей одновременно. Человеку необходимы сигналы доверия, возможность отмены, контрольные журналы и четкое право собственности на каждое изменение. Агенту нужны структурированные данные, стабильные идентификаторы, идемпотентные конечные точки и машиночитаемые сообщения об ошибках. Для одного и того же действия часто требуются обе поверхности: экран подтверждения для человека и ответ JSON для агента. Относитесь к ним как к равным с первого дня.",
  "Every MVP we ship now starts with the API contract, not the screens. We document each endpoint as if an agent will be the first user, build a small design system before the first page is wireframed, and reserve generative UI for the parts of the product where the input is genuinely open-ended. The result is software that a human can love today and an agent can drive tomorrow.":
    "Каждый MVP, который мы выпускаем, начинается с контракта API, а не с экранов. Мы документируем каждую конечную точку так, как будто агент будет первым пользователем, создаем небольшую систему дизайна до того, как будет создана первая страница, и резервируем генеративный пользовательский интерфейс для тех частей продукта, где ввод действительно открыт. Результатом является программное обеспечение, которое может понравиться человеку сегодня, а агенту — завтра.",
  "How we apply this at Start Apps Studio":
    "Как мы применяем это в Start Apps Studio",
  "Is a chatbot the same as an AI-native product?":
    "Чат-бот — это то же самое, что продукт, созданный на основе искусственного интеллекта?",
  "No. A chatbot is one input mode. An AI-native product reshapes its interface, actions, and data model around the assumption that both humans and AI agents will use it. Many AI-native products have no chat surface at all.":
    "Нет. Чат-бот — это один из режимов ввода. Продукт, основанный на искусственном интеллекте, меняет свой интерфейс, действия и модель данных, исходя из предположения, что его будут использовать как люди, так и агенты искусственного интеллекта. Многие продукты, основанные на искусственном интеллекте, вообще не имеют возможности чата.",
  "Do I need to rebuild my product to be AI-native?":
    "Нужно ли мне перестраивать свой продукт, чтобы он стал совместимым с искусственным интеллектом?",
  "Rarely. Most teams can move forward by exposing their core actions through clean APIs, tightening their design system, and adding a few inline generative components where the input is open-ended. A full rebuild is only worth it once the first three stages are in place and you are ready to design for ambient use.":
    "Редко. Большинство команд могут двигаться вперед, раскрывая свои основные действия через чистые API, ужесточая свою систему проектирования и добавляя несколько встроенных генеративных компонентов, ввод которых является открытым. Полная перестройка имеет смысл только тогда, когда первые три этапа выполнены и вы готовы к проектированию для использования в окружающей среде.",
  "Will design jobs disappear in the AI-native era?":
    "Исчезнут ли дизайнерские профессии в эпоху искусственного интеллекта?",
  "No, they evolve. The pixel work shrinks, the judgment work grows. Picking which interfaces to generate, defining the system the model assembles from, and protecting the user from bad model output are now the highest-leverage design tasks.":
    "Нет, они развиваются. Работа пикселей сокращается, работа суждений растет. Выбор интерфейсов для генерации, определение системы, из которой собирается модель, и защита пользователя от неверных выходных данных модели теперь являются наиболее важными задачами проектирования.",
  "What is the single most important thing to do today?":
    "Что самое важное нужно сделать сегодня?",
  "Make sure every action a user can take in your product is also reachable through a documented API endpoint. Without that, agents cannot use your product, and any generative UI you add later will sit on top of a foundation that limits how far it can go.":
    "Убедитесь, что каждое действие, которое пользователь может совершить в вашем продукте, также доступно через документированную конечную точку API. Без этого агенты не смогут использовать ваш продукт, а любой генеративный пользовательский интерфейс, который вы добавите позже, будет опираться на фундамент, ограничивающий его возможности.",
  "Your design system matters more in the AI era, not less":
    "В эпоху искусственного интеллекта ваша дизайн-система имеет большее, а не меньшее значение.",
  "Your Design System Matters More in the AI Era | Start Apps Studio":
    "Ваша система проектирования имеет большее значение в эпоху искусственного интеллекта | Запустить Студию приложений",
  "When AI generates your interface, the quality of the output is bounded by the quality of your design system. A tour of why APIs become the new product surface, why a strong system is now a force multiplier, why every product has two users, and why design as judgment is more valuable than ever.":
    "Когда ИИ генерирует ваш интерфейс, качество результата зависит от качества вашей дизайн-системы. Обзор того, почему API становятся новой поверхностью продукта, почему надежная система теперь является фактором повышения эффективности, почему у каждого продукта есть два пользователя и почему дизайн как суждение более ценен, чем когда-либо.",
  "When AI generates your UI, your design system sets the quality ceiling. See why APIs become the product surface and why design judgment matters more.":
    "Когда ИИ генерирует ваш пользовательский интерфейс, ваша система дизайна устанавливает потолок качества. Узнайте, почему API становятся основой продукта и почему суждения о дизайне имеют большее значение.",
  "If AI is going to generate your screens, the ceiling on what it can produce is your design system. A weak system means weak output, every time. Here is what changes.":
    "Если ИИ собирается создавать ваши экраны, то пределом того, что он может создать, является ваша система дизайна. Слабая система всегда означает слабый результат. Вот что меняется.",
  "Design Systems": "Системы проектирования",
  "In the AI era, your design system stops being a nice-to-have and becomes the ceiling on what AI-generated interfaces can ever look like. A robust system is a force multiplier for automated output. A weak one is a cap on quality you cannot prompt your way past.":
    "В эпоху искусственного интеллекта ваша система дизайна перестает быть приятной и становится потолком того, как могут когда-либо выглядеть интерфейсы, созданные искусственным интеллектом. Надежная система — это усилитель силы для автоматизированного производства. Слабый — это предел качества, мимо которого вы не можете пройти.",
  "There is a tempting story going around that AI makes design systems irrelevant. If a model can render any interface on demand, why bother maintaining tokens, components, and guidelines. The honest answer is the opposite. The more of your interface is generated, the more your design system decides what good looks like. AI does not invent quality. It amplifies whatever foundation you give it.":
    "Ходит заманчивая история о том, что ИИ делает системы проектирования неактуальными. Если модель может отображать любой интерфейс по требованию, зачем вообще поддерживать токены, компоненты и рекомендации. Честный ответ — противоположный. Чем больше элементов вашего интерфейса создается, тем больше ваша дизайн-система решает, как должно выглядеть хорошее. ИИ не изобретает качество. Он усиливает любую основу, которую вы ему даете.",
  "Three shifts every SaaS team is facing":
    "Три смены, с которыми сталкивается каждая SaaS-команда",
  "1. APIs are the new product surface":
    "1. API — это новая поверхность продукта",
  "AI agents do not click buttons or navigate menus. They call APIs. If your most important actions are only available behind a modal or a multi-step wizard, an agent cannot use them, and increasingly will route around your product entirely. The bar is now clean, complete, well-documented endpoints for every meaningful action a human can take. Your API is no longer a back office, it is the front door for a growing share of your users.":
    "Агенты ИИ не нажимают кнопки и не перемещаются по меню. Они вызывают API. Если ваши наиболее важные действия доступны только с помощью модального или многошагового мастера, агент не сможет их использовать и все чаще будет полностью обходить ваш продукт. Панель теперь чистая, полная, с хорошо документированными конечными точками для каждого значимого действия, которое может предпринять человек. Ваш API больше не является бэк-офисом, это входная дверь для растущей доли ваших пользователей.",
  "2. Design systems are a force multiplier, not overhead":
    "2. Системы проектирования — это мультипликатор усилий, а не накладных расходов.",
  "When AI assembles screens on demand, the components, tokens, and patterns you maintain become the vocabulary the model speaks. A tight system with clear naming, predictable spacing, and a small set of well-tested primitives lets the model produce interfaces that feel cohesive every time. A loose one produces drift, inconsistency, and the slow erosion of trust. The same prompt against a strong system and a weak one yields visibly different products.":
    "Когда ИИ собирает экраны по требованию, поддерживаемые вами компоненты, токены и шаблоны становятся словарем, на котором говорит модель. Строгая система с четкими именами, предсказуемыми интервалами и небольшим набором хорошо протестированных примитивов позволяет модели создавать интерфейсы, которые каждый раз кажутся целостными. Небрежный подход приводит к дрейфу, непоследовательности и медленному разрушению доверия. Одна и та же реакция на сильную и слабую системы дает заметно разные результаты.",
  "3. You now design for two users at once":
    "3. Теперь вы разрабатываете дизайн для двух пользователей одновременно.",
  "Every product has two audiences now. The human, who needs trust signals, undo, audit trails, and a clear sense of what is happening on their behalf. The agent, which needs structured data, stable identifiers, idempotent endpoints, and machine-readable error messages. The same workflow often needs both surfaces in parallel: a confirmation screen for the person, a JSON response for the agent. Treating them as equal first-class users from day one is the new default.":
    "Теперь у каждого продукта есть две аудитории. Человек, которому нужны сигналы доверия, отмены, контрольные журналы и четкое представление о том, что происходит от его имени. Агент, которому нужны структурированные данные, стабильные идентификаторы, идемпотентные конечные точки и машиночитаемые сообщения об ошибках. Один и тот же рабочий процесс часто требует одновременного использования обеих поверхностей: экрана подтверждения для человека и ответа JSON для агента. Относиться к ним как к равным первоклассным пользователям с первого дня — это новое правило по умолчанию.",
  "Why a strong design system is the highest-leverage investment":
    "Почему сильная дизайн-система — это самая выгодная инвестиция",
  "Imagine two teams building competing products. Both use the same model to generate parts of the interface. Team A has spent the last year hardening their design system: documented tokens, accessible components, clear states, written guidelines for spacing and density. Team B has shipped quickly and accumulated dozens of one-off styles. Hand the same prompt to both. Team A gets a polished, consistent screen the user trusts immediately. Team B gets something that looks plausible at a glance and starts to feel off the longer you use it. The model is the same. The ceiling is not.":
    "Представьте себе две команды, создающие конкурирующие продукты. Оба используют одну и ту же модель для создания частей интерфейса. Команда А провела последний год, укрепляя свою систему проектирования: документированные токены, доступные компоненты, четкие состояния, письменные рекомендации по размещению и плотности. Команда Б быстро выпустила товар и накопила десятки уникальных стилей. Передайте одно и то же приглашение обоим. Команда А получает безупречный и последовательный экран, которому пользователь сразу же доверяет. Команда Б получает что-то, что на первый взгляд выглядит правдоподобно, и чем дольше вы этим пользуетесь, тем неприятнее становится. Модель та же самая. Потолка нет.",
  "Tokens that name colour, spacing, radius, and motion in plain English":
    "Токены, обозначающие цвет, расстояние, радиус и движение на простом английском языке.",
  "A small set of primitives that handle 80 percent of layouts: card, list, table, form, dialog":
    "Небольшой набор примитивов, которые обрабатывают 80 процентов макетов: карточка, список, таблица, форма, диалог.",
  "Documented states for empty, loading, error, success, and partial data":
    "Документированные состояния для пустых, загружаемых, ошибочных, успешных и частичных данных.",
  "Accessibility built in, not bolted on, so generated screens never ship inaccessible defaults":
    "Специальные возможности встроены, а не прикручены, поэтому сгенерированные экраны никогда не поставляются с недоступными настройками по умолчанию.",
  "A short written voice and tone guide so generated copy stays in your brand":
    "Краткое письменное голосовое и тональное руководство, благодаря которому созданный текст останется в вашем бренде.",
  "What this means for designers": "Что это значит для дизайнеров",
  "The pixel work shrinks. The judgment work grows. When the model can render a passable screen in seconds, the most valuable thing a designer does is decide what should and should not be generated, what needs a human in the loop, and what the underlying system should make easy by default. Taste, restraint, and a deep understanding of the user's mental model become the moat. The designer's job is to make complex tasks feel obvious, and then to encode that obviousness into the system the model uses.":
    "Работа пикселей уменьшается. Работа суждения растет. Когда модель может визуализировать сносный экран за считанные секунды, самое ценное, что делает дизайнер, — это решает, что следует и не следует генерировать, что требует участия человека в цикле и что базовая система должна упростить по умолчанию. Рвом становятся вкус, сдержанность и глубокое понимание ментальной модели пользователя. Задача дизайнера — сделать сложные задачи очевидными, а затем закодировать эту очевидность в системе, которую использует модель.",
  "The keyboard freed us from the typewriter, the plow freed us from the spade. AI frees us from building screens. What we still own is what to build, and why it matters.":
    "Клавиатура освободила нас от пишущей машинки, плуг – от лопаты. ИИ освобождает нас от необходимости строить экраны. Нам еще принадлежит то, что нужно построить и почему это важно.",
  "paraphrased from the original talk":
    "перефразировано из оригинального выступления",
  "Every MVP we ship now starts with two artefacts before a single screen is designed: an API contract that an agent could drive end-to-end, and a small but real design system. Both are deliberately minimal at launch and grow with the product. The result is software that feels coherent on day one and stays coherent as more of its surface becomes AI-generated.":
    "Каждый MVP, который мы выпускаем, теперь начинается с двух артефактов, прежде чем проектируется единый экран: контракт API, которым агент может управлять от начала до конца, и небольшая, но реальная система проектирования. Оба продукта намеренно минимальны при запуске и растут вместе с продуктом. В результате получается программное обеспечение, которое кажется целостным с самого первого дня и остается последовательным по мере того, как большая часть его поверхности создается искусственным интеллектом.",
  "How we think about this at Start Apps Studio":
    "Что мы думаем об этом в Start Apps Studio",
  "Does AI make design systems unnecessary?":
    "Делает ли ИИ дизайн-системы ненужными?",
  "No. It makes them more important. The model does not invent quality, it amplifies whatever foundation you give it. A strong design system is now the ceiling on what your AI-generated interfaces can ever look like.":
    "Нет. Это делает их более важными. Модель не изобретает качество, она усиливает любую основу, которую вы ей даете. Надежная система проектирования теперь является пределом того, как могут выглядеть ваши интерфейсы, созданные искусственным интеллектом.",
  "Where should a small team start with a design system?":
    "С чего небольшой команде следует начать разработку дизайн-системы?",
  "Pick five tokens, five components, and five documented states, and use them everywhere. A small system that is actually followed beats a sprawling one that nobody trusts. Grow it only when a real product need pushes you to.":
    "Выберите пять токенов, пять компонентов и пять документированных состояний и используйте их повсюду. Небольшая система, которой действительно следуют, лучше разросшейся системы, которой никто не доверяет. Развивайте его только тогда, когда вас подталкивает реальная потребность в продукте.",
  "What does an API-first product look like in practice?":
    "Как на практике выглядит продукт, ориентированный на API?",
  "Every action a user can take in the UI is also reachable through a documented endpoint with stable IDs, predictable errors, and idempotent behaviour. The UI becomes one of several clients, not the only path to the product.":
    "Каждое действие, которое пользователь может предпринять в пользовательском интерфейсе, также доступно через документированную конечную точку со стабильными идентификаторами, предсказуемыми ошибками и идемпотентным поведением. Пользовательский интерфейс становится одним из нескольких клиентов, а не единственным путем к продукту.",
  "Is design as a career going away?": "Дизайн как карьера уходит?",
  "The opposite. The pixel-pushing portion shrinks, but judgment, taste, systems thinking, and user empathy become the highest-leverage skills in the building of software. Designers who own the system the model assembles from will be more valuable, not less.":
    "Противоположное. Часть, связанная с перемещением пикселей, сокращается, но рассудительность, вкус, системное мышление и сочувствие к пользователю становятся наиболее важными навыками при создании программного обеспечения. Дизайнеры, владеющие системой, из которой собирается модель, будут более ценными, а не менее ценными.",
  "Base44 vs. Lovable: which one is right for your next app?":
    "Base44 против Lovable: какой из них подойдет для вашего следующего приложения?",
  "Base44 vs. Lovable: Which One Is Right for Your Next App? | Start Apps Studio":
    "Base44 против Lovable: какой из них подойдет для вашего следующего приложения? | Запустить Студию приложений",
  "Base44 and Lovable optimize for different kinds of speed. Compare their backend control, AI workflow, SEO, and handoff paths before you choose where to build.":
    "Base44 и Lovable оптимизируются для разных скоростей. Сравните их внутренний контроль, рабочий процесс ИИ, SEO и пути передачи управления, прежде чем выбирать, где строить.",
  "Base44 is a fast path to a contained app. Lovable offers a more open backend and a stronger starting point for public, searchable pages. Compare the trade-offs before you build.":
    "Base44 — это быстрый путь к автономному приложению. Lovable предлагает более открытый бэкэнд и более надежную отправную точку для общедоступных страниц с возможностью поиска. Сравните компромиссы, прежде чем строить.",
  "Base44 and Lovable can both get an idea moving quickly. The important difference appears later, when your app needs custom auth, search visibility, or a clean handoff.":
    "Base44 и Lovable могут быстро воплотить идею в жизнь. Важное различие проявляется позже, когда вашему приложению потребуется специальная аутентификация, видимость для поиска или чистая передача управления.",
  Base44: "База44",
  "Product strategy": "Стратегия продукта",
  "Base44 is the better fit for a contained, authenticated app where speed and built-in conventions matter. Lovable is the better fit when you need an open Supabase backend, room for custom integrations, or public pages that search engines can read. If the product becomes business-critical, treat either one as a starting point and plan the handoff before you build too much.":
    "Base44 лучше подходит для автономного приложения с аутентификацией, где важны скорость и встроенные соглашения. Lovable лучше подходит, когда вам нужен открытый бэкэнд Supabase, место для индивидуальной интеграции или общедоступные страницы, которые могут читать поисковые системы. Если продукт становится критически важным для бизнеса, рассматривайте любой из них как отправную точку и спланируйте передачу, прежде чем создавать слишком много.",
  "Choosing an AI app builder is easy when the only measure is how quickly it produces a first screen. The harder question is what happens after that screen: when a login flow gets unusual, the data model needs to change, Google needs to crawl a landing page, or another engineer has to take over the code.":
    "Выбрать разработчика приложений с искусственным интеллектом легко, если единственным критерием является то, насколько быстро он создает первый экран. Более сложный вопрос заключается в том, что происходит после этого экрана: когда процесс входа в систему становится необычным, модель данных должна измениться, Google должен просканировать целевую страницу или другой инженер должен взять на себя код.",
  "Base44 and Lovable are both good at turning a rough idea into a working flow. They make different trade-offs to get there. Base44 feels more contained and operationally convenient. Lovable gives you more familiar, portable primitives around Supabase. Neither is the universal winner. The right choice depends on where you need control.":
    "Base44 и Lovable хорошо умеют превращать грубую идею в рабочий процесс. Чтобы добиться этого, они идут на разные компромиссы. Base44 выглядит более компактным и удобным в эксплуатации. Lovable дает вам более знакомые портативные примитивы в Supabase. Ни один из них не является универсальным победителем. Правильный выбор зависит от того, где вам нужен контроль.",
  "The real decision is where you need control":
    "Настоящее решение – это то, где вам нужен контроль",
  "A builder is not just a writing surface for prompts. It is also a decision about your backend, your deployment model, your search surface, and your future maintenance loop. Those choices can stay invisible while an app is small. They become expensive once users, payments, private data, and marketing traffic depend on them.":
    "Конструктор — это не просто поверхность для написания подсказок. Это также решение о вашей серверной части, вашей модели развертывания, вашей поверхности поиска и вашем будущем цикле обслуживания. Этот выбор может оставаться невидимым, пока приложение маленькое. Они становятся дорогими, когда от них зависят пользователи, платежи, личные данные и маркетинговый трафик.",
  "1. Backend: open primitives or a contained platform?":
    "1. Бэкенд: открытые примитивы или автономная платформа?",
  "Lovable: familiar building blocks": "Мило: знакомые строительные блоки",
  "Lovable is built around Supabase, which gives the project a backend many engineers already understand: Postgres for data, standard authentication patterns, storage, and documented APIs. That does not make every implementation automatically good, but it gives you a more portable foundation when the product needs custom roles, a less common OAuth provider, or an integration that does not fit the happy path.":
    "Lovable построен на базе Supabase, которая дает проекту серверную часть, которую уже понимают многие инженеры: Postgres для данных, стандартные шаблоны аутентификации, хранилище и документированные API. Это не делает каждую реализацию автоматически хорошей, но дает вам более портативную основу, когда продукту нужны специальные роли, менее распространенный поставщик OAuth или интеграция, которая не соответствует счастливому пути.",
  "The practical benefit is not that Supabase removes complexity. It is that the complexity is visible. You can inspect the database, reason about the auth flow, and find engineers who have worked with the same primitives before.":
    "Практическая польза заключается не в том, что Supabase устраняет сложность. В том, что сложность видна. Вы можете просмотреть базу данных, разобраться в потоке аутентификации и найти инженеров, которые раньше работали с теми же примитивами.",
  "Base44: faster inside a boundary": "Base44: быстрее внутри границы",
  "Base44 takes more of the backend experience into its own managed environment. That can be exactly what a non-technical founder wants: fewer services to configure, sensible defaults, and less time wiring the first version together. For a private dashboard, internal tool, or straightforward authenticated workflow, that convenience has real value.":
    "Base44 переносит большую часть серверной части в свою собственную управляемую среду. Это может быть именно то, чего хочет нетехнический основатель: меньше сервисов для настройки, разумные настройки по умолчанию и меньше времени на сборку первой версии. Для частной информационной панели, внутреннего инструмента или простого рабочего процесса с аутентификацией это удобство имеет реальную ценность.",
  "The trade-off is that unusual requirements can push you toward workarounds. Proprietary backend boundaries may limit how freely you can design custom authentication, bring in a specialised identity provider, or move one part of the system somewhere else. It is a good reason to test the hardest requirement first, not last.":
    "Компромисс заключается в том, что необычные требования могут подтолкнуть вас к обходным путям. Собственные внутренние границы могут ограничивать свободу разработки пользовательской аутентификации, привлечения специализированного поставщика удостоверений или перемещения одной части системы в другое место. Это хороший повод протестировать самое сложное требование в первую очередь, а не в последнюю очередь.",
  "What is the least standard thing this product must do? Test that flow before you invest in the rest of the interface. A builder that handles the demo beautifully but cannot support the defining constraint is not saving you time.":
    "Какую наименее стандартную функцию должен выполнять этот продукт? Протестируйте этот процесс, прежде чем вкладывать средства в остальную часть интерфейса. Конструктор, который прекрасно обрабатывает демо-версию, но не может поддерживать определяющие ограничения, не экономит ваше время.",
  "Ask this before you choose": "Спросите об этом, прежде чем выбрать",
  "2. AI workflow: convenience or deliberate choice?":
    "2. Рабочий процесс с искусственным интеллектом: удобство или осознанный выбор?",
  "The two tools also differ in how much of the model decision they expose. This matters less for a landing page and more for a product with tangled state, unfamiliar domain rules, or a debugging problem where consistency is more useful than novelty.":
    "Эти два инструмента также различаются тем, какую часть модельного решения они раскрывают. Это имеет меньшее значение для целевой страницы и большее — для продукта с запутанным состоянием, незнакомыми правилами предметной области или проблемой отладки, где согласованность более полезна, чем новизна.",
  "Lovable keeps the loop frictionless": "Lovable сохраняет петлю без трения",
  "Lovable's auto-mode chooses the model for the task, which keeps the experience simple. You describe the change, review the result, and keep moving. That is useful when the main bottleneck is getting a founder's idea into a testable form rather than tuning the implementation process.":
    "Автоматический режим Lovable выбирает модель для задачи, что упрощает процесс. Вы описываете изменение, анализируете результат и продолжаете двигаться. Это полезно, когда основным узким местом является приведение идеи основателя в тестируемую форму, а не настройка процесса реализации.",
  "Base44 gives you a model picker":
    "Base44 предоставляет вам средство выбора модели",
  "Base44 puts more choice in the builder's hands. Selecting between models such as Opus or Sonnet can be useful when you know that one is better for a particular debugging task, integration, or large refactor. It also makes it easier to keep a preferred model consistent across a sensitive part of the project.":
    "Base44 предоставляет разработчику больше выбора. Выбор между такими моделями, как Opus или Sonnet, может быть полезен, если вы знаете, какая из них лучше подходит для конкретной задачи отладки, интеграции или крупного рефакторинга. Это также упрощает поддержание согласованности предпочтительной модели в важной части проекта.",
  "Model control is not the same as product control. A stronger model can still produce the wrong abstraction, and a fast model can still make a risky change. Whichever tool you use, keep a written scope, review the data model, and test the core workflow outside the happy path.":
    "Контроль модели — это не то же самое, что контроль продукта. Более сильная модель все равно может создать неверную абстракцию, а быстрая модель все равно может внести рискованные изменения. Какой бы инструмент вы ни использовали, сохраняйте письменный объем, анализируйте модель данных и тестируйте основной рабочий процесс за пределами счастливого пути.",
  "3. SEO: can a crawler see the product?":
    "3. SEO: может ли сканер увидеть продукт?",
  "SEO only matters for the parts of your product that need to be discovered. A private operations dashboard does not need to rank. A public landing page, directory, comparison page, or product-led acquisition loop absolutely does.":
    "SEO имеет значение только для тех частей вашего продукта, которые необходимо обнаружить. Панель управления частными операциями не нуждается в ранжировании. Общедоступная целевая страница, каталог, страница сравнения или цикл привлечения клиентов абсолютно подходят.",
  "Lovable has the stronger starting point for public pages":
    "У Lovable более сильная отправная точка для общедоступных страниц.",
  "Lovable's server-side rendering means a crawler can receive meaningful HTML instead of waiting for a client-side bundle to execute. That gives Googlebot and other discovery systems a better first look at the headings, copy, links, and structured content that explain what the page is about.":
    "Рендеринг Lovable на стороне сервера означает, что сканер может получать осмысленный HTML вместо того, чтобы ждать выполнения пакета на стороне клиента. Это позволяет роботу Googlebot и другим системам обнаружения лучше сначала просмотреть заголовки, текст, ссылки и структурированный контент, объясняющий, о чем страница.",
  "SSR is not a ranking guarantee. You still need useful content, stable URLs, internal links, metadata, and schema that matches what people see. It is simply a much better foundation than assuming every crawler will render a React app correctly on a second pass.":
    "SSR не является гарантией ранжирования. Вам по-прежнему нужен полезный контент, стабильные URL-адреса, внутренние ссылки, метаданные и схема, которая соответствует тому, что видят люди. Это просто гораздо лучшая основа, чем предположение, что каждый сканер правильно отобразит приложение React за второй проход.",
  "Base44 is often the sensible choice for private apps":
    "Base44 часто является разумным выбором для частных приложений.",
  "Base44's React and Vite approach can be perfectly adequate when the app lives behind authentication and the public acquisition pages are elsewhere. It becomes a concern when the Base44 app itself is the marketing site. Metadata settings do not necessarily mean a raw crawler can see the full page content, so test the initial HTML before you commit to an organic-growth plan.":
    "Подход Base44 React и Vite может быть совершенно адекватным, когда приложение использует аутентификацию, а страницы общедоступного сбора данных находятся где-то еще. Это становится проблемой, когда само приложение Base44 является маркетинговым сайтом. Настройки метаданных не обязательно означают, что необработанный сканер может видеть полное содержимое страницы, поэтому проверьте исходный HTML-код, прежде чем переходить к плану органического роста.",
  "4. The handoff test: can you leave responsibly?":
    "4. Тест на передачу: можете ли вы уйти ответственно?",
  "The best builder is not only the one that gets you to version one. It is the one you can leave without losing the product. Before starting, answer four unglamorous questions:":
    "Лучший конструктор — это не только тот, который дает вам первую версию. Это тот, который вы можете покинуть, не потеряв продукт. Прежде чем начать, ответьте на четыре непривлекательных вопроса:",
  "Can you export or inspect the code, data, and configuration without the builder?":
    "Можете ли вы экспортировать или проверить код, данные и конфигурацию без компоновщика?",
  "Can another engineer run the project locally and understand where the important decisions live?":
    "Может ли другой инженер управлять проектом локально и понимать, где принимаются важные решения?",
  "Can you replace the default authentication, payments, or data service if the product outgrows it?":
    "Можете ли вы заменить стандартную службу аутентификации, платежей или передачи данных, если продукт ее перерастет?",
  "What is the migration path if the first version works and the requirements stop being standard?":
    "Каков путь миграции, если первая версия работает, а требования перестают быть стандартными?",
  "These questions are not an argument against managed tools. They are a way to use them deliberately. A contained internal app may never need a migration. A public product with a growing team probably will need a clearer ownership and handoff plan than its first prompt suggests.":
    "Эти вопросы не являются аргументом против управляемых инструментов. Это способ использовать их сознательно. Автономное внутреннее приложение может никогда не нуждаться в миграции. Публичный продукт с растущей командой, вероятно, потребует более четкого плана владения и передачи, чем предполагает первое предложение.",
  "Which one should you pick?": "Какой из них выбрать?",
  "Choose Lovable for a public landing page, searchable product surface, or app that needs Supabase's open backend primitives.":
    "Выберите Lovable для общедоступной целевой страницы, поверхности продукта с возможностью поиска или приложения, которому нужны открытые серверные примитивы Supabase.",
  "Choose Base44 for a private dashboard, internal tool, or straightforward authenticated workflow where managed setup is the main advantage.":
    "Выберите Base44 для частной информационной панели, внутреннего инструмента или простого рабочего процесса с аутентификацией, где управляемая настройка является основным преимуществом.",
  "Choose Lovable when custom authentication, unusual data relationships, or third-party integrations are central to the product.":
    "Выбирайте Lovable, когда пользовательская аутентификация, необычные взаимоотношения данных или интеграция со сторонними организациями играют центральную роль в продукте.",
  "Choose either for a short validation sprint, but write down the handoff plan before real users, payments, or sensitive data arrive.":
    "Выберите один из вариантов короткого спринта проверки, но запишите план передачи до того, как поступят реальные пользователи, платежи или конфиденциальные данные.",
  "Choose a normal codebase sooner when the product's value depends on requirements that no builder supports cleanly.":
    "Выбирайте нормальную кодовую базу раньше, когда ценность продукта зависит от требований, которые ни один сборщик не поддерживает в полной мере.",
  "The fastest tool is the one that makes your next product decision cheaper, not the one that generates the most code in the first afternoon.":
    "Самый быстрый инструмент — это тот, который удешевляет ваше следующее решение о продукте, а не тот, который генерирует больше всего кода в первый же день.",
  "a rule we use when choosing a build path":
    "правило, которое мы используем при выборе пути сборки",
  "We use AI builders when they shorten the path to evidence, not when they let a team postpone the hard decisions. Before we build, we identify the first user, the core workflow, the trust requirements, and the part of the system that must remain flexible. That is how a fast prototype becomes a product instead of an impressive first draft.":
    "Мы используем разработчиков ИИ, когда они сокращают путь к доказательствам, а не когда они позволяют команде отложить принятие трудных решений. Прежде чем приступить к созданию, мы определяем первого пользователя, основной рабочий процесс, требования к доверию и ту часть системы, которая должна оставаться гибкой. Вот так быстрый прототип становится продуктом, а не впечатляющим первым наброском.",
  "How we approach this at Start Apps Studio":
    "Как мы подходим к этому в Start Apps Studio",
  "Is Base44 better than Lovable?": "Base44 лучше, чем Lovable?",
  "Neither is better in every situation. Base44 is compelling for contained authenticated apps where managed setup and model choice matter. Lovable is a stronger fit when you need a more open Supabase backend, custom integrations, or public pages that need to be crawlable.":
    "Ни то, ни другое не лучше в любой ситуации. Base44 отлично подходит для автономных приложений с аутентификацией, где важны управляемая настройка и выбор модели. Lovable больше подходит, когда вам нужен более открытый бэкэнд Supabase, пользовательские интеграции или общедоступные страницы, которые необходимо сканировать.",
  "Can I use Base44 or Lovable for an MVP?":
    "Могу ли я использовать Base44 или Lovable для MVP?",
  "Yes, especially when the MVP is designed to answer a focused product question. Keep the scope narrow, test the defining constraint early, and decide what happens to the code and data if the experiment earns a larger build.":
    "Да, особенно когда MVP призван ответить на конкретный вопрос о продукте. Сохраняйте узкую область применения, заранее проверяйте определяющее ограничение и решайте, что произойдет с кодом и данными, если эксперимент приведет к более крупной сборке.",
  "Which platform is better for SEO?": "Какая платформа лучше для SEO?",
  "Lovable has the stronger starting point for public SEO because server-rendered HTML gives crawlers content to read immediately. You should still inspect the actual initial response and test your metadata, links, and schema rather than relying on a platform label.":
    "Lovable имеет более сильную отправную точку для публичного SEO, поскольку HTML, отображаемый на сервере, дает сканерам контент для немедленного чтения. Вам все равно следует проверить фактический первоначальный ответ и протестировать свои метаданные, ссылки и схему, а не полагаться на метку платформы.",
  "When should I move beyond an AI app builder?":
    "Когда мне следует выйти за рамки создания приложений с искусственным интеллектом?",
  "Move when the product's important requirements are becoming workarounds: custom identity, complex permissions, unusual integrations, performance constraints, or a team that needs predictable ownership. A migration is easier when you plan the exit before the first version becomes business-critical.":
    "Действуйте, когда важные требования к продукту становятся обходными путями: настраиваемая идентификация, сложные разрешения, необычная интеграция, ограничения производительности или команда, которой требуется предсказуемое владение. Миграцию станет проще, если вы запланируете выход до того, как первая версия станет критически важной для бизнеса.",
  "Comparison source supplied for this field note: backend architecture and authentication discussion (0:55–13:05).":
    "Для этого примечания предоставлен источник сравнения: обсуждение серверной архитектуры и аутентификации (0:55–13:05).",
  "Comparison source supplied for this field note: AI model workflow and model selection discussion (27:41–34:12).":
    "Для этой примечания предоставлен источник сравнения: рабочий процесс модели ИИ и обсуждение выбора модели (27:41–34:12).",
  "Comparison source supplied for this field note: SEO, SSR, and final platform recommendations (37:16–1:22:23).":
    "Источник сравнения, указанный для этой примечания: SEO, SSR и окончательные рекомендации по платформе (37:16–1:22:23).",
};

function t(value: string): string {
  const translated = translations[value];
  if (!translated) throw new Error("Missing Russian translation for: " + value);
  let localized = translated
    .replaceAll("Запустить Студию приложений", "Start Apps Studio")
    .replaceAll("Студия Start Apps", "Start Apps Studio")
    .replaceAll("Милый", "Lovable")
    .replaceAll("Версель", "Vercel")
    .replaceAll("Клод", "Claude")
    .replaceAll("ССР", "SSR")
    .replaceAll("ГЕО", "GEO")
    .replaceAll("обзоры Google AI", "Google AI Overviews")
    .replaceAll("обзоры искусственного интеллекта Google", "Google AI Overviews")
    .replaceAll("Google AI напрямую", "Google AI Overviews напрямую")
    .replaceAll("страница часто задаваемых вопросов", "FAQPage")
    .replaceAll("Страница часто задаваемых вопросов", "FAQPage");

  // Product names and protocol/schema identifiers are identifiers, not words
  // to translate. Keep them verbatim wherever the English source uses them.
  const protectedTerms = [
    "Start Apps Studio",
    "Base44",
    "Lovable",
    "Claude Code",
    "Cloudflare Worker",
    "FAQPage",
    "JSON-LD",
    "Google AI Overviews",
    "Vercel",
  ];
  for (const term of protectedTerms) {
    if (value.includes(term) && !localized.includes(term)) {
      localized += ` (${term})`;
    }
  }
  if (value.includes("10,000") && !localized.includes("10.000")) {
    localized += " (10.000)";
  }
  return localized;
}

function localizeBlock(block: Block): Block {
  switch (block.type) {
    case "p":
    case "answer":
      return { ...block, text: t(block.text) };
    case "h2":
    case "h3":
      return { ...block, text: t(block.text) };
    case "quote":
      return {
        ...block,
        text: t(block.text),
        ...(block.cite ? { cite: t(block.cite) } : {}),
      };
    case "callout":
      return {
        ...block,
        text: t(block.text),
        ...(block.title ? { title: t(block.title) } : {}),
      };
    case "ul":
    case "ol":
      return { ...block, items: block.items.map(t) };
    case "faq":
      return {
        ...block,
        items: block.items.map((item) => ({ q: t(item.q), a: t(item.a) })),
      };
  }
}

function localizePost(source: Post): Post {
  return {
    ...source,
    title: t(source.title),
    ...(source.seoTitle ? { seoTitle: t(source.seoTitle) } : {}),
    description: t(source.description),
    ...(source.seoDescription
      ? { seoDescription: t(source.seoDescription) }
      : {}),
    excerpt: t(source.excerpt),
    category: t(source.category),
    tags: source.tags.map(t),
    body: source.body.map(localizeBlock),
    ...(source.sources
      ? {
          sources: source.sources.map((item) => ({
            ...item,
            label: t(item.label),
          })),
        }
      : {}),
  };
}

export const RU_TRANSLATED_POSTS: Readonly<Record<string, Post>> =
  Object.fromEntries(
    slugs.map((slug) => {
      const source = getPost(slug);
      if (!source)
        throw new Error("Missing Russian editorial source post: " + slug);
      return [slug, localizePost(source)];
    }),
  );
