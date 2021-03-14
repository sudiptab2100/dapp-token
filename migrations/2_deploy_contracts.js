const DappToken = artifacts.require("DappToken");
const DappTokenSale = artifacts.require("DappTokenSale");
const tokenPrice = 1000000000000000; // in wei

module.exports = function (deployer) {
  deployer.deploy(DappToken, 1000000).then(function() {
    return deployer.deploy(DappTokenSale, DappToken.address, tokenPrice);
  });
};
