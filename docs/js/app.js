// const { default: Web3 } = require("web3");

App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,

    init: function() {
        console.log("App Initialized...");
        return App.initWeb3();
    },

    initWeb3: function() {
        // if (typeof web3 !== 'undefined') {
        if (window.ethereum) {
            // If a web3instance is already is already provided by Meta Mask
            // App.web3Provider = web3.currentProvider;
            // web3 = new Web3(web3.currentProvider);
            console.log("MetaMask Installed.");
            App.web3Provider = window.ethereum;
            window.web3 = new Web3(window.ethereum);
            window.ethereum.enable();
        } else {
            // Specify default instance if no web3 instance provided
            // App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            App.web3Provider = new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/482690ddac7b4c9fabae7cb9c3f75dc1');
            window.web3 = new Web3(window.ethereum);
        }

        return App.initContracts();
    },

    initContracts: function() {
        $.getJSON("DappTokenSale.json", function(dappTokenSale) {
            App.contracts.DappTokenSale = TruffleContract(dappTokenSale);
            App.contracts.DappTokenSale.setProvider(App.web3Provider);
            App.contracts.DappTokenSale.deployed().then(function(dappTokenSale) {
                console.log("Dapp Token Sale Address: ", dappTokenSale.address);
            });
        }).done(function() {
            $.getJSON("DappToken.json", function(dappToken) {
                App.contracts.DappToken = TruffleContract(dappToken);
                App.contracts.DappToken.setProvider(App.web3Provider);
                App.contracts.DappToken.deployed().then(function(dappToken) {
                    console.log("Dapp Token Address: ", dappToken.address);
                });
            });
        }).done(function() {
            App.listenForEvents();
            return App.render();
        });

        // return App.render();
    },

    // Listen for events emitted from the contract
    listenForEvents: function() {
        App.contracts.DappTokenSale.deployed().then(function(instance) {
            // console.log(instance);
            // const event = instance.Sell(null, {
            //     fromBlock: 0,
            //     toBlock: 'latest',
            // }).watch(function(error, event) {
            //     console.log("event triggered ", event);
            //     App.render();
            // });

            instance.Sell({
                filter: {},
                fromBlock: 0
            }, function(error, event) { 
                console.log(event); 
                App.render(); 
            });
        });
    },

    render: function() {
        if(App.loading) {
            return;
        }
        App.loading = true;
        var loader = $('#loader');
        var content = $('#content');

        loader.show();
        content.hide();

        // Load Account Data
        web3.eth.getCoinbase(function(err, account) {
            if(err === null) {
                App.account = account;
                $('#accountAddress').html("Your Account: " + account);
            }
        })

        // Load token sale contract
        App.contracts.DappTokenSale.deployed().then(function(instance) {
            dappTokenSaleInstance = instance;
            return dappTokenSaleInstance.tokenPrice();
        }).then(function(tokenPrice) {
            App.tokenPrice = tokenPrice;
            var tokenPriceInEther = web3.utils.fromWei(App.tokenPrice, 'ether');
            $('.token-price').html(tokenPriceInEther);
            return dappTokenSaleInstance.tokensSold();
        }).then(function(tokensSold) {
            App.tokensSold = tokensSold.toNumber();
            $('.tokens-sold').html(App.tokensSold);
            $('.tokens-available').html(App.tokensAvailable);

            var progressPercent = (App.tokensSold/App.tokensAvailable)*100;
            $('#progress').css('width', progressPercent + '%');

            // Load Token Contract
            App.contracts.DappToken.deployed().then(function(instance) {
                dappTokenInstance = instance;
                return dappTokenInstance.balanceOf(App.account);
            }).then(function(balance) {
                $('.dapp-balance').html(balance.toNumber());

                App.loading = false;
                loader.hide();
                content.show();
            });
        });
    },

    buyTokens: function() {
        $('#content').hide();
        $('#loader').show();
        var numberOfTokens = $('#numberOfTokens').val();
        App.contracts.DappTokenSale.deployed().then(function(instance) {
            return instance.buyTokens(numberOfTokens, {
                from: App.account,
                value: numberOfTokens * App.tokenPrice,
                gas: 500000
            });
        }).then(function(result) {
            console.log('Tokens bought...');
            $('form').trigger('reset'); // reset number of tokens in form

            // $('#loader').hide();
            // $('#content').show();
            // Wait for Sell event
        });
    }
}

$(function() {
    $(window).load(function() {
        App.init();
    })
});