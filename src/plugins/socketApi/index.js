import socketEnhancer from "lib/socketEnhancer"
import socketIo from "socket.io"
import core from "src/core"
import {last} from "lodash"

const commandsRequire = require.context("./commands/", false)

class SocketApi {

  async init() {
    this.socketServer = socketIo(core.insecureServer)
    this.socketServer.on("connection", client => {
      for (const [commandName, command] of Object.entries(this.commands)) {
        client.on(commandName, async (...args) => {
          const result = await command(client, ...args)
          if (result !== undefined) {
            last(args)(result)
          }
        })
      }
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