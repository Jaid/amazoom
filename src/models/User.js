import Sequelize from "sequelize"

class User extends Sequelize.Model {}

export const schema = {
  title: Sequelize.STRING,
  description: Sequelize.TEXT,
  deadline: Sequelize.DATE,
  test: Sequelize.STRING,
}

export default User