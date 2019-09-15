import Sequelize from "sequelize"
import ms from "ms.macro"

class TwitchToken extends Sequelize.Model {

  static expiryTolerance = ms`10 minutes`

  static associate(models) {
    TwitchToken.belongsTo(models.TwitchUser, {
      foreignKey: {
        allowNull: false,
      },
    })
  }

  /**
   * @async
   * @function
   * @param {import("twitch").AccessToken} token
   */
  async updateToken(token) {
    this.accessToken = token.accessToken
    this.refreshToken = token.refreshToken
    this.tokenExpiryDate = token.expiryDate
    await this.save({
      fields: ["accessToken", "refreshToken", "tokenExpiryDate"],
    })
  }

  isExpired() {
    if (!this.expiry) {
      return false
    }
    return Date.now() > this.expiry.getTime() - TwitchToken.expiryTolerance
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