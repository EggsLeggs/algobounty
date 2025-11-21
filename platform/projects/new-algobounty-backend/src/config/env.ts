export const isDemoMode = (() => {
  const raw = process.env.DEMO_MODE;
  if (!raw) {
    return false;
  }

  return ["true", "1", "yes", "on"].includes(raw.toLowerCase());
})();

export const mongoDbName = process.env.MONGODB_DB_NAME || "algo_bounty";

