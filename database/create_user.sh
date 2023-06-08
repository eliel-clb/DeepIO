#!/bin/bash

# Create user command
CREATE_USER_CMD="db.createUser({
  user: '${MONGO_USERNAME}',
  pwd: '${MONGO_PASSWORD}',
  roles: [{ role: 'readWrite', db: '${DATABASE_NAME}' }]
})"

# Execute the command using mongosh
echo "${CREATE_USER_CMD}" | mongosh --host ${MONGO_HOST}:${MONGO_PORT} --username root --password rootpassword --authenticationDatabase admin
