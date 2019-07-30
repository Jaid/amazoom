import got from "got"
import cheerio from "cheerio"
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
    const listPriceTrNode = dom("tr").findTrByFirstTd("Unverb. Preisempf.:")
    debugger
  }

}

export default new Amazon