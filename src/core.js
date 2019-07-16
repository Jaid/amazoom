import database from "lib/database"

import "lib/startDate"

class Core {

  async init() {
    await database.authenticate()
    await database.sync()
  }

}

export default new Core