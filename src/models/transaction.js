const getTransactionModel = (sequelize, { DataTypes }) => {
    const Transaction = sequelize.define('transaction', {
      hash: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      // ORD = opReturnData
      ORD: {
        type: DataTypes.STRING,
      }
    });
  
    return Transaction;
  };
  
  export default getTransactionModel;
  