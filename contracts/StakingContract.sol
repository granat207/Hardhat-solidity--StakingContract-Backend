//SPDX-License-Identifier:MIT 

//THIS IS A STAKING USING MINT METHOD

pragma solidity ^0.8.7; 

import "contracts/ShibaPinu.sol"; 

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract StakingContract{

error UserHasNotEnoughtTokensToStake(); // --> This happens when user has not enought tokens to stake.

event StakedTokens(address indexed staker,  uint256 amount); 

event ClaimedRewards(address indexed claimer, uint256 amount); 

event UnstakeEvent(address indexed stakingContract, address indexed unstaker, uint256 amount); 

/* 
@dev here set the stake description when a user stake tokens.
*/
struct StakeDescription{
uint256 amount;
uint256 tokenTimeStamp; 
}

bool public canStake;   // --> Is staking active or not?

address public s_owner; // --> Returns the owner of the contract

address public shibaPinuAddress; // --> Returns the shibaPinu ERC20 address

address public s_recipient; // --> Returns the recipient address(should be this address)

constructor(address owner){
s_owner = owner; 
}

uint256 public api = 10; // --> API 10%

//User to amount of tokens he staked
mapping(address => uint256)public addressToTokensStaked; 

//User to all the times he staked, and the stakes descritpions(with amount and timestamps)
mapping(address => StakeDescription[])public addressToTimestampsDone; 

//User to the amount of rewards reduced(this increase all the time when a claim is called by the user, and increase with the amont of the claim
mapping(address => uint256)public addressToAmountOfRewardsReduced; 

//User to the amount of staked tokens, if  user has nothing into stake, this should be 0.
mapping(address => uint256)public addressToTokensUnstaked; 

modifier isOwner(){
require(msg.sender == s_owner, "Sender is not the owner!"); 
_;
}

//*
//dev here set the function to let users stake their tokens
//*
function stake(uint256 amount)public{
require(canStake == true, "Staking is not avaible"); 
// uint256 amountInWei = amount * 1e18; 
uint256 userTokens = getUserBalance();
if(amount <= userTokens){
addressToTokensStaked[msg.sender] = addressToTokensStaked[msg.sender] + amount; 
ShibaPinu(shibaPinuAddress).transferFunction(msg.sender,s_recipient, amount); 
StakeDescription memory newUserStake = StakeDescription({
amount: amount, 
tokenTimeStamp: block.timestamp
}); 
addressToTimestampsDone[msg.sender].push(newUserStake); 
emit StakedTokens(msg.sender, amount);
}else{
revert UserHasNotEnoughtTokensToStake(); 
}
}


//*
//dev here set the function to let users unstake their tokens
//*
function unstake(uint256 amount)public{
require(addressToTokensStaked[msg.sender] >= amount, "User cant unstake those amount of tokens");
claimStakingRewards();
addressToTokensStaked[msg.sender] = addressToTokensStaked[msg.sender] - amount; 
ShibaPinu(shibaPinuAddress).transferFunction(s_recipient, msg.sender, amount); 
addressToTokensUnstaked[msg.sender] = addressToTokensUnstaked[msg.sender] + amount; 
emit UnstakeEvent(address(this), msg.sender, amount);
}


//*
//dev here set the function to let users claim their rewards
//*
function claimStakingRewards()public{
uint256 rewardsClaimable = getRewards();
ShibaPinu(shibaPinuAddress).mint(msg.sender, rewardsClaimable);
addressToAmountOfRewardsReduced[msg.sender] = addressToAmountOfRewardsReduced[msg.sender] + rewardsClaimable; 
emit ClaimedRewards(msg.sender, rewardsClaimable);
}


//*
//dev here set the function to be able to let users see the amountable amount of tokens claimable
//*
function getRewards() public view returns (uint256) {
require(addressToTokensStaked[msg.sender] > 0,"User has not tokens staked");
uint256 amountLowableFromUnstakedTokens = addressToTokensUnstaked[msg.sender]; 
uint256 totalAmountStaked; 
uint256 totalTimeStampsDifference = 0; 
StakeDescription[] memory getStakings = addressToTimestampsDone[msg.sender];
uint256 totalRewards = 0;
for (uint256 a = 0; a < getStakings.length; a++) {
totalAmountStaked += getStakings[a].amount;
uint256 timestamp = getStakings[a].tokenTimeStamp;
totalTimeStampsDifference += block.timestamp - timestamp; 
//I used the economic interests formula to calculate the rewards when a user stake his tokens with a 10% APY(10% per year).
uint256 calculateRewards = (api * (totalAmountStaked - amountLowableFromUnstakedTokens) * totalTimeStampsDifference) / 3153600000; // --> why 3153600000? because it's the total number of seconds in a year. Solidity with timestamps works with seconds, so i decided to use this formula.
// I don't know if this is used much also in others protocols, however this works so no problem rigth?
totalRewards += calculateRewards;
}
return (totalRewards - addressToAmountOfRewardsReduced[msg.sender]); 
}


//*
//@dev here set the function to abilitate staking.
//*
function setCanStake()public isOwner(){
canStake = true; 
}


//*
//@dev here set  the function to disabilitate staking, this will be not used, only if contracts its subject to attacks, or if team need to modify the staking contract for emergency(rarely this will activate)
//*
function setCantStake()public isOwner(){
canStake = false;
}


//*
//@dev here set  the function to let users see if staking is active or not
//*
function returnIfCanStake()public view returns(bool){
return canStake; 
}

//*
//@dev here set the function to set the ERC20 token ShibaPinu, and interact with his internal function.
//*
function setShibaPinuAddress(address newAddress)public isOwner(){
shibaPinuAddress = newAddress; 
}


//*
//dev here set the function to return the user balance of the ERC20 token ShibaPinu
//*
function getUserBalance()public view returns(uint256){
return ShibaPinu(shibaPinuAddress).getBalance(msg.sender); 
}


//*
//dev here set the function to set the recipient address(should be this one)
//*
function setRecipient(address recipient)public isOwner{
s_recipient = recipient; 
}


//*
//dev here set the function to return the balance of the recipient
//*
function seeRecipientBalance()public view returns(uint256){
return ShibaPinu(shibaPinuAddress).getBalance(s_recipient); 
}


//*
//This function is identical to getRewards.
//*
function returnRewardsClaimable()public view returns(uint256){
return getRewards();
}


//*
//This function returns the array of every claim rewards that user did
//*
function seeAddressToTimestampsDone()public view returns(StakeDescription[] memory){
return addressToTimestampsDone[msg.sender]; 
}


//*
//This function returns the actual number of the user token staked
//*
function returnAddressToTokenStaked()public view returns(uint256){
return addressToTokensStaked[msg.sender]; 
}


//*
//This function returns the total amount of users rewards reduced
//*
function returnAddressToAmountofRewardsReduced()public view returns(uint256){
return addressToAmountOfRewardsReduced[msg.sender]; 
}


//*
//This function returns the total amount of the user tokens unstaked
//*
function returnAddressToTokensUnstaked()public view returns(uint256){
return addressToTokensUnstaked[msg.sender]; 
}
}