mongosh --port 27018 --eval "db.getSiblingDB('$DATABASE_NAME').createUser({user: '$MONGO_USERNAME', pwd: '$MONGO_PASSWORD', roles: ['readWrite']})"

mongosh --port 27018 --eval "db.getSiblingDB('$DATABASE_NAME').blacklist.createIndex( { "createdAt": 1 }, { expireAfterSeconds: 86400 } )"
