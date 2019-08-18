import {koa} from "src/core"
import {router} from "fast-koa-router"
import ProductFetch from "src/models/ProductFetch"
import ProductCheck from "src/models/ProductCheck"
import Product from "src/models/Product"

export default class Main {

  init() {
    const routes = {
      get: {
        "/previewFetch/:id": async context => {
          const productFetch = await ProductFetch.findByPk(context.params.id)
          context.assert(productFetch, 404, "ID not found")
          context.body = productFetch.body
        },
        "/previewProduct/:asin": async context => {
          const product = await Product.findByAsin(context.params.asin, {
            attributes: ["id"],
            include: [
              {
                model: ProductCheck,
              },
            ],
          })
          context.assert(product, 404, "ASIN not found")
          context.body = productFetch.body
        },
      },
    }
    koa.use(router(routes))
  }

}