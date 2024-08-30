const { expect } = require("chai");
const { ethers } = require("hardhat");

const {
  isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe("Token contract", () => {
  let Token;
  let hardhatToken;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addrs;

  beforeEach(async () => {
    Token = await ethers.getContractFactory("Token");
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
    hardhatToken = await Token.deploy();
  });

  describe("Deployment", () => {
    it("Check Name", async () => {
      expect(await hardhatToken.name()).to.equal("HardHat Token");
    });

    it("Check Symbol", async () => {
      expect(await hardhatToken.symbol()).to.equal("HHT");
    });

    it("Check Total", async () => {
      expect(await hardhatToken.totalSupply()).to.equal(10000);
    });
  });

  describe("Owner Balance", () => {
    it("Deployment should assign the total supply of tokens to the owner", async () => {
      const ownerBalance = await hardhatToken.balanceOf(owner.address);
      expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transaction", () => {
    it("Should transfer tokens between accounts", async () => {
      await hardhatToken.transfer(addr1.address, 10);
      expect(await hardhatToken.balanceOf(addr1.address)).to.equal(10);

      await hardhatToken.connect(addr1).transfer(addr2.address, 5);
      expect(await hardhatToken.balanceOf(addr2.address)).to.equal(5);

      await hardhatToken.connect(owner).transfer(addr3.address, 500);
      expect(await hardhatToken.balanceOf(addr3.address)).to.equal(500);
    });

    it("Should fail if sender does not have enough tokens", async () => {
      // /const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);
      await expect(
        hardhatToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("Not enought tokens");
    });
  });
});
