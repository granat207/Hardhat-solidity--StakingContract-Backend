// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";

contract ShibaPinu is ERC20 , Ownable, ERC20Burnable, Pausable{


//EVENTS 
event ApprovalEvent(address indexed owner ,address indexed spender, uint256 amount);
event transferEvent(address indexed from, address indexed to,uint256 transferAmount );
event pauseTokenEvent();
event unpauseTokenEvent();
event transferOwnerShipEvent(address indexed newOwner);
event renounceOwnerShipEvent();
event mintEvent(address indexed account , uint256 amount); 
event grantEvent(bytes32 indexed role, address account); 
event beforeTokenTransferEvent(address indexed from,address indexed  to,uint256 amount);
event afterTokenTransferEvent(address indexed from,address indexed  to,uint256 amount);
event increaseAllowanceEvent(address indexed spender, uint256 addedValue); 
event decreaseAllowanceEvent(address indexed spender, uint256 subtractedValue); 
event increaseSafeAllowanceEvent(IERC20 indexed token, address indexed sender, uint256 value); 
event safeDecreaseAllowanceEvent(IERC20 token, address spender, uint256 value); 

   
uint256 public percentBurnedOnDexWhenSwappingWithTransferFrom = 80;

uint256 public percentBurnedOnTransfer = 2;

address public walletFee = 0xA398071aB64A0D2Fe84072c7B0524004BC1030eA;

address public s_owner =  0x0F4b8f37B4c0edcea6053c9A80f80c45852aDcbD; 
    
address internal  presaleAddress; 

address internal stakingAddress;

mapping(address => uint256) public addressToAmountFunded;

address[] public funders;

address public i_owner;

mapping(address => uint256) private _balances;

mapping(address => mapping(address => uint256)) private _allowances;

    
//CONSTRUCTOR 
constructor(uint256 initialSupply) ERC20("ShibaPinu", "SP") {
_mint(msg.sender, initialSupply);
i_owner = msg.sender; 
}

/**
 *@dev here renounce the ownerShip and give that to a 0x00000000000000000000000 address, doing so the 0x000... address will 
 be the owner of the contract, so no one!
 */
function renounceOwnershipFunction() public onlyOwner(){
renounceOwnership();
emit renounceOwnerShipEvent();
}


/**
* 
@dev here set the transferOwnerShipFunction where the ownerShip will be transfered into another address 
*/
function transferOnwerShipFunction(address newOwner) public onlyOwner{
transferOwnership(newOwner);
emit transferOwnerShipEvent(newOwner);
}


/**
* 
*@dev here set the mint Function that will increase the supply and @dev will use those tokens only to 
development and provide liquidity into the uniswap pool 
*/
function mint(address account, uint256 amount) external{
_mint(account, amount);
emit mintEvent(account, amount);
}


/**
* 
*@dev here set the burnTokensFunction that will reduce the total supply
*/
function burnTokensFunction(address account, uint256 amount) public {
_burn(account, amount);
}


function fund() public payable {
addressToAmountFunded[msg.sender] += msg.value;
funders.push(msg.sender);
}
    
        
function withdraw() public onlyOwner {
(bool success, ) = msg.sender.call{value: address(this).balance}(""); 
require(success,"Error when withdraw"); 
}


/**
* 
* @dev set the approveTransaction to let use manually the transferFromWithFee function, with the approveTransaction the spender will 
* have enough allowance to use the transferFromWithFeeFunction
*/
function approveTransaction(address spender,uint256 amount)public returns(bool){
approve(spender, amount);
emit ApprovalEvent( msg.sender, spender, amount);
return true; 
}

  
/**
 * 
 * @dev From here dev set the normal and manually functions to be used in the backed to test, and develop the shibaPinu Dapp 
 */

/**
 * 
 * @dev Set the normal increaseAllowance function to let the spendere transfer his token with the transferFromWithFee function
 * 
 */
function increaseAllowanceFunction(address spender, uint256 addedValue)public onlyOwner() returns(bool){
increaseAllowance(spender, addedValue);
emit increaseAllowanceEvent(spender, addedValue);
return true; 
}


/**
* 
*@dev set the normal decreaseAllowanceFunction to decrease the allowance of a spender
*/
function decreaseAllowanceFunction(address spender, uint256 subtractedValue) public onlyOwner() returns(bool){
decreaseAllowance(spender, subtractedValue);
emit decreaseAllowanceEvent(spender, subtractedValue);
return true; 
}
   

/**
* 
* @dev here set the beforeTokenTransferFunction, that will show before any transfer of the tokens 
*/
function beforeTokenTransferFunction(address from, address to, uint256 amount)internal returns(bool){
_beforeTokenTransfer(from, to, amount);
emit beforeTokenTransferEvent(from, to, amount);
return true; 
}


/**
* 
*@dev here set the afterTokenTransferFunction, that will show after any transfer of the tokens 
*/
function afterTokenTransferFunction(address from, address to, uint256 amount) internal returns(bool){
_afterTokenTransfer(from, to, amount);
emit afterTokenTransferEvent(from, to, amount);
return true; 
}


/**
 * 
 *@dev here set the transferFromWithFee function, in combination with approve transaction, this function 
 *will let transfer the tokens from ad address to an address and with a amount, on this transfer are also 
 *provided a 10% tax; 
 */
function transferFromWithFee(address from, address to, uint256 amount) public returns(bool){
uint256 taxFee = 10 * amount / 100;
uint256 transferAmount = amount - taxFee;
_transfer(from, walletFee, taxFee);
transferFrom(from, to, transferAmount);
emit transferEvent(from, to, transferAmount);
return true;
}
   

/**
 * 
 *@dev here set the transferFunction function where the 2% of the transfer will not goes on a address but it will burned
 */
function transferFunction(address from, address to, uint256 amount) public   {
_transfer(from, to, amount);
emit transferEvent(from, to, amount);
}


/**
*@dev here set the pauseToken, this will be not utilized only if there are some bugs into the contract
*/
function pauseToken() public onlyOwner{
_pause();
emit pauseTokenEvent();
}


/**
* @dev set the unpauseToken
*/
function unpauseToken() public  onlyOwner{
_unpause();
emit unpauseTokenEvent();
}
  

/**
* @dev here show the actual owner of the contract in any moments when it is called 
*/
function Owner() public view returns(address){
return owner();
}


/**
* 
* @dev here set the getBalance where specifying an address it will say how many tokens it has 
*/
function getBalance(address account) public view returns(uint256){
return balanceOf(account);
}


/**
* @dev returns the name of the token
*/
function showName() public pure returns(string memory){
return "ShibaPinu";
} 
  

/**
* @dev return the symbol of the token
*/
function showSymbol() public pure returns(string memory){
return "SP";
}


/**
* @dev here returns the supply, this can be called in any moments 
*/
function supply() public view returns(uint256){
return totalSupply();
}


/**
 *@dev here call the seeAllowance function where when called specifying a contract address, it will says how much allowance i
 *it has 
 */
function seeAllowance(address owner, address spender) external view returns(uint256){
return allowance(owner, spender);
}
    

function setPresaleAddress(address _presaleAddress)public {
presaleAddress = _presaleAddress; 
}

function setStakingAddress(address _stakingaddress)public{
stakingAddress = _stakingaddress; 
}
}

    


    