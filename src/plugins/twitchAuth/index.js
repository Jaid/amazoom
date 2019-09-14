import url from "url"

import {config, logger} from "src/core"
import twitch from "twitch"

import TwitchUser from "./models/TwitchUser"
import scope from "./scope"
import TwitchToken from "./models/TwitchToken"
import ApiKey from "./models/ApiKey"

class TwitchAuth {

  async init() {
    this.twitchClient = twitch.withClientCredentials(config.twitchClientId, config.twitchClientSecret)
  }

  collectModels() {
    const models = {}
    const modelsRequire = require.context("./models/", true, /.js$/)
    for (const value of modelsRequire.keys()) {
      const modelName = value.match(/\.\/(?<key>[\da-z]+)\./i).groups.key
      models[modelName] = modelsRequire(value)
    }
    return models
  }

  /**
   * @typedef {Object} ProcessLoginResult
   * @prop {TwitchToken} twitchToken
   * @prop {TwitchUser} twitchUser
   * @prop {ApiKey} apiKey
   */

  /**
   * @async
   * @param {string} code
   * @return {Promise<ProcessLoginResult>}
   */
  async processLogin(code) {
    const {accessToken, refreshToken} = await twitch.getAccessToken(config.twitchClientId, config.twitchClientSecret, code, config.twitchClientCallbackUrl)
    const tokenInfo = await twitch.getTokenInfo(config.twitchClientId, accessToken)
    if (!tokenInfo.valid) {
      throw new Error(`Token for user ${tokenInfo.userName} (ID ${tokenInfo.userId}) is invalid for some reason`)
    }
    let twitchUser = await TwitchUser.findOne({
      where: {twitchId: tokenInfo.userId},
    })
    if (!twitchUser) {
      logger.debug("Twitch user is new")
      twitchUser = await TwitchUser.create({
        twitchId: tokenInfo.userId,
        loginName: tokenInfo.userName,
      })
    }
    const twitchToken = await TwitchToken.create({
      accessToken,
      refreshToken,
      tokenExpiryDate: tokenInfo.expiryDate,
      TwitchUserId: twitchUser.id,
    })
    const twitchProfile = await this.twitchClient.helix.users.getUserById(twitchUser.twitchId)
    twitchUser.displayName = twitchProfile.displayName
    twitchUser.avatarUrl = twitchProfile.profilePictureUrl
    await twitchUser.save()
    const [apiKey] = await ApiKey.findOrCreate({
      where: {
        TwitchUserId: twitchUser.id,
      },
    })
    return {
      apiKey,
      twitchToken,
      twitchUser,
    }
  }

  /**
   * @param {string} state
   * @return {string}
   */
  getAuthUrl(state) {
    return url.format({
      protocol: "https",
      host: "id.twitch.tv",
      pathname: "oauth2/authorize",
      query: {
        state,
        client_id: config.twitchClientId,
        redirect_uri: config.twitchClientCallbackUrl,
        scope: scope.join(" "),
        response_type: "code",
      },
    })
  }

}

export default new TwitchAuth