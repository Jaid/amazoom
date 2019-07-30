import Sequelize from "sequelize"

class ProductCheck extends Sequelize.Model {}

export const schema = {
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  listPrice: Sequelize.INTEGER,
  price: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
}

export default ProductCheck