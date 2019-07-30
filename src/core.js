import database from "lib/database"
import config from "lib/config"
import Product from "src/models/Product"
import amazon from "src/amazon"
import "lib/startDate"

class Core {

  async init() {
    await database.authenticate()
    if (config.databaseSchemaSync === "sync") {
      await database.sync()
    }
    if (config.databaseSchemaSync === "force") {
      await database.sync({
        force: true,
      })
    }
    await amazon.getPage("B071KGS72Q")
  }

}

export default new Core