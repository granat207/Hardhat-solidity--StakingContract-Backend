const {ethers} = require("hardhat"); 

const {assert, expect } = require("chai"); 
const { getAddress } = require("ethers/lib/utils");


//NOTE: All these tests are been used with the hardhat localhost, if you want to reply the tests below to ensure they works, you shuld add hardhat localhost (chainId is 31337) in you're hardhat.config file


describe("StakingContract", async function(){
let contractFactory; 
let contract; 
let contractAddress; 
let account1;
let account1address; 
let account2; 
let account2address;
let erc20Factory;
let erc20; 
let erc20Address; 
beforeEach(async function(){
account1 = await ethers.getSigner("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"); 
account1address = account1.getAddress(); 
account2 = await ethers.getSigner("0x70997970c51812dc3a010c7d01b50e0d17dc79c8"); 
account2address = account2.getAddress(); 
contractFactory = await ethers.getContractFactory("StakingContract"); 
contract = await contractFactory.deploy(account1address); 
contractAddress = contract.address; 
await contract.deployed(); 

erc20Factory = await ethers.getContractFactory("ShibaPinu"); 
erc20 = erc20Factory.deploy("8000000000000000"); 
erc20Address = (await erc20).address; 
})

//INITALS VARIABLES
describe("Initials variables", async function(){
it("At start canStake should be false", async function(){
const can = await contract.connect(account1).returnIfCanStake(); 
assert.equal("false",can.toString()); 
})
it("At start s_owner should be correctly the owner creator", async function(){
const getOwner = await contract.connect(account1).s_owner(); 
assert.equal(getOwner.toString(),"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")  
})
it("At start the shiba pinu address without being setted should be a 0x0000...address", async function(){
const getShibaPinuAddress = await contract.connect(account1).shibaPinuAddress(); 
assert.equal(getShibaPinuAddress.toString(),"0x0000000000000000000000000000000000000000"); 
})
it("At start the recipient address without being setted should be a 0x0000...address", async function(){
const getRecipientPinuAddress = await contract.connect(account1).s_recipient(); 
assert.equal(getRecipientPinuAddress.toString(),"0x0000000000000000000000000000000000000000"); 
})
it("The api returned should be 10", async function(){
const getApi = await contract.connect(account1).api(); 
assert.equal(getApi.toString(),"10"); 
})
it("At start the addressToTokensStaked amount should be 0", async function(){
const getAmount = await contract.connect(account1).returnAddressToTokenStaked(); 
assert.equal(getAmount.toString(),"0"); 
})
it("At start the addressToTimestampsDone length should be 0", async function(){
const getAmount = await contract.connect(account1).seeAddressToTimestampsDone(); 
const getSize = getAmount.length; 
assert.equal(getSize.toString(),"0"); 
})
it("At start the addressToAmountOfRewardsReduced amount should be 0", async function(){
const getAmount = await contract.connect(account1).returnAddressToAmountofRewardsReduced(); 
assert.equal(getAmount.toString(),"0"); 
})
it("At start the addressToTokensUnstaked amount should be 0", async function(){
const getAmount = await contract.connect(account1).returnAddressToTokensUnstaked(); 
assert.equal(getAmount.toString(),"0"); 
})
})


//canStake
describe("canStake function", async function(){
it("If user is not the owner, he can set the stake as active", async function(){
await expect(contract.connect(account2).setCanStake()).to.be.revertedWith("Sender is not the owner!"); 
})
it("If user is the owner can set stake as active", async function(){
await contract.connect(account1).setCanStake(); 
})
it("If the stake is active, the function returnIfCanStake should returns true", async function(){
await contract.connect(account1).setCanStake(); 
const can = await contract.connect(account1).returnIfCanStake(); 
assert.equal("true",can.toString()); 
})
})

//can't stake
describe("setCantStake function", async function(){
it("If user is not the owner, he can set the stake as not active", async function(){
await expect(contract.connect(account2).setCantStake()).to.be.revertedWith("Sender is not the owner!"); 
})
it("If user is the owner can set stake as not active", async function(){
await contract.connect(account1).setCantStake(); 
})
it("If the stake is not active, the function returnIfCanStake should returns false", async function(){
await contract.connect(account1).setCanStake(); 
await contract.connect(account1).setCantStake(); 
const can = await contract.connect(account1).returnIfCanStake(); 
assert.equal("false",can.toString()); 
})
})

//set recipient
describe("setRecipient function", async function(){
it("If the sender is not the owner can set the recipient", async function(){
await expect(contract.connect(account2).setRecipient(contractAddress.toString())).to.be.revertedWith("Sender is not the owner!"); 
})
it("Can set the recipient successfully", async function(){
await contract.connect(account1).setRecipient(contractAddress.toString()); 
})
it("If the recipient is setted, s_recipient variable should returns it", async function(){
await contract.connect(account1).setRecipient(contractAddress.toString()); 
const getRecipientPinuAddress = await contract.connect(account1).s_recipient(); 
assert.equal(getRecipientPinuAddress.toString(),contractAddress.toString()); 
})
})

//set token erc20 address
describe("setShibaPinuAddress function", async function(){
it("If sender is not the owner can't set the erc20 address", async function(){
await expect(contract.connect(account2).setShibaPinuAddress(erc20Address.toString())).to.be.revertedWith("Sender is not the owner!"); 
})
it("If sender is the owner can succesfully set the erc20 address", async function(){
await contract.connect(account1).setShibaPinuAddress(erc20Address.toString())
})
it("After setted the erc20 address,shibaPinuAddress variable should returns it", async function(){
await contract.connect(account1).setShibaPinuAddress(erc20Address.toString())
const getShibaPinuAddress = await contract.connect(account1).shibaPinuAddress(); 
assert.equal(getShibaPinuAddress.toString(),erc20Address.toString()); 
})
})

//STAKE
describe("stake function", async function(){
it("Can't stake if stake is not active", async function(){
await expect(contract.connect(account1).stake("10000000")).to.be.revertedWith("Staking is not avaible"); 
})
it("Can't stake if user has not enough tokens", async function(){
await contract.connect(account1).setCanStake(); 
await contract.connect(account1).setShibaPinuAddress(erc20Address.toString())
await expect(contract.connect(account2).stake("1000000")).to.be.revertedWith("UserHasNotEnoughtTokensToStake");
})

it("If user has enough tokens he can successfully stakes", async function(){
await contract.connect(account1).setShibaPinuAddress(erc20Address.toString())
await contract.connect(account1).setRecipient(contractAddress.toString()); 
await contract.connect(account1).setCanStake(); 
await contract.connect(account1).stake("8000000000000000"); 
})
it("After staking the address to tokens staked should increase proportionally", async function(){
await contract.connect(account1).setShibaPinuAddress(erc20Address.toString())
await contract.connect(account1).setRecipient(contractAddress.toString()); 
await contract.connect(account1).setCanStake(); 
const stake_ =  await contract.connect(account1).stake("8000000000000000"); 
await stake_.wait(1); 
const returnAddressStakedTokens = await contract.connect(account1).returnAddressToTokenStaked(); 
assert.equal(returnAddressStakedTokens.toString(),"8000000000000000"); 
})
it("If an account stakes, and others not, if they returns the address ToTokenStaked function should Returns 0", async function(){
await contract.connect(account1).setShibaPinuAddress(erc20Address.toString())
await contract.connect(account1).setRecipient(contractAddress.toString()); 
await contract.connect(account1).setCanStake(); 
const stake_ =  await contract.connect(account1).stake("8000000000000000"); 
await stake_.wait(1); 
const returnAddressStakedTokens = await contract.connect(account2).returnAddressToTokenStaked(); 
assert.equal(returnAddressStakedTokens.toString(),"0"); 
})
it("After staking, the tokens should be in the staking contract balance", async function(){
await contract.connect(account1).setShibaPinuAddress(erc20Address.toString())
await contract.connect(account1).setRecipient(contractAddress.toString()); 
await contract.connect(account1).setCanStake(); 
const stake_ =  await contract.connect(account1).stake("8000000000000000"); 
await stake_.wait(1); 
const getBalance = await contract.connect(account1).seeRecipientBalance(); 
assert.equal(getBalance.toString(), "8000000000000000");
})
it("After staking, user should not have more his tokens in his wallet", async function(){
await contract.connect(account1).setShibaPinuAddress(erc20Address.toString())
await contract.connect(account1).setRecipient(contractAddress.toString()); 
await contract.connect(account1).setCanStake(); 
const stake_ =  await contract.connect(account1).stake("8000000000000000"); 
await stake_.wait(1); 
const getBalance = await contract.connect(account1).getUserBalance();
assert.equal(getBalance.toString(), "0");
})
it("Before do any staking, the address to timestamps done length should be 0", async function(){
const seeTimestamps = await contract.connect(account1).seeAddressToTimestampsDone(); 
const getLength = seeTimestamps.length; 
assert.equal(getLength.toString(),"0"); 
})
it("After staking, the address to timestamps done length should increase +1", async function(){
await contract.connect(account1).setShibaPinuAddress(erc20Address.toString())
await contract.connect(account1).setRecipient(contractAddress.toString()); 
await contract.connect(account1).setCanStake(); 
const stake_ =  await contract.connect(account1).stake("8000000000000000"); 
await stake_.wait(1); 
const seeTimestamps = await contract.connect(account1).seeAddressToTimestampsDone(); 
const getLength = seeTimestamps.length; 
assert.equal(getLength.toString(),"1"); 
})
it("After staking, in the addressToUserTimestamp mapping should be returned the right amount", async function(){
await contract.connect(account1).setShibaPinuAddress(erc20Address.toString())
await contract.connect(account1).setRecipient(contractAddress.toString()); 
await contract.connect(account1).setCanStake(); 
const stake_ =  await contract.connect(account1).stake("8000000000000000"); 
await stake_.wait(1); 
const seeTimestamps = await contract.connect(account1).seeAddressToTimestampsDone(); 
const getElement = seeTimestamps[0][0]; 
assert.equal("8000000000000000", getElement.toString()); 
})
it("After staking, the addressToUserTimestamp mapping should be returned the timestamp correctly", async function(){
await contract.connect(account1).setShibaPinuAddress(erc20Address.toString())
await contract.connect(account1).setRecipient(contractAddress.toString()); 
await contract.connect(account1).setCanStake(); 
const stake_ =  await contract.connect(account1).stake("8000000000000000"); 
await stake_.wait(1); 
const seeTimestamps = await contract.connect(account1).seeAddressToTimestampsDone(); 
const getElement = seeTimestamps[0][1]; 
console.log("Timestamp when staking has been " + getElement.toString()); 
})
})


//GET REWARDS
describe("getRewards function", async function(){
it("Return correctly the rewards (so the claimable amount)", async function(){
await contract.connect(account1).setShibaPinuAddress(erc20Address.toString())
await contract.connect(account1).setRecipient(contractAddress.toString()); 
await contract.connect(account1).setCanStake(); 
const stake_ =  await contract.connect(account1).stake("8000000000000000"); 
await stake_.wait(1); 
await network.provider.send("evm_increaseTime", [1000]); 
await contract.connect(account1).returnRewardsClaimable(); 
})
})


//CLAIM REWARDS
describe("claimStakingRewards function", async function(){
it("User can claim tokens rewards successfully", async function(){
await contract.connect(account1).setShibaPinuAddress(erc20Address.toString())
await contract.connect(account1).setRecipient(contractAddress.toString()); 
await contract.connect(account1).setCanStake(); 
const stake_ =  await contract.connect(account1).stake("8000000000000000"); 
await stake_.wait(1); 
const claim = await contract.connect(account1).claimStakingRewards(); 
await claim.wait(1); 
})
})


//UNSTAKE TOKENS
describe("unstakeTokens function", async function(){
it("User must have the tokens staked to be able to stake them", async function(){
await expect(contract.connect(account1).unstake("8000000000000000")).to.be.revertedWith("User cant unstake those amount of tokens"); 
})
it("If user has the tokens staked, he can successfully unstake them", async function(){
await contract.connect(account1).setShibaPinuAddress(erc20Address.toString())
await contract.connect(account1).setRecipient(contractAddress.toString()); 
await contract.connect(account1).setCanStake(); 
const stake_ =  await contract.connect(account1).stake("8000000000000000"); 
await stake_.wait(1); 
const unstake = await contract.connect(account1).unstake("4000000000000000"); 
await unstake.wait(1); 
})
it("After unstaking tokens, the mapping addressToTokensStaked should decrease proportionally", async function(){
await contract.connect(account1).setShibaPinuAddress(erc20Address.toString())
await contract.connect(account1).setRecipient(contractAddress.toString()); 
await contract.connect(account1).setCanStake(); 
const stake_ =  await contract.connect(account1).stake("8000000000000000"); 
await stake_.wait(1); 
const unstake = await contract.connect(account1).unstake("4000000000000000"); 
await unstake.wait(1); 
const returnAddressStakedTokens = await contract.connect(account1).returnAddressToTokenStaked(); 
assert.equal(returnAddressStakedTokens.toString(),"4000000000000000")
})
it("After the unstake of the tokens, the contract balance should decrease proportionally", async function(){
await contract.connect(account1).setShibaPinuAddress(erc20Address.toString())
await contract.connect(account1).setRecipient(contractAddress.toString()); 
await contract.connect(account1).setCanStake(); 
const stake_ =  await contract.connect(account1).stake("8000000000000000"); 
await stake_.wait(1); 
const unstake = await contract.connect(account1).unstake("4000000000000000"); 
await unstake.wait(1); 
const getBalance = await contract.connect(account1).seeRecipientBalance(); 
assert.equal(getBalance.toString(), "4000000000000000");
})
it("After the unstake of the tokens,the user should at least gets back his tokens staked", async function(){
await contract.connect(account1).setShibaPinuAddress(erc20Address.toString())
await contract.connect(account1).setRecipient(contractAddress.toString()); 
await contract.connect(account1).setCanStake(); 
const getBalanceBeforeStaking = await contract.connect(account1).getUserBalance(); 
const stake_ =  await contract.connect(account1).stake("8000000000000000"); 
await stake_.wait(1); 
const unstake = await contract.connect(account1).unstake("8000000000000000"); 
await unstake.wait(1); 
const getBalanceAfterUnstaking = await contract.connect(account1).getUserBalance(); 
const isAtLeastHigher = getBalanceAfterUnstaking >= getBalanceBeforeStaking; 
assert.equal(isAtLeastHigher.toString(),"true"); 
})
it("Before the first user unstake the addressToTokensUnstaked should be 0", async function(){
await contract.connect(account1).setShibaPinuAddress(erc20Address.toString())
await contract.connect(account1).setRecipient(contractAddress.toString()); 
await contract.connect(account1).setCanStake(); 
const stake_ =  await contract.connect(account1).stake("8000000000000000"); 
await stake_.wait(1); 
const tokensUnstakedSoFar = await contract.connect(account1).returnAddressToTokensUnstaked(); 
assert.equal(tokensUnstakedSoFar.toString(),"0"); 
})
it("After the first unstake of tokens the addressToTokensUnstaked should increase proportionally to the tokens unstaked tx", async function(){
await contract.connect(account1).setShibaPinuAddress(erc20Address.toString())
await contract.connect(account1).setRecipient(contractAddress.toString()); 
await contract.connect(account1).setCanStake(); 
const stake_ =  await contract.connect(account1).stake("8000000000000000"); 
await stake_.wait(1); 
const unstake = await contract.connect(account1).unstake("8000000000000000"); 
await unstake.wait(1); 
const tokensUnstakedSoFar = await contract.connect(account1).returnAddressToTokensUnstaked(); 
assert.equal(tokensUnstakedSoFar.toString(),"8000000000000000"); 
})
it("After multiples unstakes, the addressToTokensUnstaked should increase proportionally", async function(){
await contract.connect(account1).setShibaPinuAddress(erc20Address.toString())
await contract.connect(account1).setRecipient(contractAddress.toString()); 
await contract.connect(account1).setCanStake(); 
const stake_ =  await contract.connect(account1).stake("8000000000000000"); 
await stake_.wait(1); 
const unstake = await contract.connect(account1).unstake("2000000000000000"); 
await unstake.wait(1); 
const unstake2= await contract.connect(account1).unstake("2000000000000000"); 
await unstake2.wait(1); 
const unstake3 = await contract.connect(account1).unstake("2000000000000000"); 
await unstake3.wait(1); 
const tokensUnstakedSoFar = await contract.connect(account1).returnAddressToTokensUnstaked(); 
assert.equal(tokensUnstakedSoFar.toString(),"6000000000000000"); 
})
})
})