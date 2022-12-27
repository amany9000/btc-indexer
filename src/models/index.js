import Sequelize from 'sequelize';

import getBlockModel from './block';
import getTransactionModel from './transaction';

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    dialect: 'postgres',
    retry: 5,
    pool: {
      max: 20,
      min: 0,
      idle: 300000,
      acquire: 300000
    }
  },
);

const models = {
  Block: getBlockModel(sequelize, Sequelize),
  Transaction: getTransactionModel(sequelize, Sequelize),
};


const findByORD = async (data) => {
    const transactionList = await models.Transaction.findAll({
        where: {
            ORD: data
        },
        attributes: ['hash', 'ORD']
    });

    if (transactionList && (transactionList.length !== 0 ) ) {
        return transactionList.map(async function(element) {

          const block =  await models.Block.findOne({ 
            where: { transactions: { [Sequelize.Op.contains]: [element.dataValues.hash] } }
          });
          element.dataValues["blockHash"] = block.dataValues.hash;
          return element;
        });     

    }

    return { error: 'OP_RETURN Data not found in signet chain' };
}

export { sequelize, findByORD };

export default models;