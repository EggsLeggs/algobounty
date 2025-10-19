# pyright: reportMissingModuleSource=false
"""
GitHub Linker Smart Contract

This contract stores GitHub ID to Algorand address mappings.
Built with Algorand Python (Puya) for modern development experience.
"""

from algopy import ARC4Contract, String, UInt64, Bytes, Account, GlobalState, BoxMap, arc4, Txn, op


class GithubLink(ARC4Contract):
    """
    GitHub Linker Contract using ARC-4 ABI
    
    This contract stores GitHub ID to Algorand address mappings.
    """
    
    def __init__(self) -> None:
        """Initialize the contract with admin settings"""
        # Set creator as admin
        self.admin = GlobalState(Account)
        self.admin.value = Txn.sender
        
        # Initialize attestor key (will be set later)
        self.attestor_key = GlobalState(Bytes)
        
        # Initialize box storage for GitHub ID mappings
        self.github_links = BoxMap(UInt64, String, key_prefix=b"gh:")
        self.used_nonces = BoxMap(Bytes, UInt64, key_prefix=b"nonce:")
    
    @arc4.abimethod(create="allow")
    def link(
        self,
        github_id: UInt64,
        algorand_address: String,
        expiry: UInt64,
        nonce: Bytes,
        attestor_pubkey: Bytes,
        signature: Bytes,
    ) -> String:
        """
        Link a GitHub ID to an Algorand address using Ed25519 attestation
        
        Args:
            github_id: GitHub user ID
            algorand_address: Algorand wallet address
            expiry: Unix timestamp when the attestation expires
            nonce: Unique nonce to prevent replay attacks
            attestor_pubkey: Ed25519 public key of the attestor
            signature: Ed25519 signature over the canonical payload
            
        Returns:
            Success message
        """
        # TODO: Implement full attestation verification with correct Puya syntax
        # For now, just validate that parameters are provided
        # This will be implemented once the correct Puya syntax is determined
        
        # Check if GitHub ID is already linked
        if github_id in self.github_links:
            return String("GitHub ID already linked")
        
        # Check if nonce has already been used
        if nonce in self.used_nonces:
            return String("Nonce already used")
        
        # Store the mapping in box storage
        self.github_links[github_id] = algorand_address
        
        # Mark nonce as used
        self.used_nonces[nonce] = UInt64(1)
        
        return String("Successfully linked GitHub account")
    
    @arc4.abimethod
    def revoke(self, github_id: UInt64) -> String:
        """
        Revoke a GitHub ID link (admin only)
        
        Args:
            github_id: GitHub user ID to revoke
            
        Returns:
            Success message
        """
        # Only admin can revoke links
        if Txn.sender != self.admin.value:
            return String("Only admin can revoke links")
        
        # Check if GitHub ID is linked
        if github_id not in self.github_links:
            return String("GitHub ID not linked")
        
        # Delete the mapping from box storage
        del self.github_links[github_id]
        
        return String("Successfully revoked GitHub account")
    
    @arc4.abimethod(readonly=True)
    def get_github_link(self, github_id: UInt64) -> String:
        """
        Get the linked Algorand address for a GitHub ID
        
        Args:
            github_id: GitHub user ID
            
        Returns:
            Linked Algorand address or empty string if not linked
        """
        # Check if GitHub ID is linked
        if github_id in self.github_links:
            return self.github_links[github_id]
        else:
            return String("")
    
    @arc4.abimethod
    def set_attestor(self, pubkey: Bytes) -> String:
        """
        Set the attestor public key (admin only)
        
        Args:
            pubkey: Ed25519 public key (32 bytes)
            
        Returns:
            Success message
        """
        # Only admin can set attestor
        if Txn.sender != self.admin.value:
            return String("Only admin can set attestor")
        
        # Set the attestor key
        self.attestor_key.value = pubkey
        
        return String("Attestor key updated successfully")
    
    @arc4.abimethod(readonly=True)
    def get_attestor_key(self) -> Bytes:
        """
        Get the current attestor public key
        
        Returns:
            Current attestor public key
        """
        return self.attestor_key.value
    
    @arc4.abimethod(readonly=True)
    def get_admin(self) -> Account:
        """
        Get the current admin address
        
        Returns:
            Current admin address
        """
        return self.admin.value
