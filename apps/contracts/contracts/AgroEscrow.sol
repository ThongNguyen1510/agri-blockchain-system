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

    uint256 private _nextOrderId;
    mapping(uint256 => Order) private _orders;

    event OrderCreated(uint256 indexed orderId, address indexed buyer, address indexed seller, bytes32 productId, uint256 amount);
    event OrderReleased(uint256 indexed orderId);
    event OrderRefunded(uint256 indexed orderId);

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
}
