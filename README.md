# btc-indexer
A node.js based bitcoin indexer of OP_RETURN data on Bitcoin Signet. It indexes all previously remaining blocks when started.

## Features

- Express
- REST API
- PostgreSQL
- Bitcoin ZeroMQ

## Requirements

- [node & npm](https://nodejs.org/en/)
- [git](https://www.robinwieruch.de/git-essential-commands/)
- bitcoind [build docs here](https://github.com/bitcoin/bitcoin/tree/master/doc)
## Installation
Get bitcoind running on signet (add signet=1 in .conf) and then install the project:

- `git clone git@github.com:rwieruch/node-express-postgresql-server.git`
- `cd node-express-postgresql-server`
- `npm install`
- `docker-compose up -d`
- Create .env from example.env
- `npm start`

### GET Routes

- visit http://localhost:3000
  - /opreturn/:opReturnData

Note: When you run the code for the first time it will take around 10-12 minutes to index the entire signet chain. After that it will take 3-4 minutes each time to decide, parse and index the remaining blocks.