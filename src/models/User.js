import Sequelize from "sequelize"

export default {
  title: Sequelize.STRING,
  description: Sequelize.TEXT,
  deadline: Sequelize.DATE,
  test: Sequelize.STRING,
}