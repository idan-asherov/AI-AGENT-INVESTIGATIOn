DAVOPS-Agent-AI/
├── demo-service/ # Express backend engine & agent execution layer
│ ├── app.js # Express server (must bind 0.0.0.0, expose /health)
│ ├── backend/ # Route handlers, controllers, internal modules
│ └── package.json # Backend dependencies & production start scripts
├── src/app/ # Next.js App Router (UI Dashboard / Control Panel)
├── public/ # Static frontend assets
├── .github/workflows/ # CI/CD GitHub Actions pipelines
├── next.config.mjs # Next.js config (output: 'standalone')
└── AGENTS.md # Persistent agent behavioral rules & architecture memory
