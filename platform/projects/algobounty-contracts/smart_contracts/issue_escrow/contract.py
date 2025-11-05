from algopy import ARC4Contract, String, UInt64, Asset, Account, GlobalState, arc4, Txn, itxn, Global


class IssueEscrow(ARC4Contract):
    """Smart contract for escrowing ALGO bounties for a single GitHub issue"""
    
    def __init__(self) -> None:
        # Global state initialization - ONE ISSUE PER CONTRACT
        self.issue_id = GlobalState(String)  # "owner/repo#123"
        self.total_bounty = GlobalState(UInt64)  # Total bounty amount
        self.algo_asset = GlobalState(Asset)  # ALGO asset ID (0 for native ALGO)
        self.maintainer = GlobalState(Account)  # Issue maintainer
        self.is_resolved = GlobalState(UInt64)  # 0=open, 1=resolved
        self.initialized = GlobalState(UInt64)  # 0=not initialized, 1=initialized
    
    @arc4.abimethod()
    def create_bounty(
        self,
        issue_id: String,
        maintainer: Account
    ) -> String:
        """Initialize a new bounty escrow for a GitHub issue"""
        assert self.initialized.value == UInt64(0), "Bounty already initialized"
        assert Txn.sender == maintainer, "Only maintainer can create bounty"
        
        self.issue_id.value = issue_id
        self.total_bounty.value = UInt64(0)
        self.algo_asset.value = Asset(0)  # Native ALGO has asset ID 0
        self.maintainer.value = maintainer
        self.is_resolved.value = UInt64(0)
        self.initialized.value = UInt64(1)
        
        return String("Bounty created for issue: ") + issue_id
    
    @arc4.abimethod()
    def fund_bounty(self, amount: UInt64) -> String:
        """Add ALGO to the existing bounty"""
        assert self.initialized.value == UInt64(1), "Bounty not initialized"
        assert self.is_resolved.value == UInt64(0), "Bounty already resolved"
        assert amount > UInt64(0), "Amount must be greater than 0"
        
        # Transfer ALGO from sender to this contract
        itxn.Payment(
            receiver=Global.current_application_address,
            amount=amount,
            sender=Txn.sender
        ).submit()
        
        self.total_bounty.value = self.total_bounty.value + amount
        return String("Funded bounty successfully")
    
    @arc4.abimethod()
    def distribute_payout(
        self,
        contributor: Account,
        amount: UInt64
    ) -> String:
        """Distribute ALGO to a contributor (only maintainer can call)"""
        assert Txn.sender == self.maintainer.value, "Only maintainer can distribute"
        assert self.is_resolved.value == UInt64(1), "Issue not resolved yet"
        assert amount <= self.total_bounty.value, "Insufficient bounty funds"
        assert amount > UInt64(0), "Amount must be greater than 0"
        
        # Transfer ALGO from contract to contributor
        itxn.Payment(
            receiver=contributor,
            amount=amount,
            sender=Global.current_application_address
        ).submit()
        
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
        """Refund ALGO to maintainer (only maintainer can call)"""
        assert Txn.sender == self.maintainer.value, "Only maintainer can refund"
        assert amount <= self.total_bounty.value, "Insufficient bounty funds"
        assert amount > UInt64(0), "Amount must be greater than 0"
        
        # Transfer ALGO from contract back to maintainer
        itxn.Payment(
            receiver=self.maintainer.value,
            amount=amount,
            sender=Global.current_application_address
        ).submit()
        
        self.total_bounty.value = self.total_bounty.value - amount
        return String("Refunded to maintainer")
    
    @arc4.abimethod()
    def get_bounty_info(self) -> tuple[String, UInt64, Asset, Account, UInt64, UInt64]:
        """Get current bounty information"""
        return (
            self.issue_id.value,
            self.total_bounty.value,
            self.algo_asset.value,
            self.maintainer.value,
            self.is_resolved.value,
            self.initialized.value
        )
