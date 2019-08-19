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
        "/asin/:asin": {
          "/preview": async context => {
            const productCheck = await ProductCheck.getLatestByAsin(context.params.asin)
            context.assert(productCheck, 404, "No ProductCheck not found")
            const latestFetch = await ProductFetch.findOne({
              where: {
                ProductCheckId: productCheck.id,
              },
              order: [["createdAt", "DESC"]],
              attributes: ["body"],
              raw: true,
            })
            context.body = latestFetch.body
          },
        },
      },
    }
    koa.use(router(routes))
  }

}