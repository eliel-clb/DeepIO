db.log.insertOne({"message": "Database created."});
db = db.getSiblingDB('admin');
db.auth('adminUser', 'monggoPassword')
db = db.getSiblingDB('deepio_db');

db.createUser({
    user:"mongoUser",
    pwd:"monggoPassword",
    roles: [{ role: 'readWrite', db: "deepio_db" }]
});

db.getSiblingDB("deepio_db").blacklist.createIndex(
    { "createdAt": 1 },
    { expireAfterSeconds: 86400 }
);