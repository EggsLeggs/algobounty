![AlgoBounty Banner](.github/assets/AlgoBounty_Github_Banner.png)

# AlgoBounty: Trustless Open-Source Bounties on Algorand

AlgoBounty empowers open-source maintainers to attach trustless, verifiable bounties to their GitHub issues, leveraging Algorand's blockchain for escrowed payments.

## 🏆 Awards

- **2nd Place Winner** - Pitching Track at EasyA x Algorand Hackathon London 2025

## Features

- **Trustless Escrow**: All bounty payments are held in Algorand smart contracts
- **Verifiable Execution**: Transparent and auditable payout distribution
- **Fast, Low-Fee Transactions**: Built on Algorand's efficient blockchain
- **Verifiable Onchain Connections**: Secure connections between GitHub accounts and crypto wallets
- **GitHub App Integration**: Seamless integration with GitHub issues and pull requests

## Architecture

This project consists of three main components:

1. **Smart Contracts**
   - IssueEscrow contract for holding USDC bounties
   - Written in Python using Algopy framework

2. **dApp**
   - Next.js application with TypeScript
   - Wallet integration (Pera, Defly)
   - Bounty management interface

3. **Backend API**
   - GitHub webhook handlers
   - Bounty management endpoints
   - Smart contract interaction

## Usage

### Creating a Bounty

1. Open the AlgoBounty application
2. Add the GitHub app via the "Add GitHub App" button
3. Select the repository you want to create a bounty for
4. Now whenever a new issue is created in the repository, a bounty will be created for it and the link to the bounty will be added to the issue description.
5. Contributors can now contribute to the bounty by funding it.
6. Once the bounty is funded, the maintainer can distribute the bounty to the contributors.

## 🔍 Smart Contract Details

### IssueEscrow Contract

The main smart contract handles:

- **create_bounty()**: Initialize escrow for a GitHub issue
- **fund_bounty()**: Add USDC to existing bounty
- **distribute_payout()**: Release funds to contributors
- **mark_resolved()**: Mark issue as resolved
- **refund()**: Return funds to maintainer
- **get_bounty_info()**: Get current bounty information

### State Schema

- `issue_id`: GitHub issue identifier
- `total_bounty`: Total USDC amount in escrow
- `usdc_asset`: USDC asset reference
- `maintainer`: Repository maintainer address
- `is_resolved`: Resolution status

### GitHub Linker Contract

The GitHub Linker contract is used to link GitHub accounts to Algorand addresses.

- **link_github_account()**: Link a GitHub account to an Algorand address
- **get_github_link()**: Get the Algorand address linked to a GitHub account

### State Schema


- `github_id`: GitHub account identifier
- `algorand_address`: Algorand address
- `expiry`: Expiry timestamp
- `nonce`: Nonce
- `attestor_pubkey`: Attestor public key
- `signature`: Signature

## 📄 License

This project is licensed under the **Commons Clause License** (Apache 2.0 + Commons Clause).

### What this means:

✅ **You CAN:**
- View and study the source code
- Modify and create derivative works
- Contribute improvements back to the project
- Use the software for non-commercial purposes

❌ **You CANNOT:**
- Sell or offer for sale the software as a service
- **Redeploy or commercially deploy the smart contracts** for commercial purposes
- Use the software to provide a competing commercial service
- Charge fees for hosting, consulting, or support services where the value derives substantially from the Software's functionality

### Smart Contract Deployment Restriction

**IMPORTANT:** The smart contracts in this repository (IssueEscrow, GitHubLinker, etc.) are provided for educational, auditing, and contribution purposes only. **Commercial deployment or redeployment of these smart contracts is expressly prohibited** without explicit written permission from the copyright holder.

For commercial licensing or partnership inquiries, please contact the project maintainers.

See [LICENSE](../LICENSE) for full license terms.