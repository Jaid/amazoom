import config from "lib/config"
import Sequelize from "sequelize"
import logger from "lib/logger"

const sequelize = new Sequelize({
  dialect: "postgres",
  host: config.databaseHost,
  port: config.databasePort,
  database: config.databaseName,
  username: config.databaseUser,
  password: config.databasePassword,
})

const modelsRequire = require.context("../models/", true, /.js$/)
for (const value of modelsRequire.keys()) {
  const name = value.match(/\.\/(?<key>[\da-z]+)\./i).groups.key
  const {modelOptions, default: schema} = modelsRequire(value)
  sequelize.define(name, schema, modelOptions)
}

export default sequelize