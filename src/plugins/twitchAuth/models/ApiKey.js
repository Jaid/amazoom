import Sequelize from "sequelize"
import nanoid from "nanoid"

class ApiKey extends Sequelize.Model {

  static associate(models) {
    ApiKey.belongsTo(models.TwitchUser, {
      foreignKey: {
        allowNull: false,
      },
    })
  }

}

/**
 * @type {import("sequelize").ModelAttributes}
 */
export const schema = {
  key: {
    allowNull: false,
    unique: true,
    type: Sequelize.STRING(21),
    defaultValue: nanoid,
  },
}

export default ApiKey