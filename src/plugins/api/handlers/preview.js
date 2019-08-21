import ProductFetch from "src/models/ProductFetch"
import ProductState from "src/models/ProductState"
import ProductCheck from "src/models/ProductCheck"

/**
 * @type {import("koa").Middleware}
 */
const middleware = async context => {
  const {productId, platform} = context.params
  const productFetch = await ProductFetch.findOne({
    order: [["id", "DESC"]],
    attributes: ["body"],
    raw: true,
    include: [
      {
        required: true,
        model: ProductCheck,
        attributes: [],
        include: [
          {
            model: ProductState,
            required: true,
            attributes: [],
            where: {
              platform,
              ProductId: productId,
            },
          },
        ],
      },
    ],
  })
  context.assert(productFetch, 404, "State not found")
  context.type = "html"
  context.body = productFetch.body
}

export default middleware