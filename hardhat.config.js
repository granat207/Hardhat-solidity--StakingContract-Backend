require("@nomiclabs/hardhat-waffle");
require("dotenv").config(); 
require("hardhat-coverage"); 
require("@nomicfoundation/hardhat-verify"); 

const sepholia_url = process.env.SEPHOLIA_URL; 
const private_key = process.env.PRIVATE_KEY; 

module.exports = {
solidity: "0.8.7",


networks:{
sepholia:{
url: sepholia_url, 
accounts:[private_key], 
chainId : 11155111, 
},
localhost:{
url: "http://127.0.0.1:8545", 
chainId: 31337,
}
},

};
