import Sequelize from "sequelize"
import twitch from "twitch"
import {config, logger} from "src/core"
import scope from "src/plugins/twitchAuth/scope"

class TwitchToken extends Sequelize.Model {

  static associate(models) {
    TwitchToken.belongsTo(models.TwitchUser, {
      foreignKey: {
        allowNull: false,
      },
    })
  }

  async toTwitchClient() {
    const client = await twitch.withCredentials(config.twitchClientId, this.accessToken, scope, {
      clientSecret: config.twitchClientSecret,
      refreshToken: this.refreshToken,
      onRefresh: accessToken => this.updateToken(accessToken),
      expiry: this.tokenExpiryDate,
    }, {
      preAuth: true,
      initialScopes: scope,
    })
    if (!this.tokenExpiryDate) {
      logger.info("Initial expiry date not set for user %s. Forcing access token refresh.", this.loginName)
      await client.refreshAccessToken()
    }
    logger.info("Created client for user %s", this.loginName)
    return client
  }

  /**
   * @async
   * @function
   * @param {import("twitch").AccessToken} token
   */
  async updateToken(token) {
    logger.info("Refresh token of user %s", this.loginName)
    this.accessToken = token.accessToken
    this.refreshToken = token.refreshToken
    this.tokenExpiryDate = token.expiryDate
    await this.save({
      fields: ["accessToken", "refreshToken", "tokenExpiryDate"],
    })
  }

}

/**
 * @type {import("sequelize").ModelAttributes}
 */
export const schema = {
  accessToken: {
    allowNull: false,
    type: Sequelize.STRING(30),
  },
  refreshToken: Sequelize.STRING(50),
  expiry: Sequelize.DATE,
}

export default TwitchToken