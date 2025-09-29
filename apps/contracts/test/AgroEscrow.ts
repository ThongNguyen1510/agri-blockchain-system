import { expect } from "chai";
import { ethers } from "hardhat";

describe("AgroEscrow", () => {
  it("creates an order and holds funds", async () => {
    const [owner, seller, buyer] = await ethers.getSigners();
    const AgroEscrow = await ethers.getContractFactory("AgroEscrow");
    const escrow = await AgroEscrow.deploy(owner.address);
    await escrow.waitForDeployment();

    const amount = ethers.parseEther("1");
    const productId = ethers.encodeBytes32String("BATCH-001");

    const orderId = await escrow
      .connect(buyer)
      .callStatic.createOrder(seller.address, productId, { value: amount });

    await expect(
      escrow
        .connect(buyer)
        .createOrder(seller.address, productId, { value: amount })
    )
      .to.emit(escrow, "OrderCreated")
      .withArgs(orderId, buyer.address, seller.address, productId, amount);

    const stored = await escrow.getOrder(orderId);
    expect(stored.buyer).to.equal(buyer.address);
    expect(stored.seller).to.equal(seller.address);
    expect(stored.amount).to.equal(amount);
    expect(stored.status).to.equal(0);

    const contractBalance = await ethers.provider.getBalance(
      await escrow.getAddress()
    );
    expect(contractBalance).to.equal(amount);
  });
});
