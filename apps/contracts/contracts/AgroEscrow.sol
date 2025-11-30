// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AgroEscrow is Ownable {
    enum OrderStatus {
        Held,
        Released,
        Refunded
    }

    struct Order {
        address buyer;
        address seller;
        bytes32 productId;
        uint256 amount;
        OrderStatus status;
    }

    struct Batch {
        uint256 batchId;
        bytes32 hash;
        address creator;
        uint256 timestamp;
    }

    uint256 private _nextOrderId;
    mapping(uint256 => Order) private _orders;
    mapping(uint256 => Batch) private _batches;

    event OrderCreated(uint256 indexed orderId, address indexed buyer, address indexed seller, bytes32 productId, uint256 amount);
    event OrderReleased(uint256 indexed orderId);
    event OrderRefunded(uint256 indexed orderId);
    event BatchHashAnchored(uint256 indexed batchId, bytes32 indexed hash, address indexed creator);
    event BatchTransferred(uint256 indexed batchId, string fromRole, string toRole, string fromName, string toName);

    constructor(address initialOwner) Ownable(initialOwner) {
        require(initialOwner != address(0), "Owner required");
    }

    function createOrder(address seller, bytes32 productId) external payable returns (uint256 orderId) {
        require(seller != address(0), "Invalid seller");
        require(msg.value > 0, "Amount required");

        orderId = ++_nextOrderId;
        _orders[orderId] = Order({
            buyer: msg.sender,
            seller: seller,
            productId: productId,
            amount: msg.value,
            status: OrderStatus.Held
        });

        emit OrderCreated(orderId, msg.sender, seller, productId, msg.value);
    }

    function releaseOrder(uint256 orderId) external onlyOwner {
        Order storage order = _orders[orderId];
        require(order.amount > 0, "Order missing");
        require(order.status == OrderStatus.Held, "Invalid status");

        order.status = OrderStatus.Released;
        (bool success, ) = order.seller.call{value: order.amount}("");
        require(success, "Transfer failed");

        emit OrderReleased(orderId);
    }

    function refundOrder(uint256 orderId) external onlyOwner {
        Order storage order = _orders[orderId];
        require(order.amount > 0, "Order missing");
        require(order.status == OrderStatus.Held, "Invalid status");

        order.status = OrderStatus.Refunded;
        (bool success, ) = order.buyer.call{value: order.amount}("");
        require(success, "Refund failed");

        emit OrderRefunded(orderId);
    }

    function getOrder(uint256 orderId) external view returns (Order memory) {
        return _orders[orderId];
    }

    function nextOrderId() external view returns (uint256) {
        return _nextOrderId + 1;
    }

    function anchorBatchHash(uint256 batchId, bytes32 hash) external {
        require(hash != bytes32(0), "Invalid hash");
        require(_batches[batchId].hash == bytes32(0), "Batch already anchored");

        _batches[batchId] = Batch({
            batchId: batchId,
            hash: hash,
            creator: msg.sender,
            timestamp: block.timestamp
        });

        emit BatchHashAnchored(batchId, hash, msg.sender);
    }

    function getBatch(uint256 batchId) external view returns (Batch memory) {
        return _batches[batchId];
    }

    function isBatchAnchored(uint256 batchId) external view returns (bool) {
        return _batches[batchId].hash != bytes32(0);
    }

    // Record a batch transfer event on-chain for auditability (demo purpose)
    function recordBatchTransfer(
        uint256 batchId,
        string calldata fromRole,
        string calldata toRole,
        string calldata fromName,
        string calldata toName
    ) external {
        require(batchId != 0, "Invalid batchId");
        emit BatchTransferred(batchId, fromRole, toRole, fromName, toName);
    }
}
