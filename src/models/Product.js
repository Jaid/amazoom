import Sequelize from "sequelize"

class Product extends Sequelize.Model {}

export const schema = {
  asin: Sequelize.STRING(10), // See https://www.nchannel.com/blog/amazon-asin-what-is-an-asin-number
  title: Sequelize.STRING,
}

export default Product