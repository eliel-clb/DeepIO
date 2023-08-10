db.createUser({
    user:"mongoUser",
    pwd:"monggoPassword",
    roles: [{ role: 'readWrite', db: "deepio_db" }]
});

db.getSiblingDB("deepio_db").blacklist.createIndex(
    { "createdAt": 1 },
    { expireAfterSeconds: 86400 }
);