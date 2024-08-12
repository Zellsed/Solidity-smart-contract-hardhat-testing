const hre = require("hardhat");

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const ONE_YEARS_IN_SECONDS = 365 * 24 * 60 * 60;
  const unlockedTime = currentTimestampInSeconds + ONE_YEARS_IN_SECONDS;

  const lockedAmount = hre.ethers.parseEther("1");

  const MyTest = await hre.ethers.getContractFactory("MyTest");
  const myTest = await MyTest.deploy(unlockedTime, { value: lockedAmount });
  await myTest.waitForDeployment();

  // console.log(`address: ${await myTest.getAddress()}`);
  // console.log(myTest);
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});
