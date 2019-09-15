import Sequelize from "sequelize"
import twitch from "twitch"
import {config, logger} from "src/core"
import scope from "src/plugins/twitchAuth/scope"

class TwitchUser extends Sequelize.Model {

  static associate(models) {
    TwitchUser.hasMany(models.TwitchToken, {
      foreignKey: {
        allowNull: false,
      },
    })
    TwitchUser.hasMany(models.ApiKey, {
      foreignKey: {
        allowNull: false,
      },
    })
  }

  static async getByTwitchId(twitchId) {
    const user = await TwitchUser.findOne({
      where: {twitchId},
    })
    return user
  }

  /**
   * @async
   * @param {string} twitchLogin
   * @return {TwitchUser}
   */
  static async getByTwitchLogin(twitchLogin) {
    const user = await TwitchUser.findOne({
      where: {
        loginName: twitchLogin.toLowerCase(),
      },
    })
    return user
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

  getDisplayName() {
    return this.displayName || this.loginName || `#${this.twitchId}`
  }

}

/**
 * @type {import("sequelize").ModelAttributes}
 */
export const schema = {
  twitchId: {
    type: Sequelize.STRING(16),
    unique: true,
    allowNull: false,
  },
  loginName: {
    allowNull: false,
    type: Sequelize.STRING(25), // 25 based on https://discuss.dev.twitch.tv/t/max-length-for-user-names-and-display-names/21315/2
  },
  displayName: Sequelize.STRING(25), // 25 based on https://discuss.dev.twitch.tv/t/max-length-for-user-names-and-display-names/21315/2
  avatarUrl: Sequelize.TEXT,
  // followDate: Sequelize.DATE,
  // subscribedUntil: Sequelize.DATE,
  twitchProfile: Sequelize.JSONB, // viewCount, avatarUrl, offlineImageUrl, description, broadcasterType
}

export default TwitchUser