import { ethers, artifacts } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying AgroEscrow with account:", deployer.address);

  const AgroEscrow = await ethers.getContractFactory("AgroEscrow");
  const contract = await AgroEscrow.deploy(deployer.address);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("AgroEscrow deployed to:", address);

  // Export address & abi to frontend for easy consumption
  // Fallback: if monorepo sibling path differs, compute from repo root
  const candidateDirs = [
    path.resolve(__dirname, "../../frontend/src/contracts"),
    path.resolve(__dirname, "../../../frontend/src/contracts"),
    path.resolve(process.cwd(), "../frontend/src/contracts"),
  ];
  let outDir = candidateDirs.find((p) => {
    try { fs.mkdirSync(p, { recursive: true }); return true; } catch { return false; }
  });
  if (!outDir) {
    // Last resort: create next to contracts package for manual copy
    outDir = path.resolve(__dirname, "../exported-contracts");
    fs.mkdirSync(outDir, { recursive: true });
  }

  const addressFile = path.join(outDir, "agro-escrow.address.json");
  fs.writeFileSync(addressFile, JSON.stringify({ address }, null, 2));
  console.log("Saved address to:", addressFile);

  const artifact = await artifacts.readArtifact("AgroEscrow");
  const abiFile = path.join(outDir, "agro-escrow.abi.json");
  fs.writeFileSync(abiFile, JSON.stringify(artifact.abi, null, 2));
  console.log("Saved ABI to:", abiFile);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
