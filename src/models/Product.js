import Sequelize, {Op} from "sequelize"
import ProductCheck from "src/models/ProductCheck"
import ProductState from "src/models/ProductState"

class Product extends Sequelize.Model {

  static associate(models) {
    Product.hasMany(models.ProductState, {
      foreignKey: {
        allowNull: false,
      },
    })
  }

  /**
   * @param {string} asin
   * @param {import("sequelize").FindOptions} sequelizeOptions
   * @return {Promise<Product>}
   */
  static async findByAsin(asin, sequelizeOptions) {
    return Product.findOne({
      where: {asin},
      ...sequelizeOptions,
    })
  }

  /**
   * @param {import("sequelize").FindOptions} options
   * @return {Promise<ProductCheck>}
   */
  async getLatestCheck(options) {
    return ProductCheck.findOne({
      where: {
        ProductId: this.id,
      },
      ...options,
    })
  }

  /**
   * @return {Promise<ProductState[]>}
   */
  async getStates() {
    return ProductState.findAll({
      where: {
        ProductId: this.id,
      },
    })
  }

  async check() {
    const states = await this.getStates()
    for (const state of states) {
      await state.check()
    }
  }

  /**
   * @typedef {Object} RegisterResult
   * @prop {Product} product
   * @prop {boolean} isNew
   */

  /**
   * @param {string} title
   * @param {{platform: string, platformIdentifier: string}[]} platformData
   * @param {import("sequelize").CreateOptions} sequelizeOptions
   * @return {Promise<RegisterResult>}
   */
  static async register(title, platformData, sequelizeOptions) {
    const rows = await ProductState.count({
      where: {
        [Op.or]: [platformData],
      },
    })
    if (rows > 0) {
      const anyState = await ProductState.findOne({
        where: {...platformData[0]},
        attributes: ["ProductId"],
        raw: true,
      })
      const product = await Product.findByPk(anyState.ProductId)
      return {
        product,
        isNew: false,
      }
    }
    const product = await Product.create({title})
    await await ProductState.bulkCreate(platformData.map(data => {
      return {
        platform: data.platform,
        platformIdentifier: data.platformIdentifier,
        ProductId: product.id,
      }
    }))
    return {
      product,
      isNew: true,
    }
  }

}

/**
 * @type {import("sequelize").ModelAttributes}
 */
export const schema = {
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
}

export default Product