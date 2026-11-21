// Single source of truth for the site copy. The page renders it, and the
// "Chat with my resume" assistant is grounded on it, so edit facts here once.

export const profile = {
  name: "Katie Schmidtz",
  title: "Product Leader · AI Platforms & Commerce",
  location: "Calgary, AB · Open to remote or hybrid",
  email: "katieg.schmidtz@gmail.com",
  linkedin: "", // intentionally blank: site is shared directly, not via LinkedIn
  headline: "I turn ambitious AI bets into products people use and leaders fund.",
  intro:
    "Product leader with 10+ years building consumer ecommerce and enterprise AI platforms. I led the 0→1 build of an enterprise AI platform now generating eight figures of value a quarter, and I've shipped the conversion, checkout, and platform work that moves revenue in commerce.",
  lookingFor:
    "Product leadership roles (Group PM, Director, Head of Product) or senior IC roles (Principal PM) building AI-powered products, especially agentic and commerce experiences.",
};

export type Metric = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
  detail: string;
};

export const metrics: Metric[] = [
  {
    value: 13.5,
    prefix: "$",
    suffix: "M",
    decimals: 1,
    label: "value generated in one quarter",
    detail: "TasteMaker, Q1 2026, up 67% QoQ",
  },
  {
    value: 98,
    suffix: "K+",
    label: "hours saved",
    detail: "about $12M in time savings across Kraft Heinz brand teams",
  },
  {
    value: 24,
    prefix: "$",
    suffix: "M",
    label: "EBITDA-contributing content value",
    detail: "from AI-generated marketing content",
  },
  {
    value: 10,
    suffix: "+",
    label: "years in product and ecommerce",
    detail: "consumer, B2B, and enterprise AI",
  },
];

export type CaseStudy = {
  id: string;
  tag: string;
  title: string;
  org: string;
  summary: string;
  problem: string;
  moves: string[];
  results: string[];
};

export const caseStudies: CaseStudy[] = [
  {
    id: "tastemaker",
    tag: "0→1 Enterprise AI",
    title: "TasteMaker: building Kraft Heinz's AI platform from zero",
    org: "Apply Digital for Kraft Heinz · 2024–present",
    summary:
      "Led the zero-to-one build of Kraft Heinz's enterprise Marketing & Innovation AI platform, then was promoted to lead it.",
    problem:
      "Global brand teams were spending thousands of hours on content and innovation work that AI could speed up, but there was no platform, no value model, and no proof it would pay off.",
    moves: [
      "Owned product architecture, roadmap, and a value measurement framework that tied every feature to hours saved or value generated.",
      "Partnered with C-suite and VP stakeholders to scale the platform across brands, and with ML, design, and data science to improve agent performance.",
      "Now lead 2 Senior PMs and a 30+ person delivery team, owning growth across acquisition, retention, and education.",
      "Represented Kraft Heinz as its product partner at Google Next 2025, leading co-innovation sessions with senior leadership.",
    ],
    results: [
      "$13.5M in value generated in Q1 2026, up 67% QoQ",
      "98,000+ hours saved (about $12M) and $24M in EBITDA-contributing content value",
      "40+ Kraft Heinz brands enabled, with 80%+ engagement sustained through 2026",
      "40% QoQ increase in time saved and 8% QoQ MAU growth",
      "The team hit its $10M Q3 2025 total value goal with 26 days to spare",
    ],
  },
  {
    id: "b2b",
    tag: "B2B Commerce",
    title: "Launching Kraft Heinz's first B2B ecommerce storefront",
    org: "Apply Digital for Kraft Heinz",
    summary:
      "Launched a new B2B storefront with automated operations and a recurring revenue model.",
    problem:
      "Kraft Heinz had no direct B2B ecommerce channel, and manual operations would not scale.",
    moves: [
      "Defined the storefront scope and operating model with business stakeholders.",
      "Automated operations so the channel could grow without adding headcount.",
    ],
    results: [
      "Kraft Heinz's first B2B ecommerce storefront, live",
      "A new recurring revenue model for the business",
    ],
  },
  {
    id: "agents",
    tag: "Agentic AI",
    title: "Shipping enterprise AI agents for Aptar",
    org: "Apply Digital for Aptar · 2026",
    summary:
      "Created the framework that decides which AI agents get built, then shipped the first ones.",
    problem:
      "Aptar, a global packaging manufacturer, had dozens of AI agent ideas and no shared way to decide which ones were worth building.",
    moves: [
      "Built an Agent Prioritization Framework, later showcased company-wide at Apply Digital's global all-hands.",
      "Built 7 custom Gemini Enterprise agents in 2 months, covering legal (NDA review), ESG, brand, and regulatory work.",
      "Demoed an NDA review agent that earned positive feedback from Aptar's legal team, with a Sales pilot planned.",
      "Led R&D and innovation discovery interviews that turned into a follow-on engagement.",
    ],
    results: [
      "7 custom agents built in 2 months",
      "A repeatable way to pick agent bets",
      "Follow-on work confirmed to bring AI into Aptar's R&D innovation process",
    ],
  },
  {
    id: "knix",
    tag: "Consumer Ecommerce",
    title: "Growing conversion for a DTC brand in two countries",
    org: "Knix / Kt · 2021–2024",
    summary:
      "Owned the shopping experience and ecommerce roadmap for a dual-brand DTC business across Canada and the US.",
    problem:
      "Growth depended on converting more shoppers and raising order value, on a platform that needed to modernize.",
    moves: [
      "Ran conversion and activation experiments with A/B testing and data insights.",
      "Shipped enhanced filters and sorting, bundling, and upsell and cross-sell features.",
      "Led a full move to a headless platform (Contentful), plus Segment CDP, Amplitude analytics, and PIM rollouts across multiple vendors.",
    ],
    results: [
      "5% YoY conversion increase from roadmap features",
      "4% YoY conversion uplift and 3% YoY AOV improvement from experimentation",
      "A modern, headless commerce stack",
    ],
  },
];

