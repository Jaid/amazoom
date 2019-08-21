import Product from "src/models/Product"

/**
 * @type {import("koa").Middleware}
 */
const middleware = async context => {
  const {asin, title} = context.query
  context.assert(asin, 400, "Missing asin")
  context.assert(title, 400, "Missing title")
  const {product, isNew} = await Product.register(title, [
    {
      platform: "amazon",
      platformIdentifier: asin,
    },
  ])
  context.body = {
    isNew,
    productId: product.id,
  }
}

export default middleware