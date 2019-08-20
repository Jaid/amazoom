import Sequelize from "sequelize"

class ProductCheck extends Sequelize.Model {

  static associate(models) {
    ProductCheck.belongsTo(models.ProductState, {
      foreignKey: {
        allowNull: false,
      },
    })
    ProductCheck.hasMany(models.ProductFetch)
  }

}

/**
 * @type {import("sequelize").ModelAttributes}
 */
export const schema = {
  time: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  url: Sequelize.TEXT,
  data: Sequelize.JSONB,
  changes: {
    type: Sequelize.SMALLINT,
    allowNull: false,
    defaultValue: 0,
  },
}

export default ProductCheck