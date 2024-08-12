const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const { expect } = require("chai");

const { ethers } = require("hardhat");

describe("MyTest", function () {
  async function runEveryTime() {
    const ONE_YEAR_IN_SECONDS = 356 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;

    const lockedAmount = ONE_GWEI;
    const unlockedTime = (await time.latest()) + ONE_YEAR_IN_SECONDS;

    const [owner, otherAccount] = await ethers.getSigners();

    const MyTest = await ethers.getContractFactory("MyTest");
    const myTest = await MyTest.deploy(unlockedTime, { value: lockedAmount });

    return { myTest, unlockedTime, lockedAmount, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should check unlocked time", async function () {
      const { myTest, unlockedTime } = await loadFixture(runEveryTime);

      expect(await myTest.unlockedTime()).to.equal(unlockedTime);
    });

    it("Should set the right owner", async function () {
      const { myTest, owner } = await loadFixture(runEveryTime);

      expect(await myTest.owner()).to.equal(owner.address);
    });

    it("Should receive and store the funds to MyTest", async function () {
      const { myTest, lockedAmount } = await loadFixture(runEveryTime);

      expect(await ethers.provider.getBalance(myTest.getAddress())).to.equal(
        lockedAmount
      );
    });

    it("Should fail if the unlocked is not in the future", async function () {
      const latestTime = await time.latest();

      const MyTest = await ethers.getContractFactory("MyTest");

      await expect(MyTest.deploy(latestTime, { value: 1 })).to.be.revertedWith(
        "Unlocked times should be in future"
      );
    });
  });

  describe("Withdrawals", function () {
    describe("Validations", function () {
      it("Should revert with the right if called to soon", async function () {
        const { myTest } = await loadFixture(runEveryTime);

        await expect(myTest.withdraw()).to.be.revertedWith(
          "Wait till the time period completa"
        );
      });

      it("Should revert the mesage for right owner", async function () {
        const { myTest, unlockedTime, otherAccount } = await loadFixture(
          runEveryTime
        );

        await time.increaseTo(unlockedTime);
        await expect(
          myTest.connect(otherAccount).withdraw()
        ).to.be.revertedWith("Your are not an owner");
      });

      it("Should not fail if the unlockTime has arrived and the owner calls it", async function () {
        const { myTest, unlockedTime } = await loadFixture(runEveryTime);

        await time.increaseTo(unlockedTime);
        await expect(myTest.withdraw()).not.to.be.reverted;
      });
    });
  });

  describe("EVENTS", function () {
    it("Should emit the event on withdrawals", async function () {
      const { myTest, unlockedTime, lockedAmount } = await loadFixture(
        runEveryTime
      );

      await time.increaseTo(unlockedTime);

      await expect(myTest.withdraw())
        .to.emit(myTest, "Withdrawal")
        .withArgs(lockedAmount, anyValue);
    });
  });

  describe("Transfer", function () {
    it("Should transfer the funds to the owner", async function () {
      const { myTest, unlockedTime, lockedAmount, owner } = await loadFixture(
        runEveryTime
      );

      await time.increaseTo(unlockedTime);
      await expect(myTest.withdraw()).to.changeEtherBalances(
        [owner, myTest],
        [lockedAmount, -lockedAmount]
      );
    });
  });

  runEveryTime();
});
