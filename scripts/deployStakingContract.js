const {ethers, run, networks} = require("hardhat"); 

//DEPLOY SCRIPT FOR StakingContract

async function deploy(){
const contractFactory = await ethers.getContractFactory("StakingContract"); 
const contract = await contractFactory.deploy("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"); 
console.log("Contract is deploying...."); 
await contract.deployed(); 
console.log("Contract is deployed!!! Contract address is " + contract.address); 


//SET STAKING ACTIVE
const setstakeactive = await contract.setCanStake(); 
console.log("Setting stake as active..............")
await setstakeactive.wait(1); 
console.log("✅ Setted"); 
//SET SHIBA PINU TOKEN
const setShibaPinu = await contract.setShibaPinuAddress("0x771EC8E0bA8af2B5A102A15b470d628b4347ddaf"); 
console.log("Setting ShibaPinu Address............")
await setShibaPinu.wait(1); 
console.log("✅ Setted"); 
//SET RECIPIENT 
const setRecipient = await contract.setRecipient(contract.address); 
console.log("Setting the recipient address.........")
await setRecipient.wait(1); 
console.log("✅ Setted"); 

}
deploy(); 