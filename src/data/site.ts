// ─────────────────────────────────────────────────────────────
// Your personal details. Edit the text between the quote marks.
// Everything here appears across the whole site.
// ─────────────────────────────────────────────────────────────

export const site = {
  // PLACEHOLDER: replace with your full name.
  name: 'Your Name',

  // Shown in browser tabs and search results.
  title: 'Product Lead & Principal PM Portfolio',
  description:
    'Product leader who builds. I turn AI and commerce ideas into working products, keeping human judgment at the core.',

  // PLACEHOLDER: replace with your real email address.
  email: 'you@example.com',

  // PLACEHOLDER: replace with your LinkedIn profile address.
  linkedin: 'https://www.linkedin.com/in/your-profile',

  // Put your resume in the "public" folder with exactly this name.
  resume: '/resume.pdf',
};

// ─────────────────────────────────────────────────────────────
// Prototype cards on the home page.
// When a project is ready, add  href: '/your-page'  to its entry
// and change status to something like 'Live'. The card then
// becomes a clickable link automatically.
// ─────────────────────────────────────────────────────────────

export type Prototype = {
  title: string;
  description: string;
  tags: string[];
  status: string;
  color: 'violet' | 'coral' | 'teal';
  href?: string;
};

export const prototypes: Prototype[] = [
  {
    title: 'AI grocery shopping assistant',
    description:
      'An AI assistant that helps people with their grocery shopping.',
    tags: ['AI', 'Commerce'],
    status: 'Coming soon',
    color: 'violet',
  },
  {
    title: 'Low-maintenance veterinary clinic website',
    description:
      'A low-maintenance website for a veterinary clinic.',
    tags: ['Web', 'Small business'],
    status: 'Coming soon',
    color: 'coral',
  },
  {
    title: 'Accessible nonprofit website redesign',
    description:
      'An accessible website redesign for a disability-focused nonprofit.',
    tags: ['Accessibility', 'Nonprofit'],
    status: 'Coming soon',
    color: 'teal',
  },
];
