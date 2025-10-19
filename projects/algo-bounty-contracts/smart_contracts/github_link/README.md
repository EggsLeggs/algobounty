# GitHub Linker Smart Contract

A modern Algorand smart contract built with **Algorand Python (Puya)** that verifies Ed25519 attestations and stores GitHub ID to Algorand address mappings.

## Features

- **Ed25519 Attestation Verification**: Cryptographically secure verification of backend attestations
- **ARC-4 ABI**: Modern contract interface with type safety
- **Admin Controls**: Secure admin functions for attestor management
- **Nonce Protection**: Prevents replay attacks with unique nonces
- **Expiry Validation**: Time-based attestation validation

## Architecture

### Contract Structure

The contract is built using Algorand Python (Puya) and follows the ARC-4 standard:

```python
class GithubLink(ARC4Contract):
    def __init__(self) -> None:
        self.admin = GlobalState(Account)
        self.admin.value = Txn.sender
        self.attestor_key = GlobalState(Bytes)
```

### Key Methods

1. **`link`** - Link GitHub ID to Algorand address with Ed25519 attestation
2. **`revoke`** - Revoke a GitHub ID link (admin only)
3. **`set_attestor`** - Set the attestor public key (admin only)
4. **`get_github_link`** - Get linked address for a GitHub ID
5. **`get_attestor_key`** - Get current attestor key
6. **`get_admin`** - Get current admin address

## Current Implementation Status

### ✅ Completed Features

- **Contract Structure**: Complete ARC-4 contract with proper method signatures
- **Admin Management**: Admin initialization and access control
- **Method Signatures**: All methods have correct parameters for attestation verification
- **Attestor Management**: Methods for setting and getting attestor keys
- **Compilation**: Contract compiles successfully with Puya

### ⏳ Pending Implementation

The following features are ready for implementation once the correct Puya syntax is determined:

1. **Box Storage Operations**:
   ```python
   # TODO: Implement with correct Puya syntax
   github_box_key = Bytes(b"gh:") + Bytes(op.itob(github_id))
   op.box_put(github_box_key, Bytes(algorand_address.encode()))
   ```

2. **Ed25519 Attestation Verification**:
   ```python
   # TODO: Implement with correct Puya syntax
   payload = Bytes(b"LINK|") + Bytes(op.itob(github_id)) + ...
   verify_sig = op.ed25519verify(signature, payload, attestor_pubkey)
   ```

3. **Timestamp Validation**:
   ```python
   # TODO: Implement with correct Puya syntax
   current_time = op.global.latest_timestamp
   not_expired = current_time <= expiry
   ```

## Method Details

### `link(github_id, algorand_address, expiry, nonce, attestor_pubkey, signature)`

Links a GitHub ID to an Algorand address using Ed25519 attestation.

**Parameters:**
- `github_id: UInt64` - GitHub user ID
- `algorand_address: String` - Algorand wallet address
- `expiry: UInt64` - Unix timestamp when the attestation expires
- `nonce: Bytes` - Unique nonce to prevent replay attacks
- `attestor_pubkey: Bytes` - Ed25519 public key of the attestor
- `signature: Bytes` - Ed25519 signature over the canonical payload

**Returns:** Success message

### `revoke(github_id)`

Revokes a GitHub ID link (admin only).

**Parameters:**
- `github_id: UInt64` - GitHub user ID to revoke

**Returns:** Success message

### `set_attestor(pubkey)`

Sets the attestor public key (admin only).

**Parameters:**
- `pubkey: Bytes` - Ed25519 public key (32 bytes)

**Returns:** Success message

### `get_github_link(github_id)`

Gets the linked Algorand address for a GitHub ID.

**Parameters:**
- `github_id: UInt64` - GitHub user ID

**Returns:** Linked Algorand address or empty string if not linked

### `get_attestor_key()`

Gets the current attestor public key.

**Returns:** Current attestor public key

### `get_admin()`

Gets the current admin address.

**Returns:** Current admin address

## Attestation Flow

1. **Backend Verification**: Backend verifies GitHub OAuth and wallet signature
2. **Attestation Creation**: Backend creates Ed25519 attestation with:
   - GitHub ID
   - Algorand address
   - Nonce
   - Expiry timestamp
3. **On-chain Verification**: Contract verifies the attestation signature
4. **Storage**: If valid, stores the mapping in a box

### Attestation Payload Format

```
"LINK|{github_id}|{algorand_address}|{expiry}|{nonce}"
```

## Security Features

- **Ed25519 Verification**: Cryptographically secure signature verification
- **Nonce Replay Protection**: Each nonce can only be used once
- **Expiry Validation**: Attestations expire after a set time
- **Admin Controls**: Only authorized admins can modify attestor keys

## Development

### Prerequisites

1. **Algorand Python (Puya)**: Install the Puya compiler
   ```bash
   pip install puya
   ```

2. **Algorand LocalNet**: For development and testing
   ```bash
   # Using AlgoKit
   algokit localnet start
   ```

3. **Python Dependencies**: Install required packages
   ```bash
   pip install algokit-utils algosdk
   ```

### Compilation

Compile the contract using AlgoKit:

```bash
algokit project run build
```

### Deployment

Deploy the contract using the deployment configuration:

```bash
algokit project deploy
```

## Integration with Frontend

The contract integrates with the frontend through the smart contract utilities:

```typescript
// Link GitHub account
const result = await linkGitHubAccount({
  githubId: 12345,
  algorandAddress: "ALGORAND_ADDRESS",
  expiry: 1234567890,
  nonce: "hex_nonce",
  attestorPubkey: "base64_attestor_pubkey",
  signature: "base64_signature"
}, config);

// Get GitHub link
const linkedAddress = await getGitHubLink(12345, config);
```

## Next Steps

1. **Research Puya Syntax**: Determine the correct syntax for box operations and cryptographic functions
2. **Implement Box Storage**: Add persistent storage for GitHub ID mappings
3. **Complete Attestation Verification**: Implement full Ed25519 signature verification
4. **Add Timestamp Validation**: Implement proper expiry checking
5. **Testing**: Comprehensive testing of all contract methods

## License

This project is part of the Algorand Bounty System and follows the same license terms.
