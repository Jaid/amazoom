import core, {logger, config} from "src/core"
import socketEnhancer from "lib/socketEnhancer"
import socketIo from "socket.io"
import ProductState from "src/models/ProductState"
import Product from "src/models/Product"

class SocketApi {

  async init() {
    this.socketServer = socketIo(core.insecureServer)
    this.socketServer.on("connection", async client => {
      client.on("getOverview", async callback => {
        const productStates = await ProductState.findAll({
          order: [["updatedAt", "desc"]],
          raw: true,
          attributes: ["platform", "price", "platformIdentifier", "currency"],
          include: [
            {
              model: Product,
              attributes: ["title"],
              required: true,
            },
          ],
        })
        callback(productStates)
      })
    })
    socketEnhancer.enhanceServer(this.socketServer)
  }

}

export default new SocketApi