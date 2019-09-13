import socketEnhancer from "lib/socketEnhancer"
import socketIo from "socket.io"
import core, {config} from "src/core"
import {last} from "lodash"
import twitchAuth from "src/plugins/twitchAuth"

const commandsRequire = require.context("./commands/", false)

class SocketApi {

  async init() {
    this.socketServer = socketIo(core.insecureServer)
    this.socketServer.on("connection", async client => {
      for (const [commandName, command] of Object.entries(this.commands)) {
        client.on(commandName, async (...args) => {
          const result = await command(client, ...args)
          if (result !== undefined) {
            last(args)(result)
          }
        })
      }
      client.on("login", async auth => {
        const {twitchUser, apiKey} = await twitchAuth.processLogin(auth.code)
        client.emit("persistLogin", {
          twitchId: twitchUser.twitchId,
          displayName: twitchUser.getDisplayName(),
          apiKey: apiKey.key,
        })
        client.twitchUser = twitchUser
      })
      client.emit("twitchAuthUrl", twitchAuth.getAuthUrl(client.id))
    })
    socketEnhancer.enhanceServer(this.socketServer)
    this.commands = commandsRequire.keys().reduce((state, value) => {
      const commandName = value.match(/\.\/(?<key>[\da-z]+)/i).groups.key
      state[commandName] = commandsRequire(value).default
      return state
    }, {})
  }

}

export default new SocketApi