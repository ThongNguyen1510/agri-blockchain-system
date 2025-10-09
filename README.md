# AgroChain Monorepo

AgroChain is a monorepo that hosts the demo supply-chain marketplace for agricultural products.
It contains the web app, API gateway, and smart contracts used for escrow-based trading and
traceability experiments.

## Repository layout
- `apps/frontend`: Next.js + Tailwind + wagmi/RainbowKit consumer web app.
- `apps/backend`: NestJS API using Prisma against Microsoft SQL Server.
- `apps/contracts`: Hardhat workspace with the `AgroEscrow` smart contract.
- `docs/`: product brief, requirements, flows, and setup notes.

## Current status (29/09/2025)
- Done: monorepo scaffolding for frontend, backend, and contracts.
- Done: Prisma schema mapped to the existing SQL Server tables and client generation tested.
- Done: Backend authentication (JWT login/register), Swagger docs, and seed users wired up.
- Done: Hardhat local network deploys `AgroEscrow` and the frontend connects via WalletConnect/MetaMask.
- Next: implement product/order APIs, integrate the escrow flow, and design admin tools.

## Prerequisites
- Node.js 18.x (npm 10 or later).
- Microsoft SQL Server Express/Developer running locally with a `sa` account.
- MetaMask browser extension (or any WalletConnect-compatible wallet).
- Windows PowerShell or Command Prompt. When PowerShell blocks scripts, prefix commands with `cmd /c ...`.

## Quick setup for teammates
If someone is onboarding, they can run the helper script after cloning:

- **Windows PowerShell**
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser RemoteSigned   # only once if needed
  ./scripts/setup.ps1                                   # installs packages & prisma client
  ```
- **Git Bash / WSL / macOS**
  ```bash
  chmod +x scripts/setup.sh  # first time only
  ./scripts/setup.sh
  ```

The script runs `npm ci` inside `apps/frontend`, `apps/backend`, `apps/contracts`, and generates the Prisma Client. Use `--SkipPrisma` (PowerShell) or `--skip-prisma` (bash) if the database is not ready yet.
## Local run guide
### 1. Backend (NestJS + Prisma)
```bash
cd apps/backend
copy .env.example .env      # update DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN
cmd /c npm install          # or run via Command Prompt
cmd /c npx prisma generate
cmd /c npm run prisma:seed   # optional: seeds admin/seller/buyer demo users
cmd /c npm run start:dev
```
Keep this terminal open; the API listens on `http://localhost:3000` by default. Swagger UI is served at `http://localhost:3000/docs`.

### 2. Contracts (Hardhat)
```bash
cd apps/contracts
cmd /c npm install
cmd /c npx hardhat node     # terminal A keeps the local chain alive
```
Open a second terminal for deployment:
```bash
cd apps/contracts
cmd /c npm run deploy:local # shows the deployed AgroEscrow address
```
Note the contract address for the frontend `.env`.

### 3. Frontend (Next.js)
```bash
cd apps/frontend
cmd /c npm install
copy .env.example .env
```
Edit `.env`:
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your WalletConnect project id>
NEXT_PUBLIC_CONTRACT_ADDRESS=<address from deploy:local>
```
Then start the dev server:
```bash
cmd /c npm run dev
```
If port 3000 is busy, Next.js will pick 3001/3002; open the URL it prints in the console.

## MetaMask and Hardhat setup
1. Install the MetaMask extension, then create or unlock a wallet.
2. Add the Hardhat network manually:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`
3. Import one of the private keys printed by `npx hardhat node` (each account has 10,000 test ETH).
4. On the web app, click the **Connect Wallet** button and approve the connection in MetaMask.

## Documentation
Additional notes and diagrams live under `docs/`:
- `docs/product-brief.md`
- `docs/requirements.md`
- `docs/flows/batch-order-flow.mmd`
- `docs/runbook.md` (detailed local run and troubleshooting)

## Troubleshooting tips
- `npm.ps1 cannot be loaded`: run commands via `cmd /c ...` or set `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
- Port already in use (3000 or 8545): stop the running process (`Ctrl+C`) or use `Stop-Process -Id <PID>` after inspecting `Get-NetTCPConnection`.
- Hardhat compiler errors about UTF-8 BOM: rewrite files with UTF-8 encoding without BOM (already fixed in this repo).
- Missing MetaMask async storage module: run `npm install @react-native-async-storage/async-storage` in `apps/frontend`.

## Next steps
- Implement Batch/Product/Order CRUD endpoints and connect them to the frontend.
- Wire frontend flows (dashboard, orders, disputes) to the new auth-protected APIs.
- Extend `AgroEscrow` with dispute handling and tie events into `AuditLog`.
- Add automated tests and CI pipelines (lint/test) for all modules.
