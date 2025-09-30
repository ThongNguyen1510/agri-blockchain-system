# Runbook - Local Environment

This guide captures the exact steps we validated on 29/09/2025 to boot the AgroChain stack on a Windows machine.

## 1. Prerequisites
- Node.js 18.x and npm 10+ available in PATH
- SQL Server Express/Developer running on `localhost:1433`
- Git, PowerShell, and Command Prompt
- MetaMask browser extension

> Execution policy: If PowerShell blocks `npm`/`npx` (`npm.ps1 cannot be loaded`), prefix commands with `cmd /c ...` or run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once.

## 2. Database
1. Create the `AgroChain` database and tables (if not already present) using the T-SQL script in the project notes.
2. Copy `apps/backend/.env.example` to `.env` and set `DATABASE_URL="sqlserver://sa:<password>@localhost:1433;database=AgroChain;encrypt=true;trustServerCertificate=true"`.

### Quick install script
Instead of running each command manually you can execute the helper script after cloning:
- PowerShell: `./scripts/setup.ps1`
- Git Bash / macOS: `./scripts/setup.sh`

Add `--SkipPrisma` (PowerShell) or `--skip-prisma` (bash) if the database is not configured yet.
## 3. Backend (NestJS + Prisma)
```bash
cd apps/backend
cmd /c npm install
cmd /c npx prisma generate     # schema already maps to existing tables
cmd /c npm run start:dev
```
Output should contain `Nest application successfully started`. Leave the process running.

## 4. Hardhat network and contract
Terminal A:
```bash
cd apps/contracts
cmd /c npm install
cmd /c npx hardhat node
```
Terminal B:
```bash
cd apps/contracts
cmd /c npm run deploy:local
```
Record the deployed address, for example `AgroEscrow deployed to: 0x5FbD...0aa3`.

## 5. Frontend (Next.js)
```bash
cd apps/frontend
cmd /c npm install
copy .env.example .env
```
Edit `.env` with your WalletConnect project id and the contract address from step 4. Start the UI:
```bash
cmd /c npm run dev
```
If port 3000 is busy, Next.js switches to the next free port (3001 or 3002).

## 6. MetaMask setup
1. Add the network manually with RPC `http://127.0.0.1:8545`, Chain ID `31337`, symbol `ETH`.
2. Import one of the private keys printed by Hardhat; each account owns 10,000 test ETH.
3. Visit the frontend URL and click **Connect Wallet** to authorise access.

## 7. Troubleshooting checklist
- Port 8545 already in use: run `Get-NetTCPConnection -LocalPort 8545` then `Stop-Process -Id <PID>`.
- UTF-8 BOM parser errors: rewrite the affected file with UTF-8 (no BOM).
- Missing async storage module: run `cmd /c npm install @react-native-async-storage/async-storage` inside `apps/frontend`.
- Hardhat not starting: ensure no other node instance is active and remove `cache/` and `artifacts/` if needed.

## 8. Next actions
- Implement API endpoints for batches, products, and orders.
- Build UI flows for sellers and buyers (create batch/product, place order, confirm receipt).
- Extend the smart contract with dispute handling and map on-chain events to `AuditLog` entries.

Keep this runbook updated as the stack evolves.