# Camino PR

**Your personalized guide to settling in Canada and preparing for permanent residency.**

Trilingual web app (Spanish, Portuguese, English) for Latin American newcomers. Answer a short profile, get **prioritized next steps** based on your situation and document gaps, and browse curated settlement resources; all stored privately on your device.

*Built at **Building Our Future in AI — a Vibe Coding Hackathon**, for the **Settlement Intelligence & Service Navigation** track: helping Latino newcomers and their families find the right supports faster, without having to figure out Canada's fragmented settlement system alone.*

**▶ Live demo: [plan-canada.lovable.app](https://plan-canada.lovable.app/)**

---

## About

**Camino PR** helps newcomers who feel lost in a fragmented settlement and immigration path. The app does **not** tell you which government benefits you qualify for. Instead, it:

1. Collects your status, province, documents, housing, work, and related answers.
2. Runs a **client-side rules engine** to recommend **concrete steps** (SIN, health card, language exams, etc.) and skip steps you have already completed.
3. Prioritizes actions with an **Eisenhower matrix** (urgent vs important).
4. Offers a **curated resource directory** (banks, phone, health, housing, services) filtered by province — separate from the action plan.

There is **no runtime AI/LLM** yet. Only deterministic rules and scoring. We map status, needs, and documents to prioritized steps and links — not automated government qualification.

---



## The problem

- Unclear **what to do next** and **which documents** are still missing  
- Hard to **prioritize** among many settlement and PR tasks  
- Trusted resources are scattered and often **not in Spanish or Portuguese.**

---



## Features


| Feature                   | Description                                                                                                                             |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Profile Builder**       | Five sections (Personal, Education, Languages, Work, Settlement); sheet forms; optional 3-step quick-start; auto-save to `localStorage` |
| **Smart Action Plan**     | 19 rules → settlement steps, Eisenhower quadrants, priority scores                                                                      |
| **CRS Estimate**          | Simplified Express Entry score on Results (not the official IRCC tool)                                                                  |
| **Status Snapshot**       | Six tiles: documents, housing, banking, health, credit, PR booster                                                                      |
| **Action Progress**       | Mark steps done; export summary from Settings                                                                                           |
| **Resource Navigator**    | Curated links by province/category + evergreen IRCC links                                                                               |
| **Instagram suggestions** | Ranked creators by profile (immigration, taxes, networking)                                                                             |
| **Trilingual UI**         | ES (default), PT, EN                                                                                                                    |
| **Privacy-first**         | No accounts; data stays in the browser                                                                                                  |
| **Dark mode**             | Light / Dark / System                                                                                                                   |


---



## Important notice

Camino PR is **not** legal advice and does **not** determine government program eligibility. Always confirm requirements with official sources ([IRCC](https://www.canada.ca/en/immigration-refugees-citizenship.html), provincial agencies, etc.). The CRS banner is a **simplified estimate**, not IRCC’s official calculator. Resource links are **curated static content** — verify before you act.

---



## Privacy

- No backend API stores user profile data in the core app

---



## Hackathon context

**Event:** Building Our Future in AI — a Vibe Coding Hackathon

**Track:** Settlement Intelligence & Service Navigation — how to help Latino newcomers and their families find the right supports faster by identifying early needs and risks, and navigating a fragmented settlement system.

The track had three sub-themes: early needs & risk flagging, **eligibility & service matching**, and trusted support network connector. **We built the second one.**

**Approach:**

- Privacy-first, zero-backend profile → prioritized steps  
- Trilingual UX for Latin American newcomers  
- Rules-based recommendations + separate resource catalog  
- Eisenhower prioritization to reduce overwhelm

---



## Team

Built as a team during the hackathon.


- [Cynthia Salazar](https://www.linkedin.com/in/cynthia-salazarb/)
- [Julian Chisco](https://www.linkedin.com/in/julian-chisco/)
- [Ernie Sumoso](https://www.linkedin.com/in/erniesumoso/)
- [Diego Fernandez Arista](https://www.linkedin.com/in/diego-fernandez-arista/)


---



## License

[MIT](LICENSE) — Copyright (c) 2026 Camino PR contributors

---

**Tech stack**


| Layer   | Technology                                                                  |
| ------- | --------------------------------------------------------------------------- |
| UI      | React 19, TypeScript, shadcn/ui, Tailwind CSS v4                            |
| Build   | Vite 7, Lovable TanStack config                                             |
| Hosting | [Lovable](https://lovable.dev/) (live demo), Cloudflare Workers (SSR shell) |
| State   | Browser `localStorage`, no user-data backend                                |


---

*Built with [TanStack Start](https://tanstack.com/start), [shadcn/ui](https://ui.shadcn.com/), and [Lovable](https://lovable.dev/).*