# Security Policy (Docs Repo)

This repository is **public**.

Do NOT commit:
- Tokens / API keys / passwords / credentials
- Internal IP addresses, hostnames, SSH commands, firewall details
- Private run logs, incident logs, staging logs

Put internal-only materials in your local workspace under `QuantMate/docs/project-management/` (not committed).

If sensitive info is accidentally committed:
1. Remove it in a new commit.
2. Rotate/revoke any exposed secrets.
3. Consider rewriting git history if required.
