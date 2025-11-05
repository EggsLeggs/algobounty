// AlgoBounty LocalNet Configuration
module.exports = {
  // Algorand LocalNet Settings
  algod: {
    token: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    server: "http://localhost",
    port: 4001,
    network: ""
  },

  // Indexer Settings
  indexer: {
    token: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    server: "http://localhost",
    port: 8980
  },

  // KMD Settings (for wallet management)
  kmd: {
    token: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    server: "http://localhost",
    port: 4002,
    walletName: "unencrypted-default-wallet",
    walletPassword: ""
  },

  // USDC Asset ID (will be created on LocalNet)
  usdcAssetId: 0,

  // GitHub Webhook Secret (for webhook verification)
  githubWebhookSecret: "",

  // Next.js Environment Variables
  nextjs: {
    NEXT_PUBLIC_ALGOD_SERVER: "http://localhost:4001",
    NEXT_PUBLIC_ALGOD_TOKEN: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    NEXT_PUBLIC_INDEXER_SERVER: "http://localhost:8980",
    NEXT_PUBLIC_INDEXER_TOKEN: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  }
};

