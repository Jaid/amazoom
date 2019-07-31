import database from "lib/database"
import config from "lib/config"
import Product from "src/models/Product"
import "lib/startDate"
import logger from "lib/logger"

class Core {

  async init() {
    try {
      await database.authenticate()
      if (config.databaseSchemaSync === "sync") {
        await database.sync()
      }
      if (config.databaseSchemaSync === "force") {
        await database.sync({
          force: true,
        })
      }
      if (config.databaseSchemaSync === "alter") {
        await database.sync({
          alter: true,
        })
      }
    } catch (error) {
      logger.error("Error in initialization: %s", error)
    }
    await Product.add("B071KGS72Q")
  }

}

export default new Core