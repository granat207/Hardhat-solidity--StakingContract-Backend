const {ethers, run, networks} = require("hardhat"); 

//DEPLOY SCRIPT FOR THE ERC20 TOKEN

async function deploy(){
const contractFactory = await ethers.getContractFactory("ShibaPinu"); 
const contract = await contractFactory.deploy("8000000000000000"); 
console.log("Contract is deploying...."); 
await contract.deployed(); 
console.log("Contract is deployed!!! Contract address is " + contract.address); 
}
deploy(); 