// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";

contract Escrow {
    using SafeERC20 for IERC20;

    enum State { Created, Escrowed, Fulfilled, Cancelled, Refunded }
    State public state;

    address public business;
    address public peer;
    address public arbiter;
    uint256 public amount;
    IERC20 public token;

    event Deposit(address indexed from, uint256 amount, uint256 timestamp);
    event Matched(address indexed peer, uint256 timestamp);
    event Fulfilled(address indexed to, uint256 amount, uint256 timestamp);
    event Cancelled(address indexed by, uint256 timestamp);
    event Refunded(address indexed to, uint256 amount, uint256 timestamp);

    constructor(address _business, address _arbiter, address _token, uint256 _amount) {
        business = _business;
        arbiter = _arbiter;
        token = IERC20(_token);
        amount = _amount;
        state = State.Created;
    }

    // Business approves escrow using EIP-2612 permit
    function deposit(uint256 deadline, uint8 v, bytes32 r, bytes32 s) external {
        require(msg.sender == business, "Only business can deposit");
        require(state == State.Created, "Not in open state");
        // Use IERC20Permit for permit
        IERC20Permit(address(token)).permit(business, address(this), amount, deadline, v, r, s);
        token.safeTransferFrom(business, address(this), amount);
        state = State.Escrowed;
        emit Deposit(msg.sender, amount, block.timestamp);
    }

    // Match peer after escrow is funded
    function matchPeer(address _peer) external {
        require(state == State.Escrowed, "Escrow not funded");
        require(peer == address(0), "Peer already matched");
        require(_peer != address(0), "Cannot match zero address");
        peer = _peer;
        emit Matched(_peer, block.timestamp);
    }

    // Peer confirms fulfillment, funds released to peer
    function fulfill() external {
        require(msg.sender == peer, "Only matched peer");
        require(state == State.Escrowed, "Not in escrowed state");
        token.safeTransfer(peer, amount);
        state = State.Fulfilled;
        emit Fulfilled(peer, amount, block.timestamp);
    }

    // Authorized party cancels, refund to business (escrow or pre-deposit)
    function cancel() external {
        require(msg.sender == business || msg.sender == arbiter, "Not authorized");
        require(state == State.Escrowed || state == State.Created, "Cannot cancel");
        token.safeTransfer(business, amount);
        state = State.Cancelled;
        emit Cancelled(msg.sender, block.timestamp);
    }

    // Arbiter can forcibly refund if dispute etc.
    function refund() external {
        require(msg.sender == arbiter, "Only arbiter can refund");
        require(state == State.Escrowed, "Not in escrow state");
        token.safeTransfer(business, amount);
        state = State.Refunded;
        emit Refunded(business, amount, block.timestamp);
    }
}
