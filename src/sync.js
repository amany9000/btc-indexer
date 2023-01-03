import * as bitcoin from "bitcoinjs-lib";
import RpcClient from "bitcoind-rpc";
import * as async from "async";
import models from "./models";
import { Op } from "sequelize";

var config = {
  protocol: "http",
  user: process.env.RPC_USER,
  pass: process.env.RPC_PASS,
  host: process.env.RPC_HOST,
  port: process.env.RPC_PORT,
};

// config can also be an url, e.g.:
// var config = 'http://user:pass@127.0.0.1:18332';

var rpc = new RpcClient(config);

function getBlockHash(i) {
  rpc.getBlockHash(i);
}

function getBlock(hash) {
  rpc.getBlock(hash);
}

async function getTransaction(txHash, blockHash) {
  rpc.getRawTransaction(txHash, true, blockHash);
}

async function batchTransactions(blockBatch) {
  function getBatchTransaction() {
    for (let block of blockBatch) {
      for (let tx of block.transactions) {
        getTransaction(tx, block.hash);
      }
    }
  }

  rpc.batch(getBatchTransaction, async function (err, transObjs) {
    if (err) {
      console.error("Error while syncing", err);
      return;
    }

    const transactions = transObjs.map((transObj) => transObj.result);

    let opTxn = [];
    transactions.forEach((tx) => {
      const trans = bitcoin.Transaction.fromHex(tx);

      trans.outs.forEach((out) => {
        let vout = out.script.toString("hex");

        if (vout.slice(0, 2) == "6a") {
          const hash = trans.getId();
          const data = vout.substring(4);
          opTxn.push({ ORD: data, hash: hash });
        }
      });
    });
    await models.Transaction.bulkCreate(opTxn);
  });
}

async function syncBlocks() {
  console.log("Syncing previous Blocks");

  let remainingBlocks;
  let blockHashes;

  async function batchGetHash() {
    remainingBlocks.forEach(function (blockNumber) {
      getBlockHash(blockNumber);
    });
  }

  async function batchGetBlock() {
    blockHashes.forEach(function (hash) {
      getBlock(hash);
    });
  }

  rpc.getBlockCount(async function (err, { result: blockCount }) {
    const totalBlocks = Array(blockCount)
      .fill()
      .map((_, i) => i + 1);

    console.log("total Blocks numbers", totalBlocks);
    const presentBlocks = await models.Block.findAll({
      where: { height: { [Op.in]: totalBlocks } },
    });
    console.log("Checking for remaing blocks");

    remainingBlocks = totalBlocks.filter((block) => {
      return !presentBlocks.some((b) => Number(b.height) === block);
    });
    console.log("remainingBlocks: ", remainingBlocks);

    rpc.batch(batchGetHash, function (err, hashes) {
      if (err) {
        console.error("Error while syncing", err);
        return;
      }

      blockHashes = hashes.map((hashObj) => hashObj.result);
      console.log("blockHashes", blockHashes);

      rpc.batch(batchGetBlock, async function (err, blockObjs) {
        if (err) {
          console.error("Error while syncing", err);
          return;
        }

        const blocks = blockObjs.map((blockObj) => ({
          hash: blockObj.result.hash,
          height: blockObj.result.height,
          transactions: blockObj.result.tx,
        }));

        console.log("blocks", blocks);

        for (let i = 0; i < blocks.length; i += 500) {
          const blockBatch = blocks.slice(i, i + 500);

          await models.Block.bulkCreate(blockBatch);

          let processBlockBatch = async.cargo(function (tasks) {
            batchTransactions(blockBatch);
          }, 20000);

          processBlockBatch.push(blockBatch, function (err) {
            if (err) console.log("error inserting blocks", err);
          });
        }
      });
    });
  });
}

export { syncBlocks, rpc };
