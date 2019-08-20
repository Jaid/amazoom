import UserAgent from "user-agents"
import cheerio from "cheerio-util"
import parseCurrency from "parsecurrency"
import json5 from "json5"
import hasContent from "has-content"
import {logger} from "src/core"

import Platform from "../Platform"

/**
  * @class
  * @extends {Platform}
  */
class Amazon extends Platform {

  userAgentRoller = new UserAgent({deviceCategory: "tablet"})

  /**
   * @param {import("src/models/ProductState").default} productState
   * @return {string}
   */
  getUrl(productState) {
    return `https://amazon.de/dp/${productState.platformIdentifier}`
  }

  /**
   * @param {import("got").GotInstance} got
   * @param {import("src/models/ProductState").default} productState
   * @return {import("got").GotInstance}
   */
  makeGot(got) {
    return got.extend({
      headers: {
        "User-Agent": this.userAgentRoller.random().toString(),
      },
    })
  }

  /**
   * @param {import("src/models/ProductFetch").default} productFetch
   * @param {import("src/models/ProductState").default} productState
   * @return {import("src/platforms/Platform").CollectedData}
   */
  checkState(productFetch, productState) {
    if (productFetch.body.includes("api-services-support@amazon.com")) {
      throw new Error("Has captcha")
    }
    /**
     * @type {import("cheerio")}
     */
    const dom = cheerio.load(productFetch.body, {
      normalizeWhitespace: true,
      lowerCaseTags: true,
      lowerCaseAttributeNames: true,
      recognizeSelfClosing: true,
      recognizeCDATA: true,
    })
    const collectedData = {}
    const listPriceTr = dom.root().findTrByFirstTd("Unverb. Preisempf.:")
    if (listPriceTr?.[0]) {
      const listPriceText = listPriceTr[0]
      const listPrice = parseCurrency(listPriceText)
      if (listPrice) {
        if (listPrice.symbol === "€") {
          collectedData.listPriceCurrency = "EUR"
        } else {
          logger.warn("Currency symbol for %s is \"%s\"", productState.getName(), listPrice.symbol)
          collectedData.listPriceCurrency = listPrice.symbol
        }
        collectedData.listPrice = listPrice.value * 100
        collectedData.listPriceSymbol = listPrice.symbol
      } else {
        logger.warn("Could not parse \"%s\" with parsecurrency", listPriceText)
      }
    }
    const ourPriceNode = dom("#priceblock_ourprice")
    if (ourPriceNode) {
      const ourPriceText = ourPriceNode.textNormalized()
      const price = parseCurrency(ourPriceText)
      if (price) {
        if (price.symbol === "€") {
          collectedData.currency = "EUR"
        } else {
          logger.warn("Currency symbol for %s is \"%s\"", productState.getName(), price.symbol)
          collectedData.currency = price.symbol
        }
        collectedData.price = price.value * 100
      } else {
        logger.warn("Could not parse \"%s\" with parsecurrency", ourPriceText)
      }
    }
    const title = dom("#productTitle").textNormalized()
    if (title |> hasContent) {
      collectedData.title = title
    }
    const scripts = dom("script[type='text/javascript']").toArray().map(node => {
      return dom.text(node.childNodes).trim()
    }).filter(hasContent)
    const dataScript = scripts.find(script => /'twister-js-init-dpx-data'/s.test(script))
    if (dataScript) {
      const jsonString = /dataToReturn += +(?<object>{(.+)});/s.exec(dataScript).groups.object
      collectedData.dataObject = json5.parse(jsonString)
    }
    const imagesScript = scripts.find(script => /'ImageBlockATF'.+jQuery\.parseJSON/s.test(script))
    if (imagesScript) {
      const jsonString = /parseJSON\('(?<json>.*?)'\);/s.exec(imagesScript).groups.json
      collectedData.imagesObject = JSON.parse(jsonString)
    }
    return collectedData
  }

}

export default new Amazon