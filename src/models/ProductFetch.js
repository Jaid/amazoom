import Sequelize from "sequelize"

class ProductFetch extends Sequelize.Model {

  static associate(models) {
    ProductFetch.belongsTo(models.ProductCheck)
  }

}

/**
 * @type {import("sequelize").ModelAttributes}
 */
export const schema = {
  url: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  requestHeaders: {
    type: Sequelize.HSTORE,
    allowNull: false,
  },
  responseHeaders: {
    type: Sequelize.HSTORE,
    allowNull: false,
  },
  body: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  httpVersion: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  method: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  statusCode: {
    type: Sequelize.SMALLINT,
    allowNull: false,
  },
  statusMessage: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  time: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
}

export default ProductFetch