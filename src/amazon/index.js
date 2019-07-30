import got from "got"
import cheerio from "cheerio"
import {first} from "lodash"
import {filterByText} from "lib/cheerio"
import cheerioUtil from "cheerio-util"

class Amazon {

  constructor() {
    this.got = got.extend({
      baseUrl: "https://amazon.de",
    })
  }

  async getPage(asin) {
    const result = await this.got(`dp/${asin}`)
    const dom = cheerio.load(result.body, {
      normalizeWhitespace: true,
      lowerCaseTags: true,
      lowerCaseAttributeNames: true,
      recognizeSelfClosing: true,
      recognizeCDATA: true,
    })
    cheerioUtil(dom)
    const listPriceTrNode = dom("tr").findByText("Unverb. Preisempf.:")
    const listPriceValueNode = dom(listPriceTrNode).children("td").last()
    const listPrice = listPriceValueNode.text()
    debugger
  }

}

export default new Amazon