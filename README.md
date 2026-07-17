# ZES Dashboard — 

Unified agent orchestration dashboard.


## Pages
- `/` — Overview with system stats and health
- `/laboratory` — Active experiments with green/red status cards
- `/communication` — System status & notifications
- `/service` — Guard Bots service control
- `/system` — Hardware & resource monitoring
- `/kanban` — Task board
- `/hermes-chat` — Hermes bridge chat
- `/oc-chat` — OpenClaude bridge chat
- `/9router` — API router interface
- `/claude` — Claude interface
- `/topology` — ZES system architecture topology
- `/workflows` — Workflow manager
- `/codex-web` — Codex web interface
- `/openclaude` — OpenClaude service manager

## Stack
- Next.js 15.5.18
- Tailwind CSS v4
- shadcn/ui components
- Recharts for charts
- Framer Motion for animations

## Ports
- Dashboard: `:7070`
- Flask API (backend): `:5002`
