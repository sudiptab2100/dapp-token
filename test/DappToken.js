var DappToken = artifacts.require("./DappToken.sol");

_deploy_contracts('DappToken', function(accounts){

    it('sets the totalsupply upon deployment', function() {
        return DappToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply) {
            assert.equal(totalSupply.toNumber(), 1000000, 'Set totalSupply to 1 mill')
        })
    })
})