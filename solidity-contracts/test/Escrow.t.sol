// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Escrow.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract ERC20PermitMock is ERC20Permit {
    constructor(string memory name, string memory symbol)
        ERC20(name, symbol)
        ERC20Permit(name)
    {}
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract EscrowTest is Test {
    Escrow escrow;
    ERC20PermitMock token;
    address business = vm.addr(1);
    address arbiter = vm.addr(2);
    address peer = vm.addr(3);
    uint256 amount = 1_000e18;

    function setUp() public {
        token = new ERC20PermitMock("MockToken", "MOCK");
        token.mint(business, amount);
        escrow = new Escrow(business, arbiter, address(token), amount);
    }

    function getPermitSig(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline
    ) internal returns (uint8 v, bytes32 r, bytes32 s) {
        uint256 nonce = token.nonces(owner);
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"),
                owner, spender, value, nonce, deadline
            )
        );
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", token.DOMAIN_SEPARATOR(), structHash)
        );
        (v, r, s) = vm.sign(1, digest); // business's private key
    }

    // Happy path
    function test_DepositWithPermitMatchAndFulfill() public {
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = getPermitSig(business, address(escrow), amount, deadline);
        vm.prank(business);
        escrow.deposit(deadline, v, r, s);

        assertEq(token.balanceOf(address(escrow)), amount);
        assertEq(uint(escrow.state()), uint(Escrow.State.Escrowed));

        escrow.matchPeer(peer);
        assertEq(escrow.peer(), peer);

        vm.prank(peer);
        escrow.fulfill();

        assertEq(token.balanceOf(peer), amount);
        assertEq(uint(escrow.state()), uint(Escrow.State.Fulfilled));
    }

    function test_RevertIfNotBusinessDeposits() public {
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = getPermitSig(business, address(escrow), amount, deadline);
        vm.prank(arbiter);
        vm.expectRevert("Only business can deposit");
        escrow.deposit(deadline, v, r, s);
    }

    function test_RevertIfDepositTwice() public {
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = getPermitSig(business, address(escrow), amount, deadline);
        vm.prank(business);
        escrow.deposit(deadline, v, r, s);

        (v, r, s) = getPermitSig(business, address(escrow), amount, deadline);
        vm.prank(business);
        vm.expectRevert("Not in open state");
        escrow.deposit(deadline, v, r, s);
    }

    function test_RevertIfMatchPeerWhenNotEscrowed() public {
        vm.expectRevert("Escrow not funded");
        escrow.matchPeer(peer);
    }

    function test_RevertIfMatchPeerTwice() public {
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = getPermitSig(business, address(escrow), amount, deadline);
        vm.prank(business);
        escrow.deposit(deadline, v, r, s);
        escrow.matchPeer(peer);

        vm.expectRevert("Peer already matched");
        escrow.matchPeer(vm.addr(4));
    }

    function test_RevertIfPeerCancels() public {
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = getPermitSig(business, address(escrow), amount, deadline);
        vm.prank(business);
        escrow.deposit(deadline, v, r, s);

        vm.prank(peer);
        vm.expectRevert("Not authorized");
        escrow.cancel();
    }

    function test_RevertIfFulfillWrongPeerOrState() public {
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = getPermitSig(business, address(escrow), amount, deadline);
        vm.prank(business);
        escrow.deposit(deadline, v, r, s);
        escrow.matchPeer(peer);

        // Not peer
        vm.prank(arbiter);
        vm.expectRevert();
        escrow.fulfill();

        // Fulfill before matching (not escrowed state)
        Escrow escrow2 = new Escrow(business, arbiter, address(token), amount);
        vm.prank(peer);
        vm.expectRevert("Not in escrowed state");
        escrow2.fulfill();
    }

    function test_CancelByBusinessAfterDeposit() public {
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = getPermitSig(business, address(escrow), amount, deadline);
        vm.prank(business);
        escrow.deposit(deadline, v, r, s);

        vm.prank(business);
        escrow.cancel();

        assertEq(token.balanceOf(business), amount);
        assertEq(uint(escrow.state()), uint(Escrow.State.Cancelled));
    }

    function test_CancelByArbiterAfterDeposit() public {
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = getPermitSig(business, address(escrow), amount, deadline);
        vm.prank(business);
        escrow.deposit(deadline, v, r, s);

        vm.prank(arbiter);
        escrow.cancel();

        assertEq(token.balanceOf(business), amount);
        assertEq(uint(escrow.state()), uint(Escrow.State.Cancelled));
    }

    function test_RefundByArbiter() public {
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = getPermitSig(business, address(escrow), amount, deadline);
        vm.prank(business);
        escrow.deposit(deadline, v, r, s);

        vm.prank(arbiter);
        escrow.refund();

        assertEq(token.balanceOf(business), amount);
        assertEq(uint(escrow.state()), uint(Escrow.State.Refunded));
    }

    function test_RevertIfRefundNotArbiter() public {
        uint256 deadline = block.timestamp + 1 days;
        (uint8 v, bytes32 r, bytes32 s) = getPermitSig(business, address(escrow), amount, deadline);
        vm.prank(business);
        escrow.deposit(deadline, v, r, s);

        vm.prank(peer);
        vm.expectRevert("Only arbiter can refund");
        escrow.refund();
    }

    function test_RevertIfRefundWrongState() public {
        vm.prank(arbiter);
        vm.expectRevert("Not in escrow state");
        escrow.refund();
    }
}
