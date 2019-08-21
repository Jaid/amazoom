import Product from "src/models/Product"

/**
 * @type {import("koa").Middleware}
 */
const middleware = async context => {
  const {productId} = context.params
  if (productId) {
    const product = await Product.findByPk(productId)
    await product.check()
    context.body = "OK"
    return
  }
  context.throw("Missing parameter", 400)
}

export default middleware