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
      await TwitchUser.upsert({
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
      })
      logger.info("Login from Twitch user %s", profile.login)
      return done(null, profile)
    }))
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
          session: false,
        }),
        "/auth/twitch/done": this.handleAuthDone,
      },
    })
  }

  async ready() {
    this.koa.use(this.passport.initialize())
    this.koa.use(this.middleware)
  }

  handleAuthDone(context) {
    context.redirect(config.loginRedirectUrl)
  }

  collectModels() {
    return {
      TwitchUser: require("./models/TwitchUser"),
    }
  }

}

export default new TwitchAuth