export const strengths = [
  {
    title: "Strategic storyteller",
    body: "I turn ambiguity into plans that executives say yes to, backed by real validation and value models.",
    quote:
      "Absolutely crushed the Q4 QBR presentation… secured full alignment on Q4 objectives, KPI targets, and the roadmap.",
    source: "Account leadership, Apply Digital",
  },
  {
    title: "Makes decisions land",
    body: "Clear trade-offs, shared release language, and fail-fast calls that keep delivery moving.",
    quote: "You are SO valuable to this team.",
    source: "Account leadership, Apply Digital",
  },
  {
    title: "A multiplier",
    body: "I coach PMs into owning the stage and make a habit of recognizing the people around me.",
    quote: "Talent and hard work personified.",
    source: "Teammate, Apply Digital",
  },
  {
    title: "Trusted in client rooms",
    body: "Client leaders reuse my materials to brief their own executives and ask for follow-ups.",
    quote: "Enjoyed watching you grow into an amazing lead.",
    source: "Colleague, Apply Digital",
  },
];

export const builds = [
  {
    name: "Habitat Vet",
    url: "https://habitat-vet.vercel.app/",
    what: "Website for a Calgary house-call veterinary practice",
    details:
      "Booking form connected to the practice's booking system, a clear referral plan for clients during the vet's leave, FAQ, and accessible, mobile-first design.",
  },
  {
    name: "Cerebral Palsy Kids & Families",
    url: "https://calgary-cp-rebuild.vercel.app/",
    what: "Pro bono website rebuild for a Calgary nonprofit",
    details:
      "Rebuilt to improve navigation and user experience, grow membership, get found in search and AI answers (GEO/AEO), and support adapted bike sales.",
  },
  {
    name: "This site",
    url: "",
    what: "Portfolio with a resume chat assistant",
    details:
      "Next.js on Vercel with a Claude-powered assistant that answers questions about my experience.",
  },
];

export const buildStack = "Built hands-on with Claude Code, GitHub, and Vercel";

