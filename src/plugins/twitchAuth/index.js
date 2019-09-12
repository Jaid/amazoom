import {Strategy as TwitchStrategy} from "passport-twitch-new"
import {koa, config, logger} from "src/core"
import passport from "koa-passport"
import {router} from "fast-koa-router"

import TwitchUser from "./models/TwitchUser"
import scope from "./scope"

import indexContent from "!raw-loader!./index.html"

class TwitchAuth {

  async init() {
    this.passport = passport.use(new TwitchStrategy({
      scope,
      clientID: config.twitchClientId,
      clientSecret: config.twitchClientSecret,
      callbackURL: config.twitchClientCallbackUrl,
    }, async (accessToken, refreshToken, profile, done) => {
      const [twitchUser] = await TwitchUser.upsert({
        accessToken,
        refreshToken,
        broadcasterType: profile.broadcaster_type,
        description: profile.description,
        displayName: profile.display_name,
        twitchId: profile.id,
        loginName: profile.login,
        offlineImageUrl: profile.offline_image_url,
        avatarUrl: profile.profile_image_url,
        viewCount: profile.view_count,
      }, {
        returning: true,
      })
      logger.info("Login from Twitch user %s", profile.login)
      return done(null, twitchUser)
    }))
    this.passport.serializeUser((twitchUser, done) => {
      return done(null, twitchUser.twitchId)
    })
    this.passport.deserializeUser(async (twitchId, done) => {
      debugger
      try {
        const twitchUser = await TwitchUser.findOne({twitchId})
        if (!twitchId) {
          return done(new Error(`No user found with Twitch ID ${twitchId}`))
        }
        return done(null, twitchUser)
      } catch (error) {
        return done(error)
      }
    })
    this.koa = koa
    this.middleware = router({
      get: {
        "/auth": context => {
          context.type = "html"
          context.body = indexContent
        },
        "/auth/twitch": this.passport.authenticate("twitch"),
        "/auth/twitch/callback": this.passport.authenticate("twitch", {
          failureRedirect: "/auth",
          successRedirect: "/auth/twitch/done",
        }),
        "/auth/twitch/done": this.handleAuthDone,
      },
    })
  }

  async ready() {
    this.koa.use(this.passport.initialize())
    this.koa.use(this.passport.session())
    this.koa.use(this.middleware)
  }

  async handleAuthDone(context) {
    context.redirect(config.loginRedirectUrl)
  }

  collectModels() {
    return {
      TwitchUser: require("./models/TwitchUser"),
    }
  }

}

export default new TwitchAuth