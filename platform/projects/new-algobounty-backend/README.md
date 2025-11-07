# AlgoBounty Backend API

Backend API server for AlgoBounty, handling GitHub webhooks, OAuth authentication, API calls to GitHub, and attestation management.

## Features

- **GitHub Webhooks**: Type-safe webhook handling with `@octokit/webhooks`
- **OAuth Authentication**: GitHub OAuth flow with `@octokit/oauth-app`
- **GitHub API**: REST API calls using `@octokit/rest` and `@octokit/app`
- **Attestations**: Ed25519 signature-based attestations for linking GitHub accounts to Algorand addresses

## Tech Stack

- **Express.js**: Web server framework
- **TypeScript**: Type-safe development
- **@octokit/webhooks**: GitHub webhook handling
- **@octokit/oauth-app**: OAuth authentication
- **@octokit/rest**: GitHub REST API client
- **@octokit/app**: GitHub App authentication
- **tweetnacl**: Ed25519 signatures for attestations
- **MongoDB**: Database (via mongodb driver)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.template` to `.env` and fill in your values:

```bash
cp .env.template .env
```

Required environment variables:
- `GITHUB_APP_ID`: Your GitHub App ID
- `GITHUB_APP_CLIENT_ID`: OAuth client ID
- `GITHUB_APP_CLIENT_SECRET`: OAuth client secret
- `GITHUB_APP_PRIVATE_KEY`: GitHub App private key (RSA)
- `GITHUB_WEBHOOK_SECRET`: Webhook secret
- `ATTESTOR_PRIVATE_KEY`: Ed25519 private key for attestations (base64)
- `MONGODB_URI`: MongoDB connection string

### 3. Generate Attestor Keypair

```bash
node -e "console.log(require('tweetnacl').sign.keyPair().secretKey.toString('base64'))"
```

Add the output to `ATTESTOR_PRIVATE_KEY` in your `.env` file.

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Type check
npm run type-check

# Lint
npm run lint
```

The server will start on `http://localhost:3001` by default.

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Webhooks
- `POST /api/webhooks/github` - GitHub webhook endpoint
- `GET /api/webhooks/github` - Webhook endpoint status

### Authentication
- `GET /api/auth/github` - Get OAuth authorization URL
- `GET /api/auth/github/callback` - OAuth callback handler

### GitHub API
- `GET /api/github/user/:id` - Get GitHub user by ID
- `GET /api/github/issue/:owner/:repo/:issueNumber` - Get issue information
- `GET /api/github/check-link/:githubId` - Check if GitHub account is linked

### Attestations
- `GET /api/attestations/public-key` - Get attestor public key
- `POST /api/attestations/create` - Create new attestation
- `POST /api/attestations/verify` - Verify attestation signature

## Project Structure

```
src/
├── index.ts                 # Express server setup
├── routes/
│   ├── webhooks.ts        # GitHub webhook routes
│   ├── auth.ts            # OAuth authentication routes
│   ├── github.ts          # GitHub API proxy routes
│   └── attestations.ts    # Attestation management routes
├── handlers/
│   └── webhookHandlers.ts # Webhook event handlers
└── lib/
    └── attestation.ts     # Attestation utilities
```

## Environment Variables

See `.env.template` for all available configuration options.

## License

MIT

