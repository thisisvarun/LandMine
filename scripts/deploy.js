const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners(); // Uses Account #1 (index 1)
  
  console.log("Deploying with account:", deployer.address);

  const LandRegistry = await hre.ethers.getContractFactory("LandRegistry");
  const landRegistry = await LandRegistry.deploy();
  
  await landRegistry.waitForDeployment();
  console.log("Contract deployed to:", await landRegistry.getAddress());
  console.log("Government address:", await landRegistry.govtAddress());
}

main().catch(console.error);