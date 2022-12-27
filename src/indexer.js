
import * as bitcoin from 'bitcoinjs-lib';
import * as zmq from 'zeromq';
import models from './models';
import {rpc} from './sync'

function indexer() {
  var sock = zmq.socket('sub');
  var addr = process.env.ZMQ_ADDRESS;

  sock.connect(addr);

  // Subscribe to receive messages for a specific topic.
  // This can be "rawblock", "hashblock", "rawtx", or "hashtx".
  sock.subscribe('rawblock');

  console.log("Zeromq Indexer started")
  sock.on('message', async function(topic, message) {

      if (topic.toString() === 'rawblock') {

          const rawblock = message.toString('hex');

          const block = bitcoin.Block.fromHex(rawblock);

          console.log("New block incoming: ", block)
          const blockHash = block.getId();

          rpc.getBlock(blockHash, async function(err, {result: rpcBlock}){
            await models.Block.create({"height": rpcBlock.height, "hash":blockHash,  "transactions": rpcBlock.tx})
          
            block.transactions.forEach(async (trans) => {
              
              trans.outs.forEach(async (out) => {
                let vout = out.script.toString("hex")
      
                if (vout.slice(0,2) == "6a"){
                  const hash = trans.getId();
                  const data = vout.substring(4);
                  console.log("Transaction: ", hash)
                  console.log("OP_RETURN DATA: ", data)
                  await models.Transaction.create({"hash": hash, ORD: data})    
                }
              })
            })
          })

      }
  });
}
/*
async function addBlock(block){
  const _block = await models.Block.create({"height": block.height, "hash": block.hash})
  block.tx.forEach(async (txn) => {
    const transaction = await models.Transaction.create({"hash": txn})    
    await _block.addTransaction(transaction)
  })
}
*/

//indexer()
export default indexer;