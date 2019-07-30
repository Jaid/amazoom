import Sequelize from "sequelize"

class User extends Sequelize.Model {}

export const schema = {
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  listPrice: Sequelize.INTEGER.UNSIGNED,
  price: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
  },
}

export default User