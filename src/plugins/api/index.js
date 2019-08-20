import {koa} from "src/core"
import {router} from "fast-koa-router"
import ProductFetch from "src/models/ProductFetch"
import ProductState from "src/models/ProductState"
import ProductCheck from "src/models/ProductCheck"
import Product from "src/models/Product"

export default class Main {

  init() {
    const routes = {
      get: {
        "/product/:productId/:platform": {
          "/preview": this.handlePreview,
        },
      },
      post: {
        "/registerAsin": this.handleRegisterAsin,
        "/product/:productId": {
          "/triggerCheck": this.handleTriggerCheck,
        },
      },
    }
    koa.use(router(routes))
  }

  /**
   * @param {import("koa").Context} context
   * @return {Promise<void>}
   */
  async handlePreview(context) {
    const {productId, platform} = context.params
    const productState = await ProductFetch.findOne({
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
    context.assert(productState, 404, "State not found")
    context.type = "html"
    context.body = productState.body
  }

  /**
   * @param {import("koa").Context} context
   * @return {Promise<void>}
   */
  async handleRegisterAsin(context) {
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

  /**
   * @param {import("koa").Context} context
   * @return {Promise<void>}
   */
  async handleTriggerCheck(context) {
    const {productId} = context.params
    const product = await Product.findByPk(productId)
    await product.check()
  }

}