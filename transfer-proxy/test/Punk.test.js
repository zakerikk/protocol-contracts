const CryptoPunksMarket = artifacts.require("CryptoPunksMarket.sol");
const PunkTransferProxy = artifacts.require("PunkTransferProxy.sol")

const { Asset } = require("../order");
const { expectThrow } = require("@daonomic/tests-common");
const { id, enc } = require("../assets");
const truffleAssert = require('truffle-assertions');

/*Proxy  buy punk, sfter Proxy transfer punk to buyer */
contract("Exchange with PunkTransfer proxies", accounts => {
  let punkIndex = 256;
  let punkIndex2 = 255;
  let punkIndex3 = 254;
  let punkIndex4 = 253;
  let proxy;

  before(async () => {
    cryptoPunksMarket = await CryptoPunksMarket.new();
    await cryptoPunksMarket.allInitialOwnersAssigned(); //allow test contract work with Punk CONTRACT_OWNER accounts[0]
    proxy = await PunkTransferProxy.new();;
    await proxy.__OperatorRole_init();
//    await proxy.addOperator(operator);
  });

	it("Proxy transfer punk", async () => {
	  const operator = accounts[1]
	  const newOwner = accounts[2];
    await proxy.addOperator(operator);

    await cryptoPunksMarket.getPunk(punkIndex, { from: operator }); //operator - owner punk with punkIndex
    await cryptoPunksMarket.offerPunkForSaleToAddress(punkIndex, 0, proxy.address, { from: operator }); //operator - wants to sell punk with punkIndex, min price 0 wei

    assert.equal(await cryptoPunksMarket.balanceOf(operator), 1); //punk owner - operator
    const encodedPunkData = await enc(cryptoPunksMarket.address, punkIndex);

    await proxy.transfer(Asset(id("PUNK"), encodedPunkData, 1), operator, newOwner, { from: operator });
    assert.equal(await cryptoPunksMarket.balanceOf(operator), 0);
    assert.equal(await cryptoPunksMarket.balanceOf(proxy.address), 0);
    assert.equal(await cryptoPunksMarket.balanceOf(newOwner), 1);//punk owner - newOwner
  })

  it("Try to transfer punk, which not offer to sale, throw", async () => {
	  const operator = accounts[3]
	  const newOwner = accounts[4];
    await proxy.addOperator(operator);

    await cryptoPunksMarket.getPunk(punkIndex2, { from: operator }); //operator - owner punk with punkIndex2
    await cryptoPunksMarket.offerPunkForSaleToAddress(punkIndex2, 0, proxy.address, { from: operator }); //operator - wants to sell punk to proxy with punkIndex2, min price 0 wei
    let anotherPunkIndex = 300;
    assert.equal(await cryptoPunksMarket.balanceOf(operator), 1); //punk owner operator
    const encodedPunkData = await enc(cryptoPunksMarket.address, anotherPunkIndex);

    await expectThrow(
      proxy.transfer(Asset(id("PUNK"), encodedPunkData, 1), operator, newOwner, { from: operator })
    );
  })

  it("Try to transfer punk, which offer not for proxy.address, throw", async () => {
	  const operator = accounts[5]
	  const newOwner = accounts[6];
    await proxy.addOperator(operator);

    await cryptoPunksMarket.getPunk(punkIndex3, { from: operator }); //operator - owner punk with punkIndex3
    await cryptoPunksMarket.offerPunkForSaleToAddress(punkIndex3, 0, newOwner, { from: operator }); //operator - wants to sell punk to accounts[2]  with punkIndex3, min price 0 wei

    assert.equal(await cryptoPunksMarket.balanceOf(operator), 1); //punk owner operator
    const encodedPunkData = await enc(cryptoPunksMarket.address, punkIndex3);

    await expectThrow(
      proxy.transfer(Asset(id("PUNK"), encodedPunkData, 1), operator, newOwner, { from: operator })
    );
  })

  it("Check punk event", async () => {
	  const operator = accounts[7]
	  const newOwner = accounts[8];
	  await proxy.addOperator(operator);

    await cryptoPunksMarket.getPunk(punkIndex4, { from: operator }); //operator - owner punk with punkIndex4
    let addressTo;
    let index;
    let price;
    let resOffer = await cryptoPunksMarket.offerPunkForSaleToAddress(punkIndex4, 5, proxy.address, { from: operator }); //operator - wants to sell punk with punkIndex4, min price 0 wei
    truffleAssert.eventEmitted(resOffer, 'PunkOffered', (ev) => {
      addressTo = ev.toAddress;
      index = ev.punkIndex;
      price = ev.minValue;
      return true;
    });
    assert.equal(addressTo, proxy.address);
    assert.equal(index, punkIndex4);
    assert.equal(price, 5);
  })
});
