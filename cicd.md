# CI/CD & DevOps Pipeline Strategy

This document outlines the DevOps strategy for deploying, testing, and maintaining the Consilium AI platform. It covers monorepo deployment, continuous integration (specifically for AI testing), database migrations, and scheduled operations.

---

## 1. Monorepo Deployment Strategy
You are keeping both the Next.js frontend and the Python LangGraph sidecar in the same GitHub repository. 

### A. Next.js on Vercel
*   **Setup:** Connect your GitHub repo to a new Vercel project. Vercel automatically detects the Next.js `package.json` in the root.
*   **How to do it (Optimize Builds):** You don't want Vercel rebuilding the website if you only edited a Python file. In Vercel Project Settings > Git > Ignored Build Step, enter this command:
    ```bash
    git diff --quiet HEAD^ HEAD ./app ./components ./lib ./public package.json
    ```
    *This tells Vercel: "Only build if files in the Next.js folders changed."*

### B. Python FastAPI on Railway/Render
*   **Setup:** Connect the exact same GitHub repo to Railway or Render.
*   **How to do it:** 
    1. In the platform's settings, change the **Root Directory** from `/` to `agent`.
    2. Set the start command to `fastapi run server.py --host 0.0.0.0`.
    3. The platform will automatically find `agent/requirements.txt` and build the Python environment.

---

## 2. Continuous Integration (The AI Eval Pipeline)
Standard software relies on unit tests. AI software relies on "Eval Pipelines" to ensure prompt tweaks don't cause medical regressions.

### The Dataset
To keep API costs low, we will test the agent against a small, focused dataset of 15 static, pre-defined Telegram conversations:
*   **5 Escalate cases** (e.g., severe vomiting post-op, seizures)
*   **5 Monitor cases** (e.g., mild lethargy, missing one meal)
*   **5 Clear cases** (e.g., "He is doing great, eating normally")

### How to do it (Assert Matching)
You will create a GitHub Action (`.github/workflows/ai-eval.yml`) that runs a Python script on every Pull Request.
Here is a conceptual example of how you write the test script (`agent/tests/test_triage.py`) using simple assertion logic:

```python
import pytest
from core.triage_graph import triage_agent_node

@pytest.mark.parametrize("scenario", load_15_test_cases())
async def test_agent_safety(scenario):
    # 1. Run your agent against the test case
    response = await triage_agent_node({"text": scenario["human_message"], "conversation_text": "", "tool_call_count": 0})
    
    # 2. Assert the AI made the exact correct routing decision
    assert response["output"].decision == scenario["expected_decision"], f"Failed! Expected {scenario['expected_decision']} but got {response['output'].decision}"
```

---

## 3. Database Migrations (Supabase)
As you add the `appointments` and `clinics` tables, you must ensure the database schema updates automatically when code is merged.

### How to do it
1. Use the Supabase CLI locally to make changes: `supabase db diff -f add_appointments_table`
2. Create a GitHub Action `.github/workflows/db-migrate.yml`:
```yaml
name: Deploy Database Migrations
on:
  push:
    branches: [main]
jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: supabase/setup-cli@v1
      - run: supabase db push
        env:
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
```

---

## 4. Continuous Operations (Schedulers / Cron Jobs)
AI platforms require continuous background maintenance.

### A. 7:00 AM Cache Warmer (Pre-fetching Briefs)
*   **Goal:** Pre-generate all AI `/api/brief` summaries for patients coming in that day so the dashboard loads instantly for doctors at 8:00 AM.
*   **How to do it:** Use Vercel Cron. Create a file `app/api/cron/warm-cache/route.ts` that loops through today's appointments and calls the AI logic. Add this to your `vercel.json`:
    ```json
    {
      "crons": [{ "path": "/api/cron/warm-cache", "schedule": "0 7 * * *" }]
    }
    ```

### B. 2:00 AM Memory Consolidation (The Clinic Brain)
*   **Goal:** Synthesize the messy `corrections` and `visits` tables into clean "Clinic SOPs" and save them to the LangGraph `store` table.
*   **How to do it:** Create another Vercel Cron route (`/api/cron/consolidate-memory`) running at `0 2 * * *`. This route queries Supabase, passes the data to Claude to synthesize into generalized rules, and pushes the clean rules to the Python sidecar's memory store.
