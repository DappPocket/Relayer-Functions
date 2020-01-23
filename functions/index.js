const functions = require('firebase-functions');
const ethers = require('ethers');

// Relayer Wallet
const priKey = '0x0DBBE8E4AE425A6D2687F1A7E3BA17BC98C673636790F1B8AD91193C05875EF1';
const address = '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef';
const defaultProvider = ethers.getDefaultProvider('ropsten');
const wallet = new ethers.Wallet(priKey, defaultProvider);

// Test Target Contract
const contractAddress = '0x07637624e1de92a886C2f37A219C1749784D5367'; // Test contract address
const CONTRACT_ABI = [ { "constant": false, "inputs": [ { "internalType": "address", "name": "nodder", "type": "address" }, { "internalType": "uint256", "name": "nodNum", "type": "uint256" }, { "internalType": "uint256", "name": "nodMultiplier", "type": "uint256" } ], "name": "nod", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "smiler", "type": "address" }, { "internalType": "uint256", "name": "smileNum", "type": "uint256" } ], "name": "smile", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "signer", "type": "address" }, { "internalType": "bytes4", "name": "method", "type": "bytes4" }, { "internalType": "bytes", "name": "params", "type": "bytes" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }, { "internalType": "uint8", "name": "v", "type": "uint8" } ], "name": "verifyMeta", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "NOD_METHOD_IDENTIFIER", "outputs": [ { "internalType": "bytes4", "name": "", "type": "bytes4" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "NOD_METHOD_SIG", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "nods", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "SMILE_METHOD_IDENTIFIER", "outputs": [ { "internalType": "bytes4", "name": "", "type": "bytes4" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "SMILE_METHOD_SIG", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "smiles", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" } ];
const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, defaultProvider);

// Tests
wallet.getBalance()
    .then((res) => {
        console.log(res.toString());
    })
    .catch((err) => {
        console.log(err);
    });
contract.smiles(address).then(console.log);

// Get relayer balance
const relayerBalance = functions.https.onRequest((request, response) => {
    wallet.getBalance()
        .then(function(res) {
            response.send({ amount: res.toString() });
        })
        .catch(function(err) {
            response.status(401).send({ error: err });
        });
});

// Smile
const relayerSmile = functions.https.onRequest((request, response) => {
    const { num } = request.body;
    const contractWithRelayer = contract.connect(wallet);
    contractWithRelayer.smile(address, num)
        .then((res) => {
            response.send({ hash: res.hash });
        })
        .catch((err) => {
            response.status(401).send({ error: err });
        });
});

// Meta Tx (Verify Tx)
const relayerMetaTx = functions.https.onRequest((request, response) => {
    const { contractAddress, signer, method, param, r, s, v } = request.body;
    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, defaultProvider);
    const contractWithRelayer = contract.connect(wallet);
    contractWithRelayer.verifyMeta(signer, method, param, r, s, v)
        .then((res) => {
            response.send({ hash: res.hash });
        })
        .catch((err) => {
            response.status(401).send({ error: err });
        });
});

exports.relayerSmile = relayerSmile;
exports.relayerMetaTx= relayerMetaTx;
exports.relayerBalance = relayerBalance;