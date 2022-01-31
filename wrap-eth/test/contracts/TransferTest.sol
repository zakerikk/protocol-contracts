// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "../../contracts/WETHTest.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";

/*Test transfer contract*/
contract TransferTest is Initializable {
    WETHTest public wETHTest;
    function __TransferTest_init_unchained(WETHTest _wETHTest) public initializer {
        wETHTest = _wETHTest;
    }

    receive() external payable {
    }

    //send WETH by 4 times
    function transferWETH(uint amount, uint nAmount, address from, address[] memory adrAccounts) external {
        uint num = amount / nAmount;
        for (uint i = 0; i < num; i++) {
            wETHTest.transferFrom(from, adrAccounts[i], nAmount);
        }
    }

    //withdraw and transfer ETH by 4 times
    function transferETH(uint amount, uint nAmount, address from, address payable[] memory adrAccounts) external {
        uint num = amount / nAmount;
        for (uint i = 0; i < num; i++) {
            wETHTest.transferFrom(from, address(this), nAmount);
            wETHTest.withdraw(nAmount);
            adrAccounts[i].transfer(nAmount);
        }
    }

    //withdraw once and transfer ETH by 4 times
    function withdrawTransferETH(uint amount, uint nAmount, address from, address payable[] memory adrAccounts) external {
        uint num = amount / nAmount;
        wETHTest.transferFrom(from, address(this), amount);
        wETHTest.withdraw(amount);
        for (uint i = 0; i < num; i++) {
            adrAccounts[i].transfer(nAmount);
        }
    }

}
