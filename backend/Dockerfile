FROM nikolaik/python-nodejs:python3.9-nodejs20-slim

# set working directory
WORKDIR /app

COPY . .

COPY ./database/001_create_user.js /docker-entrypoint-initdb.d/001_create_user.js

# Install curl
RUN apt-get update && apt-get install -y curl
# RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN curl -fsSL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor > /etc/apt/trusted.gpg.d/pubkey.gpg

RUN apt-get update 
RUN apt-get update && apt-get install -y yarn 
RUN apt-get update && apt-get install -y r-base python3-venv python3-pip 
#  install tf here istead of venv_requirements
RUN pip3 --default-timeout=100 install tensorflow 
RUN npm install
RUN pip install debugpy



# start app
CMD ["npm", "start"]

