# Prerequisites

Before starting the onboarding, gather the following information and prepare credentials.

## Project Information

1. **GitHub owner** — your GitHub username or organization name.
   - Check if it's a user or org (CLI):
     ```bash
     gh api users/<owner> --jq '.type'
     ```
2. **System domain** — the business domain for your project (e.g. Book Store, Flight Reservation, Task Planner).
   - Do NOT choose eShop (the instructor uses that as an example).
   - Avoid your company's actual domain for NDA compliance.
3. **System name** — a name for your system (e.g. ACME Shop, SkyBook).
4. **Repo name** — derived from system name by hyphenating and lowercasing (e.g. "ACME Shop" → `acme-shop`).
   - Check if it already exists (CLI):
     ```bash
     gh repo view <owner>/<repo> 2>&1
     ```
   - If it exists, append a random suffix (e.g. `acme-shop-7f3a`).
5. **Monolith language** — Java, .NET, TypeScript, or Other.
6. **System test language** — same as monolith, or different (common when dev and QA teams use different languages).
7. **Architecture** — Monolith or multi-component. If multi-component, decide on the components (e.g. frontend, backend).
8. **Repository strategy** — Mono-repo or multi-repo. Multi-repo only makes sense with multi-component.

## Credentials

> **Note:** The credentials below will be set on your GitHub repository. You don't need the repository to exist yet — just have the credentials ready. You'll set them on the repository during [Setup](01-monolith-setup.md) after creating it.

### Docker Hub

1. Create a Docker Hub account at [hub.docker.com](https://hub.docker.com) if you don't have one (browser).
2. Create an access token at [Docker Hub Security Settings](https://hub.docker.com/settings/security) (browser).
3. Note your Docker Hub username and token — you'll set them on your repository in the Setup step.

### SonarCloud

1. Create a SonarCloud token — see [SonarCloud Setup](02a-monolith-sonarcloud-setup.md) (browser).
2. Note the token — you'll set it on your repository in the SonarCloud Setup step.

## Checklist

1. Project information is decided
2. Docker Hub account and access token are ready
3. SonarCloud token is ready (can be deferred until SonarCloud Setup step)
