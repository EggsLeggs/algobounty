# Platform

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 20+ and npm 9+
- Python 3.12 and Poetry
- AlgoKit CLI 2.0.0+
- Docker (for LocalNet)

### 1. Install Dependencies

```bash
# Install all dependencies (frontend and contracts)
npm run deps:needed

# Or install individually:
npm run deps:frontend:needed  # Install frontend dependencies
npm run deps:contracts:needed  # Install contract dependencies
```

### 2. Bootstrap Project

```bash
# Bootstrap the project (generates contract clients, etc.)
npm run bootstrap

# Or run setup (installs deps + bootstraps)
npm run setup
```

### 3. Start LocalNet

```bash
# Start Algorand LocalNet
npm run localnet:start

# Verify LocalNet is running
npm run localnet:status

# Stop LocalNet
npm run localnet:stop

# Open Lora Explorer (run in separate terminal)
algokit localnet explorer
```

### 4. Deploy Smart Contracts

```bash
# Deploy all contracts
npm run deploy:contracts

# Or deploy individually:
npm run deploy:contracts:issue-escrow   # Deploy IssueEscrow contract
npm run deploy:contracts:github-link   # Deploy GitHubLink contract
npm run deploy:contracts:hello-world    # Deploy HelloWorld contract
npm run deploy:new-algobounty-contract  # Deploy the new TypeScript escrow contract
```

### 5. Start the Frontend

```bash
# Copy the environment configuration (first time only)
cp projects/algobounty-frontend/.env.example projects/algobounty-frontend/.env.local

# Start the development server
npm run dev:frontend
```

The application will be available at `http://localhost:3000`.

## Configuration

### Environment Variables

Create a `.env` file in the frontend directory and set the environment variables.

## 🧪 Testing

### LocalNet Testing

```bash
# Start LocalNet
npm run localnet:start

# Run contract tests
cd projects/algobounty-contracts
poetry run pytest

# Test frontend
npm run lint:frontend
# Or from frontend directory:
cd projects/algobounty-frontend
npm run test
```

### Lora Explorer

Access the Lora explorer at `http://localhost:3001` to view transactions and contract interactions.

## 🚀 Deployment

### LocalNet (Development)

The current setup is only configured for LocalNet development. Testnet and Mainnet deployments are not supported yet.

### Available Commands

**Dependencies:**

- `npm run deps:needed` - Install all dependencies
- `npm run deps:frontend:needed` - Install frontend dependencies
- `npm run deps:contracts:needed` - Install contract dependencies
- `cd projects/new-algobounty-contract && npm install` - Install the new TypeScript contract workspace

**LocalNet:**

- `npm run localnet:start` - Start Algorand LocalNet
- `npm run localnet:stop` - Stop Algorand LocalNet
- `npm run localnet:status` - Check LocalNet status

**Deployment:**

- `npm run deploy:contracts` - Deploy all contracts
- `npm run deploy:contracts:issue-escrow` - Deploy IssueEscrow only
- `npm run deploy:contracts:github-link` - Deploy GitHubLink only
- `npm run deploy:contracts:hello-world` - Deploy HelloWorld only

**Frontend:**

- `npm run dev:frontend` - Start development server
- `npm run build:frontend` - Build for production
- `npm run start:frontend` - Start production server
- `npm run lint:frontend` - Lint frontend code

**Setup:**

- `npm run setup` - Install dependencies and bootstrap
- `npm run bootstrap` - Bootstrap project (generate clients, etc.)
