const getBlockModel = (sequelize, { DataTypes }) => {
    const Block = sequelize.define('block', {
      hash: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      height: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      transactions: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    });
  
    return Block;
  };
  
export default getBlockModel;