import "dotenv/config";
import cors from "cors";
import express from "express";

import models, { sequelize } from "./models";
import routes from "./routes";
import indexer from "./indexer";
import { syncBlocks } from "./sync";

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// * Routes * //
app.use("/opreturn", routes);

app.listen(process.env.PORT, async () => {
  console.log(`Example app listening on port ${process.env.PORT}!`),
    await sequelize.sync({ force: false }).then(() => {
      console.log("Database connected!");
    });

  syncBlocks();
  indexer();

  /*
    const block = await models.Block.create({"height": 1234, "hash": "abcd"})
    const transaction = await models.Transaction.create({"hash": "tx_hash"})    
    await block.addTransaction(transaction)*/

  /*
    //const newBlock = await models.Block.findOne({where : {height : 1234}})
    //console.log("newBlock", newBlock, await newBlock.getTransactions())
    
    const newTrans = await models.Transaction.findOne({where : {hash : "tx_hash"}})
    console.log("getBlock", newTrans, newTrans.blockId);*/
});
