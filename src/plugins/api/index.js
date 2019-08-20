import {koa} from "src/core"
import {router} from "fast-koa-router"
import ProductFetch from "src/models/ProductFetch"
import ProductCheck from "src/models/ProductCheck"
import Product from "src/models/Product"

export default class Main {

  init() {
    const routes = {
      get: {
        "/previewFetch/:id": this.handlePreviewFetch,
        "/asin/:asin": {
          "/preview": this.handleAsinPreview,
          "/previewAny": this.handleAsinPreviewAny,
        },
      },
      post: {
        "/asin/:asin": {
          "/add": this.handleAsinAdd,
        },
      },
    }
    koa.use(router(routes))
  }

  /**
   * @param {import("koa").Context} context
   * @return {Promise<void>}
   */
  async handlePreviewFetch(context) {
    const productFetch = await ProductFetch.findByPk(context.params.id)
    context.assert(productFetch, 404, "ID not found")
    context.body = productFetch.body
  }

  /**
   * @param {import("koa").Context} context
   * @return {Promise<void>}
   */
  async handleAsinAdd(context) {
    const {title} = context.query
    context.assert(title, 400, "No title given")
    const {asin} = context.params
    const existingProduct = await Product.findByAsin(asin, {
      raw: true,
      attributes: ["id"],
    })
    if (existingProduct) {
      context.body = {
        id: existingProduct.id,
        new: false,
      }
      return
    }
    const product = await Product.create({
      asin,
      title,
    }, {
      raw: true,
    })
    context.body = {
      id: product.id,
      new: true,
    }
  }

  /**
   * @param {import("koa").Context} context
   * @return {Promise<void>}
   */
  async handleAsinPreview(context) {
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
  }

  /**
   * @param {import("koa").Context} context
   * @return {Promise<void>}
   */
  async handleAsinPreviewAny(context) {
    const {asin} = context.params
    const product = await Product.findByAsin(asin)
    context.assert(product, 404, "ASIN not found")
    const {body} = await ProductFetch.findOne({
      where: {
        ProductId: product.id,
      },
      order: [["createdAt", "DESC"]],
      attributes: ["body"],
      raw: true,
    })
    context.body = body
  }

}