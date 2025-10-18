# AlgoBounty: Trustless Open-Source Bounties on Algorand

AlgoBounty is a hackathon project that empowers open-source maintainers to attach trustless, verifiable bounties to their GitHub issues, leveraging Algorand's blockchain for escrowed payments.

## 🚀 Features

- **Trustless Escrow**: All bounty payments are held in Algorand smart contracts
- **Verifiable Execution**: Transparent and auditable payout distribution
- **Fast, Low-Fee Transactions**: Built on Algorand's efficient blockchain
- **Global Access**: Anyone with an internet connection and crypto wallet can participate
- **GitHub Integration**: Seamless integration with GitHub issues and pull requests

## 🏗️ Architecture

This project consists of three main components:

1. **Smart Contracts** (`/projects/algo-bounty-contracts/`)
   - IssueEscrow contract for holding USDC bounties
   - Written in Python using Algopy framework

2. **Frontend** (`/projects/algo-bounty-frontend/`)
   - Next.js application with TypeScript
   - Wallet integration (Pera, Defly)
   - Bounty management interface

3. **Backend API** (Next.js API routes)
   - GitHub webhook handlers
   - Bounty management endpoints
   - Smart contract interaction

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 20+ and npm 9+
- Python 3.11+ and Poetry
- AlgoKit CLI
- Docker (for LocalNet)

### 1. Install Dependencies

```bash
# Install AlgoKit CLI
npm install -g @algorandfoundation/algokit

# Install project dependencies
cd projects/algo-bounty-contracts
poetry install

cd ../algo-bounty-frontend
npm install
```

### 2. Start LocalNet

```bash
# Start Algorand LocalNet
algokit localnet start

# Verify LocalNet is running
algokit localnet status
```

### 3. Deploy Smart Contracts

```bash
cd projects/algo-bounty-contracts

# Deploy the IssueEscrow contract
poetry run python -m smart_contracts.issue_escrow.deploy_config
```

### 4. Start the Frontend

```bash
cd projects/algo-bounty-frontend

# Copy environment configuration
cp localnet.config.js .env.local

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```env
# Algorand LocalNet Settings
NEXT_PUBLIC_ALGOD_SERVER="http://localhost:4001"
NEXT_PUBLIC_ALGOD_TOKEN="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
NEXT_PUBLIC_INDEXER_SERVER="http://localhost:8980"
NEXT_PUBLIC_INDEXER_TOKEN="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

# GitHub Webhook Secret (optional)
GITHUB_WEBHOOK_SECRET="your-webhook-secret"
```

### USDC Asset Setup

For LocalNet development, you'll need to create a USDC asset:

```bash
# Create USDC asset on LocalNet
algokit asset create --name "USD Coin" --unit "USDC" --decimals 6 --total 1000000000
```

## 🎯 Usage

### Creating a Bounty

1. Open the AlgoBounty application
2. Select a GitHub issue from the list
3. Click "Fund Issue with AlgoBounty"
4. Connect your wallet (Pera or Defly)
5. Enter the USDC amount and create the bounty

### Managing Bounties

- **View Active Bounties**: See all active bounties in the dashboard
- **Add Funds**: Contribute additional USDC to existing bounties
- **Distribute Rewards**: Maintainers can distribute bounties to contributors
- **Refund**: Maintainers can refund unused bounty funds

### GitHub Integration

The system includes webhook endpoints for GitHub integration:

- `POST /api/webhooks/github` - Handles GitHub webhook events
- `GET /api/bounties` - Lists all bounties
- `POST /api/bounties` - Creates new bounties
- `PUT /api/bounties` - Updates bounty status

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

## 🧪 Testing

### LocalNet Testing

```bash
# Start LocalNet
algokit localnet start

# Run contract tests
cd projects/algo-bounty-contracts
poetry run pytest

# Test frontend
cd projects/algo-bounty-frontend
npm run test
```

### Lora Explorer

Access the Lora explorer at `http://localhost:3001` to view transactions and contract interactions.

## 🚀 Deployment

### LocalNet (Development)

The current setup is configured for LocalNet development. To deploy to TestNet or MainNet:

1. Update environment variables
2. Deploy contracts to target network
3. Update frontend configuration
4. Set up proper USDC asset references

### Production Considerations

- Set up proper GitHub webhook secrets
- Use production-grade wallet providers
- Implement proper error handling and logging
- Set up monitoring and analytics
- Consider gas optimization for smart contracts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Algorand Foundation for the AlgoKit framework
- Algorand community for support and feedback
- GitHub for the platform integration

## 📞 Support

For questions or support:

- Create an issue in the repository
- Join the Algorand Discord
- Check the AlgoKit documentation

---

**Note**: This is a hackathon project and should be thoroughly tested before any production use.
