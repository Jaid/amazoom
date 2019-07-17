import database from "lib/database"
import config from "lib/config"
import User from "src/models/User"

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
  }

}

export default new Core