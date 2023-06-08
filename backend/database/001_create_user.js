db.createUser({
    user: process.env.MONGO_USERNAME,
    pwd: process.env.MONGO_PASSWORD,
    roles: [{ role: 'readWrite', db: process.env.DATABASE_NAME }]
});

db.getSiblingDB(process.env.DATABASE_NAME).blacklist.createIndex(
    { "createdAt": 1 },
    { expireAfterSeconds: 86400 }
);