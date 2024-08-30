const hre = require("hardhat");

async function main() {
  const Token = await hre.ethers.getContractFactory("Token");

  const token = await Token.deploy();

  await token.waitForDeployment();

  console.log("deployed to:", token.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying contract:", error);
    process.exit(1);
  });
