⸻

# RBP Finivis

RBP Finivis is a web-based financial services application focused on compliance-oriented workflows, secure data handling, and a scalable frontend architecture. The project is designed to integrate cleanly with backend services and third-party APIs while maintaining audit-friendly and production-ready development practices.

This repository contains the frontend codebase of the application.

---

## Tech Stack

- Framework: Remix / React
- Language: TypeScript
- Styling: Tailwind CSS
- Backend Services: Supabase (Authentication, Database, Storage)
- Build Tool: Vite
- Version Control: Git & GitHub
- Deployment Platform: Vercel

---

## Project Structure

├── app / src
├── public
├── supabase
├── styles
├── package.json
├── vite.config.ts
└── README.md

---

## Environment Variables

This project uses environment variables for configuration and secrets.

Environment files are excluded from version control.

Example:

SUPABASE_URL=

SUPABASE_ANON_KEY=

Set environment variables:
- Locally using a `.env` file
- In production via Vercel project settings

---

## Local Development

Prerequisites:
- Node.js (v18 or later)
- npm

Commands:

```bash
npm install
npm run dev

The application will run on the port shown in the terminal.

⸻

Build

npm run build


⸻

Deployment

The application is deployed using Vercel with GitHub integration.

Deployment flow:
	•	Push code to the main branch
	•	Vercel automatically builds and deploys
	•	Environment variables are injected securely

Rollback and preview deployments are managed through Vercel.

⸻

Development Notes
	•	Secrets and credentials are never committed
	•	Database changes are tracked using Supabase migrations
	•	Code is written with maintainability and scalability in mind
	•	All changes are version-controlled using Git

⸻

License

This project is currently unlicensed.
Usage or redistribution requires permission from the project owner.

⸻

Maintainer

Aakash Sharma
Frontend / Full-Stack Developer

⸻

Status

Repository initialized and deployed-ready.

—-
