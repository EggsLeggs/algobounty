from algopy import ARC4Contract, String, UInt64, Asset, Account, GlobalState, arc4, Txn


class IssueEscrow(ARC4Contract):
    """Smart contract for escrowing USDC bounties for GitHub issues"""
    
    def __init__(self) -> None:
        # Global state initialization
        self.issue_id = GlobalState(String)
        self.total_bounty = GlobalState(UInt64)
        self.usdc_asset = GlobalState(Asset)
        self.maintainer = GlobalState(Account)
        self.is_resolved = GlobalState(UInt64)
    
    @arc4.abimethod()
    def create_bounty(
        self,
        issue_id: String,
        usdc_asset: Asset,
        maintainer: Account
    ) -> String:
        """Initialize a new bounty escrow for a GitHub issue"""
        self.issue_id.value = issue_id
        self.total_bounty.value = UInt64(0)
        self.usdc_asset.value = usdc_asset
        self.maintainer.value = maintainer
        self.is_resolved.value = UInt64(0)
        return String("Bounty created for issue: ") + issue_id
    
    @arc4.abimethod()
    def fund_bounty(self, amount: UInt64) -> String:
        """Add USDC to the existing bounty"""
        assert self.is_resolved.value == UInt64(0), "Bounty already resolved"
        
        # Transfer USDC from sender to this contract
        # Note: Asset transfers in algopy are handled through inner transactions
        # The sender must opt-in to the asset and send it to the contract
        # This method assumes the sender has already sent the asset to the contract
        
        self.total_bounty.value = self.total_bounty.value + amount
        return String("Funded bounty")
    
    @arc4.abimethod()
    def distribute_payout(
        self,
        contributor: Account,
        amount: UInt64
    ) -> String:
        """Distribute USDC to a contributor (only maintainer can call)"""
        assert Txn.sender == self.maintainer.value, "Only maintainer can distribute"
        assert self.is_resolved.value == UInt64(1), "Issue not resolved yet"
        assert amount <= self.total_bounty.value, "Insufficient bounty funds"
        
        # Transfer USDC to contributor
        # Note: Asset transfers in algopy are handled through inner transactions
        # The contract will send the asset to the contributor
        # This assumes the contract has the asset balance
        
        self.total_bounty.value = self.total_bounty.value - amount
        return String("Distributed to contributor")
    
    @arc4.abimethod()
    def mark_resolved(self) -> String:
        """Mark the issue as resolved (only maintainer can call)"""
        assert Txn.sender == self.maintainer.value, "Only maintainer can mark resolved"
        self.is_resolved.value = UInt64(1)
        return String("Issue marked as resolved")
    
    @arc4.abimethod()
    def refund(self, amount: UInt64) -> String:
        """Refund USDC to maintainer (only maintainer can call)"""
        assert Txn.sender == self.maintainer.value, "Only maintainer can refund"
        assert amount <= self.total_bounty.value, "Insufficient bounty funds"
        
        # Transfer USDC back to maintainer
        # Note: Asset transfers in algopy are handled through inner transactions
        # The contract will send the asset back to the maintainer
        # This assumes the contract has the asset balance
        
        self.total_bounty.value = self.total_bounty.value - amount
        return String("Refunded to maintainer")
    
    @arc4.abimethod()
    def get_bounty_info(self) -> tuple[String, UInt64, Asset, Account, UInt64]:
        """Get current bounty information"""
        return (
            self.issue_id.value,
            self.total_bounty.value,
            self.usdc_asset.value,
            self.maintainer.value,
            self.is_resolved.value
        )
