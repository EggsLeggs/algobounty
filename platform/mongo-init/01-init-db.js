// Initialize the algo_bounty database and create collections
db = db.getSiblingDB('algo_bounty');

// Create collections
db.createCollection('github_links');
db.createCollection('nonces');
db.createCollection('waitlist');

// Create indexes for better performance
db.github_links.createIndex({ "github_id": 1 }, { unique: true });
db.github_links.createIndex({ "algorand_address": 1 }, { unique: true });
db.nonces.createIndex({ "nonce": 1 }, { unique: true });
db.nonces.createIndex({ "expires": 1 }, { expireAfterSeconds: 0 }); // TTL index
db.waitlist.createIndex({ "email": 1 }, { unique: true }); // Ensure unique emails

// Insert some sample data for development
db.github_links.insertMany([
  {
    github_id: 1,
    github_username: "octocat",
    github_name: "The Octocat",
    github_avatar_url: "https://github.com/images/error/octocat_happy.gif",
    github_html_url: "https://github.com/octocat",
    algorand_address: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    github_id: 2,
    github_username: "defunkt",
    github_name: "Chris Wanstrath",
    github_avatar_url: "https://github.com/images/error/defunkt_happy.gif",
    github_html_url: "https://github.com/defunkt",
    algorand_address: "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    created_at: new Date(),
    updated_at: new Date()
  }
]);

print('Database initialized successfully!');
