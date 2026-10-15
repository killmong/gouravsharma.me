// All site copy lives here. Edit this file to update the portfolio.

export const profile = {
  name: "Gourav Sharma",
  intro:
    "I build the systems behind the work: CRMs, integrations and fast web apps, from the database to the last pixel.",
  location: "Mohali, India",
  email: "sharmanikhil87841@gmail.com",
  links: [
    { label: "GitHub", href: "https://github.com/killmong" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/gourav-sharma-a73960228/" },
    { label: "Upwork", href: "https://www.upwork.com/freelancers/~014efcf380664271c8" },
    { label: "X", href: "https://x.com/gou_ravop" },
  ],
};

export const projects = [
  {
    title: "Directly",
    summary:
      "A distraction-free video viewer. Enter a channel and watch only its videos, with no recommendations pulling you elsewhere.",
    stack: ["React", "REST APIs"],
    image: "images/projects/directly.png",
    live: "https://directly-eight.vercel.app/",
    code: "https://github.com/killmong/Directly",
  },
  {
    title: "Folio",
    summary:
      "A fintech portfolio site built for fast rendering and smooth, restrained animation.",
    stack: ["Next.js", "Tailwind CSS"],
    image: "images/projects/folio.png",
    live: "https://folio-taupe-pi.vercel.app/",
    code: "https://github.com/killmong/folio",
  },
  {
    title: "BlocVibe",
    summary:
      "Agency website delivered for an Upwork client: services, case studies and testimonials, pixel-matched to the design.",
    stack: ["Next.js", "MERN"],
    image: "images/projects/blocVibe.png",
    live: "https://blocvibe-design.vercel.app/",
    code: "https://github.com/killmong/Blocvibe-Design",
  },
  {
    title: "PragatiHub",
    summary:
      "A Q&A platform for college students in the style of Stack Overflow, with posts, comments and a live feed.",
    stack: ["Next.js", "TypeScript", "MongoDB"],
    image: "images/projects/pragatihub.png",
    live: "https://college-project-rouge.vercel.app/",
    code: "https://github.com/killmong/pragatiHub",
  },
  {
    title: "TextExtractor",
    summary:
      "Pulls text out of PDFs and scanned images with server-side OCR, then cleans and summarizes it.",
    stack: ["OCR", "AI summarization"],
    image: "images/projects/TextExtractor.png",
    live: "https://textextractor-two.vercel.app/",
    code: null,
  },
];

export const experience = [
  {
    // TODO: set your start month, e.g. "Nov 2025 – Present"
    date: "Present",
    role: "Full-Stack Developer",
    company: "Eximinix Logistics Pvt. Ltd.",
    summary:
      "Sole developer of the internal CRM and transportation management system for a US freight brokerage.",
    points: [
      "Load management, accounting and multi-load invoicing used daily by the brokerage team",
      "Carrier compliance through the Highway API: signed webhooks, idempotent processing and a weekly reconciliation job",
      "Bills of lading, rate confirmations and invoices generated as PDFs",
    ],
    stack: "Laravel 12, PHP 8.4, MySQL, Livewire",
  },
  {
    date: "Oct 2025 – Present",
    role: "Freelance Full-Stack Developer",
    company: "Upwork",
    summary:
      "Building client sites and apps end to end, from requirements to deployment, including moving older designs onto Next.js.",
    points: [],
    stack: "Next.js, React, Node.js",
  },
  {
    date: "May – Sep 2025",
    role: "Software Developer Trainee",
    company: "Dronaa Software Solutions",
    summary:
      "Shipped frontend and backend work on live projects and improved Core Web Vitals across client sites.",
    points: [],
    stack: "React, Next.js, Node.js, MongoDB",
  },
  {
    date: "Jan – Jun 2025",
    role: "MERN Stack Intern",
    company: "Isekai Tech",
    summary: "Built features and fixed bugs on live MERN client projects.",
    points: [],
    stack: "MongoDB, Express, React, Node.js",
  },
  {
    date: "Jun – Jul 2024",
    role: "MERN Stack Intern",
    company: "Codedrill Infotech",
    summary:
      "Worked on SwiftConnect, a social app: authentication, posting and UI improvements.",
    points: [],
    stack: "Next.js, TypeScript",
  },
  {
    date: "Jul – Aug 2023",
    role: "Python Intern",
    company: "All Soft Solutions",
    summary: "Learned Python, OOP and desktop GUIs with Tkinter.",
    points: [],
    stack: "Python",
  },
];

export const skills = [
  {
    group: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Three.js", "Livewire", "Alpine.js"],
  },
  {
    group: "Backend",
    items: ["Laravel", "PHP", "Node.js", "Express", "Python / Flask", ".NET"],
  },
  {
    group: "Data and delivery",
    items: ["MySQL", "MongoDB", "REST APIs and webhooks", "Git", "Docker", "Vercel"],
  },
];
