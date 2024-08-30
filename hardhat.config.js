require("@nomicfoundation/hardhat-toolbox");

const ALCHEMY_API_KEY = "";
const ROPSTEN_PRIVATE_KEY = "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    arbitrum: {
      url: ALCHEMY_API_KEY,
      accounts: [`0x${ROPSTEN_PRIVATE_KEY}`],
    },
  },
};
