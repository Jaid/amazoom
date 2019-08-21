import ProductState from "src/models/ProductState"

/**
 * @type {import("koa").Middleware}
 */
const middleware = async context => {
  const {platform, productId, platformIdentifier} = context.params
  const where = {platform}
  if (productId) {
    where.ProductId = productId
  } else if (platformIdentifier) {
    where.platformIdentifier = platformIdentifier
  } else {
    context.throw("Missing parameter", 400)
  }
  const productState = await ProductState.findOne({
    where,
    raw: true,
    attributes: ["id", "price", "platformIdentifier", "platform", "title", "currency"],
  })
  context.assert(productState, 404, "ProductState not found")
  context.body = productState
}

export default middleware