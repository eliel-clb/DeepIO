# base image
FROM node:18.17-alpine

# set working directory
WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

# start app
CMD ["npm", "start"]
