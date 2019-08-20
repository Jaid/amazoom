import Sequelize from "sequelize"

class ProductState extends Sequelize.Model {

  static associate(models) {
    ProductState.belongsTo(models.Product, {
      foreignKey: {
        allowNull: false,
      },
    })
    ProductState.belongsTo(models.ProductFetch, {
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
  platform: {
    type: Sequelize.STRING(32),
    allowNull: false,
    defaultValue: "amazon",
  },
  price: Sequelize.INTEGER,
  data: {
    type: Sequelize.HSTORE,
    allowNull: false,
  },
}

export default ProductState