/**
 * Project data for the "My Works" section.
 * Source: the owner's previous portfolio (projects only — see memory note).
 */

export type ProjectCategory = "AI / ML" | "Mobile & AR" | "Full-stack" | "Frontend";

export interface ProjectStat {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  /** Shown instead of the number when the value is not a quantity. */
  text?: string;
}

export interface Project {
  slug: string;
  category: ProjectCategory;
  title: string;
  tagline: string;
  status: "shipped" | "in progress";
  duration: string;
  role: string;
  stack: readonly string[];
  /** Device frame the preview video is shown in. */
  frame: "browser" | "phone";
  /** Accent glow for the stage. */
  hue: string;
  media: { video: string; poster: string; width: number; height: number; alt: string };
  summary: readonly string[];
  features: readonly { title: string; text: string }[];
  extras: readonly string[];
  challenge: string;
  solution: string;
  impact: readonly string[];
  stats: readonly ProjectStat[];
  gallery: readonly { src: string; alt: string; width: number; height: number }[];
  links: { github: string; live?: string };
}

export const PROJECTS: readonly Project[] = [
  {
    slug: "neo",
    category: "AI / ML",
    title: "Neo — Interactive Defensive Analytics & Auditing Studio",
    tagline: "A Multi-Agent DevSecOps Threat Intelligence Framework.",
    status: "in progress",
    duration: "recent",
    role: "Solo Developer — AI Orchestration, RAG Pipeline, Full Stack Engineering",
    stack: ["Python", "Streamlit", "CrewAI", "ChromaDB"],
    frame: "browser",
    hue: "#8ab4ff",
    media: {
      video: "/works/neo.mp4",
      poster: "/works/neo-poster.webp",
      width: 1280,
      height: 720,
      alt: "Neo System Workflow Diagram",
    },
    summary: [
      "Neo is a state-of-the-art cybersecurity auditing engine designed to provide deep, interactive defensive analysis of infrastructure, code paths, and configuration exposures.",
      "Built using Streamlit for a persistent, stateful UI and CrewAI for multi-agent orchestration, Neo leverages Retrieval-Augmented Generation (RAG) over a local vector database to deliver precise threat intelligence.",
      "The system is designed for DevSecOps professionals to query architectural flaws, compliance risks, and theoretical threat vectors in a safe, defensive context.",
    ],
    features: [
      {
        title: "Multi-Agent Orchestration",
        text: "Configured a three-tier AI agent hierarchy (Triage Architect, Threat Modeler, and Compliance Reviewer) using CrewAI to parse, model, and synthesize threat intelligence.",
      },
      {
        title: "Vector Database (RAG)",
        text: "Integrated ChromaDB and BAAI/bge-large-en-v1.5 embeddings to query a massive cybersecurity knowledge base.",
      },
      {
        title: "Stateful Chat Interface",
        text: "Developed a seamless, real-time interactive Streamlit dashboard that maintains conversational context securely.",
      },
      {
        title: "Dynamic Routing",
        text: "Implemented smart routing so the system provides direct, unfiltered answers for general queries while invoking the full security reasoning chain for architectural or threat-related questions.",
      },
    ],
    extras: [],
    challenge:
      "Security auditing and threat modeling are traditionally manual and time-consuming. DevSecOps professionals needed an interactive, intelligent way to query architectural flaws, compliance risks, and theoretical threat vectors in a defensive context without relying solely on static auditing tools.",
    solution:
      "Developed a conversational audit engine that uses RAG (ChromaDB) to retrieve historical threat context and inject it into a three-tier CrewAI pipeline. The agents autonomously triage risks, model threats, and synthesize deep defensive responses, all orchestrated through a persistent and interactive Streamlit UI.",
    impact: [
      "Three-tier multi-agent pipeline for precise security triage and theoretical threat modeling",
      "Semantic vector retrieval with local ChromaDB ensuring deep historical context injection",
      "Smart dynamic routing bypassing heavy agent execution for general non-security queries",
      "Stateful real-time Streamlit dashboard maintaining complex conversational context",
    ],
    stats: [
      {
        value: 3,
        label: "agent tiers",
      },
      {
        value: 1,
        label: "local vector DB",
        text: "RAG",
      },
    ],
    gallery: [
      {
        src: "/works/neo-workflow.webp",
        width: 1536,
        height: 1024,
        alt: "Neo's three-tier agent workflow diagram",
      },
      {
        src: "/works/neo-poster-art.webp",
        width: 1024,
        height: 1536,
        alt: "Neo project poster",
      },
    ],
    links: {
      github: "https://github.com/Akash-rengaraj/Neo.git",
    },
  },
  {
    slug: "get-up",
    category: "Mobile & AR",
    title: "Get Up — All-in-One Student App",
    tagline:
      "A Flutter productivity companion that helps students track habits, attendance, and finances.",
    status: "shipped",
    duration: "6 weeks",
    role: "Solo developer — design, architecture, implementation, testing",
    stack: ["Flutter", "Hive", "fl_chart", "confetti", "intl"],
    frame: "phone",
    hue: "#ff5a1f",
    media: {
      video: "/works/get-up.mp4",
      poster: "/works/get-up-poster.webp",
      width: 432,
      height: 960,
      alt: "Get Up App Preview",
    },
    summary: [
      "The Ultimate Personal Productivity & Student Companion.",
      "Get Up is a comprehensive Flutter-based productivity application designed to help users—particularly students—manage their daily life, habits, and academic requirements.",
      "Built with Flutter for a smooth cross-platform experience and Hive for local-first storage.",
    ],
    features: [
      {
        title: "Daily Planner",
        text: "Habit tracking, To-Do list, and Daily Focus dashboard.",
      },
      {
        title: "Smart Attendance Tracker",
        text: "Bunk-o-Meter algorithm to calculate safe 'bunks'.",
      },
      {
        title: "Finance Manager",
        text: "Track income and expenses within budget.",
      },
      {
        title: "Analytics",
        text: "Visual productivity and consistency charts.",
      },
    ],
    extras: [],
    challenge:
      "Students juggle attendance rules, assignment deadlines, and finances simultaneously. Existing apps solve only one of these problems. The challenge was building a unified, offline-first experience that felt personal — not corporate.",
    solution:
      "Built a Flutter app with four interconnected modules sharing a single Hive database. Designed a 'Bunk-o-Meter' algorithm that reads current attendance percentage and safe-to-miss class count from the local DB in real time. Used fl_chart for visual feedback loops that make abstract stats feel tangible.",
    impact: [
      "100% offline — no backend, no latency, no privacy concerns",
      "Bunk-o-Meter algorithm reduced attendance anxiety for daily users",
      "Finance module tracks monthly budget variance with color-coded alerts",
      "Shipped solo in 6 weeks as a 1st-year student project",
    ],
    stats: [
      {
        value: 100,
        label: "offline",
        suffix: "%",
      },
      {
        value: 6,
        label: "weeks, solo",
      },
    ],
    gallery: [],
    links: {
      github: "https://github.com/Akash-rengaraj/get_up.git",
    },
  },
  {
    slug: "jewellery-ecommerce",
    category: "Full-stack",
    title: "Full-Stack Jewellery E-Commerce",
    tagline:
      "A production-grade e-commerce platform with real-time inventory and JWT auth — built solo end-to-end.",
    status: "in progress",
    duration: "10 weeks (ongoing)",
    role: "Solo full-stack developer — schema design, REST API, React frontend, deployment",
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "GSAP", "Node.js", "Express", "MongoDB"],
    frame: "browser",
    hue: "#f5b84b",
    media: {
      video: "/works/jewellery-ecommerce.mp4",
      poster: "/works/jewellery-ecommerce-poster.webp",
      width: 1280,
      height: 800,
      alt: "Sanjana Creations Preview",
    },
    summary: [
      "A state-of-the-art e-commerce platform dedicated to showcasing and selling exquisite, handcrafted jewelry.",
      "Built with a modern technology stack featuring React, TypeScript, and Vite for a lightning-fast frontend, and powered by a robust Node.js and Express backend.",
      "Represents the perfect fusion of elegance and technology.",
    ],
    features: [
      {
        title: "Immersive UX",
        text: "Visually stunning interface with smooth transitions, parallax effects, and interactive showcases.",
      },
      {
        title: "Dynamic Showcase",
        text: "Unique circular scroll interactions and detailed product views.",
      },
      {
        title: "Secure Auth",
        text: "Robust registration and login systems (JWT & BCrypt).",
      },
      {
        title: "Admin Dashboard",
        text: "Real-time management of products, inventory, and orders.",
      },
      {
        title: "High Performance",
        text: "Optimized for speed with Vite and modern React patterns.",
      },
    ],
    extras: [],
    challenge:
      "A real jewellery business needed an online presence that matched the premium feel of their physical store. The challenge: build something production-grade with a real admin dashboard, proper auth, and zero budget for third-party services.",
    solution:
      "Designed a normalized MongoDB schema for products, orders, and users. Built a JWT + BCrypt auth system from scratch. Created a GSAP-powered product showcase with circular scroll interactions. Admin dashboard uses optimistic UI updates so the business owner sees changes instantly without page refreshes.",
    impact: [
      "Full auth system: registration, login, JWT refresh, BCrypt password hashing",
      "Admin dashboard with live product/inventory/order management",
      "GSAP circular scroll animations achieve 60fps on mid-range devices",
      "TypeScript throughout — zero runtime type errors in production build",
    ],
    stats: [
      {
        value: 60,
        label: "fps animations",
        suffix: "fps",
      },
      {
        value: 10,
        label: "weeks, solo",
      },
    ],
    gallery: [],
    links: {
      github: "https://github.com/Akash-rengaraj/Full-Stack-E-Commerce-jewelery-website",
    },
  },
  {
    slug: "icecream-website",
    category: "Frontend",
    title: "Millora — Premium Ice Cream Brand Site",
    tagline:
      "A buttery-smooth frontend with Lenis scroll, Framer Motion, and a fully functional shopping cart.",
    status: "shipped",
    duration: "3 weeks",
    role: "Solo frontend developer — design system, animation architecture, cart state management",
    stack: ["React 19", "TypeScript", "Vite", "Framer Motion", "Lenis", "CSS Modules"],
    frame: "browser",
    hue: "#ff8fb3",
    media: {
      video: "/works/icecream-website.mp4",
      poster: "/works/icecream-website-poster.webp",
      width: 1280,
      height: 800,
      alt: "Millora Website Preview",
    },
    summary: [
      "A premium, artisanal ice cream brand website built with React 19, TypeScript, and Vite.",
      "Features buttery smooth scrolling with Lenis, immersive animations via Framer Motion, and a dynamic shopping experience.",
      "Designed to showcase handcrafted flavors and the brand's story in a visually stunning interface.",
    ],
    features: [
      {
        title: "Modern Aesthetic",
        text: "Visually stunning design with glassmorphism, vibrant colors, and premium typography.",
      },
      {
        title: "Smooth Experience",
        text: "Integrated lenis for buttery smooth scrolling interactions.",
      },
      {
        title: "Immersive Animations",
        text: "Powered by framer-motion for engaging entry and hover effects.",
      },
      {
        title: "Dynamic Cart",
        text: "Fully functional shopping cart context with persistent state.",
      },
      {
        title: "High Performance",
        text: "Built on Vite for instant server start and optimized production builds.",
      },
    ],
    extras: [],
    challenge:
      "Most food brand sites feel generic. The goal was to make the product itself feel premium through motion — every scroll, hover, and transition had to reinforce the brand's quality. The technical challenge: keep animations silky while TypeScript strict mode enforces correctness.",
    solution:
      "Used Lenis for sub-pixel scroll interpolation and Framer Motion's layout animations for cart interactions. Built a CSS Modules design system with custom properties for colors and spacing. Cart state in Context API with localStorage persistence — the user's order survives a page refresh.",
    impact: [
      "Lenis + Framer Motion achieve 60fps scroll and animation on all tested devices",
      "Cart persistence via localStorage — zero data loss on refresh",
      "TypeScript strict mode: 0 any types, full prop inference throughout",
      "Lighthouse Performance score: 94+",
    ],
    stats: [
      {
        value: 94,
        label: "Lighthouse perf",
        suffix: "+",
      },
      {
        value: 0,
        label: "any types",
      },
    ],
    gallery: [],
    links: {
      github: "https://github.com/Akash-rengaraj/Front-End-Icecream-shop-website",
    },
  },
  {
    slug: "portfolio",
    category: "Frontend",
    title: "Terminal Portfolio — akashr.dev",
    tagline:
      "A hacker-aesthetic portfolio with a real terminal emulator, wandering bot, and 30+ easter eggs.",
    status: "in progress",
    duration: "4 weeks (ongoing)",
    role: "Solo developer — design, animation, terminal engine, Firebase integration",
    stack: ["React 19", "Vite", "JavaScript", "Firebase", "react-router-dom"],
    frame: "browser",
    hue: "#ff5a1f",
    media: {
      video: "/works/portfolio.mp4",
      poster: "/works/portfolio-poster.webp",
      width: 1280,
      height: 686,
      alt: "Portfolio Preview",
    },
    summary: [
      "A terminal-themed personal portfolio website showcasing my projects, skills, and experiences.",
    ],
    features: [],
    extras: [
      "Interactive terminal interface with 20+ real commands",
      "Wandering ASCII bot with drag, dance, and mood states",
      "Dark/Light theme with localStorage persistence",
      "Firebase Realtime Database for live visitor counter",
      "Konami code easter egg (↑↑↓↓←→←→BA)",
    ],
    challenge:
      "Portfolios are forgettable. The goal was to build one that's genuinely interactive — something a recruiter would demo to a colleague. The constraint: no heavy frameworks, no paid services, must feel hand-crafted.",
    solution:
      "Built a full terminal emulator in React with sessionStorage history, tab autocomplete, and 20+ commands. The ASCII bot uses a custom movement engine (velocity + target interpolation at 50fps) and reacts to cursor proximity. Firebase Realtime Database powers the live visitor counter with zero backend code.",
    impact: [
      "Terminal emulator with 20+ commands, history, and tab autocomplete",
      "ASCII bot with 5 moods, drag physics, and dance animation",
      "Live visitor counter (Firebase RTDB) — updates across all open tabs",
      "6 easter eggs including Konami code Matrix rain effect",
    ],
    stats: [
      {
        value: 20,
        label: "terminal commands",
        suffix: "+",
      },
      {
        value: 6,
        label: "easter eggs",
      },
    ],
    gallery: [],
    links: {
      github: "https://github.com/Akash-rengaraj/Personal-Portfolio.git",
      live: "https://www.akashr.dev",
    },
  },
];
