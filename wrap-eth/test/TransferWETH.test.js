const wETHTest = artifacts.require("WETHTest.sol");
const transferTest = artifacts.require("TransferTest.sol");

const { expectThrow, verifyBalanceChange} = require("@daonomic/tests-common");
//const { sign } = require('./mint');

contract("Test transfer WETH ", accounts => {

  let token;
  let transfer;
  let tokenOwner = accounts[9];
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  let toAccounts = [accounts[5], accounts[6], accounts[7], accounts[8]]


  beforeEach(async () => {
    token = await wETHTest.new();
    transfer = await transferTest.new();
    await transfer.__TransferTest_init_unchained(token.address);
  });

  it("1. Send WETH by 4 times", async () => {
    await token.deposit({from: tokenOwner, value: 1000});
    await token.approve(transfer.address, 1000, {from: tokenOwner});
    let tx = await transfer.transferWETH(1000, 250, tokenOwner, toAccounts);
    console.log("1. Send WETH by 4 times used gas:", tx.receipt.gasUsed);
    assert.equal(await token.balanceOf(accounts[5]), 250);
    assert.equal(await token.balanceOf(accounts[6]), 250);
    assert.equal(await token.balanceOf(accounts[7]), 250);
    assert.equal(await token.balanceOf(accounts[8]), 250);
    assert.equal(await token.balanceOf(tokenOwner), 0);
  });

  it("withdraw and transfer ETH by 4 times", async () => {
    await token.deposit({from: tokenOwner, value: 1000});
    assert.equal(await token.balanceOf(tokenOwner), 1000);
    await token.approve(transfer.address, 1000, {from: tokenOwner});
    let tx = await transfer.transferETH(1000, 250, tokenOwner, toAccounts, {from: tokenOwner});
//    await verifyBalanceChange(accounts[5], -250, () =>
//     	verifyBalanceChange(accounts[6], -250, () =>
//       	verifyBalanceChange(accounts[7], -250, () =>
//       	  verifyBalanceChange(accounts[8], -250, () =>
//         	  transfer.transferETH(1000, 250, tokenOwner, toAccounts, {from: tokenOwner})
//         	)
//        )
//      )
//    )
    console.log("2. withdraw and transfer ETH by 4 times used gas:", tx.receipt.gasUsed);
    assert.equal(await token.balanceOf(tokenOwner), 0);
    assert.equal(await token.balanceOf(accounts[5]), 0);
    assert.equal(await token.balanceOf(accounts[6]), 0);
    assert.equal(await token.balanceOf(accounts[7]), 0);
    assert.equal(await token.balanceOf(accounts[8]), 0);

  });

  it("withdraw once and transfer ETH by 4 times", async () => {
    await token.deposit({from: tokenOwner, value: 1000});
    assert.equal(await token.balanceOf(tokenOwner), 1000);
    await token.approve(transfer.address, 1000, {from: tokenOwner});
    let tx = await transfer.withdrawTransferETH(1000, 250, tokenOwner, toAccounts, {from: tokenOwner});
//    await verifyBalanceChange(accounts[5], -250, () =>
//     	verifyBalanceChange(accounts[6], -250, () =>
//       	verifyBalanceChange(accounts[7], -250, () =>
//       	  verifyBalanceChange(accounts[8], -250, () =>
//         	  transfer.withdrawTransferETH(1000, 250, tokenOwner, toAccounts, {from: tokenOwner})
//         	)
//        )
//      )
//    )
    console.log("3. withdraw once and transfer ETH by 4 times used gas:", tx.receipt.gasUsed);
    assert.equal(await token.balanceOf(tokenOwner), 0);
    assert.equal(await token.balanceOf(accounts[5]), 0);
    assert.equal(await token.balanceOf(accounts[6]), 0);
    assert.equal(await token.balanceOf(accounts[7]), 0);
    assert.equal(await token.balanceOf(accounts[8]), 0);
  });


});