export const experience = [
  {
    role: "Product Lead, Enterprise AI & Ecommerce",
    org: "Apply Digital (for Kraft Heinz)",
    dates: "2026 – Present",
    points: [
      "Promoted to lead 2 Senior PMs and a 30+ person agile delivery team building TasteMaker, Kraft Heinz's enterprise Marketing & Innovation AI platform.",
      "Drove 67% QoQ growth in Generation Value ($13.5M in Q1 2026), a 40% QoQ increase in time saved, and 8% MAU growth QoQ.",
      "Own end-to-end platform growth strategy across acquisition, retention, and education for a global enterprise user base.",
      "Also lead Apply Digital's AI engagement with Aptar: built the Agent Prioritization Framework and 7 custom Gemini Enterprise agents in 2 months (legal, ESG, brand, regulatory).",
    ],
  },
  {
    role: "Senior Product Consultant, Enterprise AI & Ecommerce",
    org: "Apply Digital (for Kraft Heinz)",
    dates: "2024 – 2026",
    points: [
      "Autonomous product lead for Kraft Heinz's enterprise AI and ecommerce portfolio, owning vision, strategy, and execution across multiple programs.",
      "Led the 0→1 build of TasteMaker, owning architecture, roadmaps, and value measurement; scaled it across brands with C-suite and VP stakeholders.",
      "Drove 98,000+ hours saved (~$12M) and $24M in EBITDA-contributing content value, with dashboards quantifying ROI.",
      "Launched Kraft Heinz's first B2B ecommerce storefront with automated operations and a new recurring revenue model.",
      "Kraft Heinz's primary product partner at Google Next 2025, leading co-innovation sessions with senior leadership.",
    ],
  },
  {
    role: "Senior Product Manager, Ecommerce & Shopping Experience",
    org: "Knix / Kt",
    dates: "2023 – 2024",
    points: [
      "Owned the product vision and roadmap for the consumer shopping experience with executives and cross-functional teams.",
      "Achieved 4% YoY conversion uplift and 3% YoY AOV improvement across Canada and the US through experimentation and data insights.",
      "Led platform migration, Segment CDP, Amplitude analytics, and PIM implementation across multiple vendors.",
    ],
  },
  {
    role: "Product Manager, Ecommerce Roadmap",
    org: "Knix / Kt",
    dates: "2021 – 2023",
    points: [
      "Owned the dual-brand ecommerce roadmap with executives, marketing, and merchandising.",
      "Delivered filters and sorting, bundling, and upsell and cross-sell features for a 5% YoY conversion increase.",
      "Led the move to a fully headless platform with Contentful CMS.",
    ],
  },
  {
    role: "Product Owner",
    org: "ATCO Group (Rumi)",
    dates: "2020 – 2021",
    points: [],
  },
  {
    role: "Product Owner / Lead Business Analyst",
    org: "ATCOenergy",
    dates: "2019 – 2020",
    points: [],
  },
  {
    role: "Advisor, eCommerce Operations",
    org: "ATCOenergy",
    dates: "2016 – 2019",
    points: [],
  },
  {
    role: "Coordinator, Sales & Programs",
    org: "ATCO Blue Flame Kitchen",
    dates: "2014 – 2016",
    points: [],
  },
];

export const skills = [
  {
    group: "AI & Agents",
    items: ["AI agent product management", "Generative AI / LLM features", "Evals & agent quality", "ML & data science partnership"],
  },
  {
    group: "Commerce",
    items: ["Shopping experience", "Cart & checkout optimization", "Conversational commerce", "B2C & B2B platforms"],
  },
  {
    group: "Growth & Analytics",
    items: ["Experimentation & A/B testing", "Conversion & AOV", "Value modeling & ROI", "KPI dashboards"],
  },
  {
    group: "Leadership",
    items: ["0→1 product builds", "Leading PMs & delivery teams", "C-suite stakeholder management", "Coaching & mentoring"],
  },
  {
    group: "Tools",
    items: ["Claude Code", "Google AI Studio & Gemini Enterprise", "Shopify Plus", "Segment & Amplitude", "Figma", "Jira & Confluence", "Contentful", "Salesforce"],
  },
];

export const education = [
  "Bachelor of Arts, English Literature, University of Calgary (2013)",
  "Reforge: AI Strategy (2024), User Insights for Product Decisions (2023), Data for Product Managers (2022)",
  "Apply Digital AI Foundations Certification (2026)",
  "Certified Scrum Product Owner, Mountain Goat Software (2020)",
];

export const suggestedQuestions = [
  "What has Katie built from 0→1?",
  "How does Katie measure AI product value?",
  "What kind of team has she led?",
  "Does she have hands-on AI experience?",
];
