// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";

contract BiDirectionalEscrow {
    using SafeERC20 for IERC20;

    enum State {
        Created,
        FundedByLP,
        LPNotifiedOffchainSent,
        LPConfirmed,
        FundedByUser,
        UserNotifiedOffchainSent,
        UserConfirmed,
        Fulfilled,
        Cancelled,
        Refunded
    }

    State public state;

    address public immutable user;
    address public immutable arbiter;
    address public liquidityProvider;
    uint256 public immutable amount;
    IERC20 public immutable token;

    event FundedByLP(address indexed provider, uint256 amount, uint256 timestamp);
    event LPNotifiedOffchainSent(address indexed toUser, uint256 timestamp);
    event LPConfirmed(address indexed user, uint256 timestamp);
    event FundedByUser(address indexed user, uint256 amount, uint256 timestamp);
    event UserNotifiedOffchainSent(address indexed toLP, uint256 timestamp);
    event UserConfirmed(address indexed lp, uint256 timestamp);
    event Fulfilled(address indexed to, uint256 amount, uint256 timestamp);
    event Cancelled(address indexed by, uint256 timestamp);
    event Refunded(address indexed to, uint256 amount, uint256 timestamp);

    modifier onlyUser() {
        require(msg.sender == user, "Only user");
        _;
    }
    modifier onlyArbiter() {
        require(msg.sender == arbiter, "Only arbiter");
        _;
    }
    modifier onlyLP() {
        require(msg.sender == liquidityProvider, "Only LP");
        _;
    }

    constructor(address _user, address _arbiter, address _token, uint256 _amount) {
        require(_user != address(0) && _arbiter != address(0) && _token != address(0), "Zero address");
        user = _user;
        arbiter = _arbiter;
        token = IERC20(_token);
        amount = _amount;
        state = State.Created;
    }

    /// @notice LP funds escrow for user withdrawal
    function fundByLP(uint256 deadline, uint8 v, bytes32 r, bytes32 s) external {
        require(state == State.Created, "Wrong state");
        liquidityProvider = msg.sender;
        IERC20Permit(address(token)).permit(liquidityProvider, address(this), amount, deadline, v, r, s);
        token.safeTransferFrom(liquidityProvider, address(this), amount);
        state = State.FundedByLP;
        emit FundedByLP(liquidityProvider, amount, block.timestamp);
    }

    /// @notice LP signals cash sent to user (off-ramp)
    function lpNotifyOffChainSent() external onlyLP {
        require(state == State.FundedByLP, "Wrong state");
        state = State.LPNotifiedOffchainSent;
        emit LPNotifiedOffchainSent(user, block.timestamp);
    }

    /// @notice User confirms receipt of cash from LP (off-ramp)
    function lpConfirmReceived() external onlyUser {
        require(state == State.LPNotifiedOffchainSent, "Wrong state");
        state = State.Fulfilled;
        token.safeTransfer(liquidityProvider, amount);
        emit LPConfirmed(user, block.timestamp);
        emit Fulfilled(liquidityProvider, amount, block.timestamp);
    }

    /// @notice User funds escrow for LP withdrawal (on-ramp)
    function fundByUser(uint256 deadline, uint8 v, bytes32 r, bytes32 s) external onlyUser {
        require(state == State.Created, "Wrong state");
        IERC20Permit(address(token)).permit(user, address(this), amount, deadline, v, r, s);
        token.safeTransferFrom(user, address(this), amount);
        state = State.FundedByUser;
        emit FundedByUser(user, amount, block.timestamp);
    }

    /// @notice User signals cash sent to LP (on-ramp)
    function userNotifyOffChainSent() external onlyUser {
        require(state == State.FundedByUser, "Wrong state");
        state = State.UserNotifiedOffchainSent;
        emit UserNotifiedOffchainSent(liquidityProvider, block.timestamp);
    }

    /// @notice LP confirms receipt of cash from user (on-ramp)
    function userConfirmReceived() external onlyLP {
        require(state == State.UserNotifiedOffchainSent, "Wrong state");
        state = State.Fulfilled;
        token.safeTransfer(user, amount);
        emit UserConfirmed(liquidityProvider, block.timestamp);
        emit Fulfilled(user, amount, block.timestamp);
    }

    /// @notice Cancel operation
    function cancel() external {
        require(state == State.FundedByLP || state == State.LPNotifiedOffchainSent || state == State.FundedByUser || state == State.UserNotifiedOffchainSent, "Not cancellable");
        require(msg.sender == user || msg.sender == arbiter, "Not authorized");
        State prev = state;
        state = State.Cancelled;
        if (prev == State.FundedByLP || prev == State.LPNotifiedOffchainSent) {
            token.safeTransfer(liquidityProvider, amount);
            emit Refunded(liquidityProvider, amount, block.timestamp);
        } else {
            token.safeTransfer(user, amount);
            emit Refunded(user, amount, block.timestamp);
        }
        emit Cancelled(msg.sender, block.timestamp);
    }

    /// @notice Arbiter refund for dispute or failed transaction
    function refund() external onlyArbiter {
        require(state == State.FundedByLP || state == State.LPNotifiedOffchainSent || state == State.FundedByUser || state == State.UserNotifiedOffchainSent, "Not refundable");
        State prev = state;
        state = State.Refunded;
        if (prev == State.FundedByLP || prev == State.LPNotifiedOffchainSent) {
            token.safeTransfer(liquidityProvider, amount);
            emit Refunded(liquidityProvider, amount, block.timestamp);
        } else {
            token.safeTransfer(user, amount);
            emit Refunded(user, amount, block.timestamp);
        }
    }
}
