import Product from "src/models/Product"
import ProductState from "src/models/ProductState"

export default async (client, payload) => {
  const product = await Product.findByPk(payload, {
    include: [
      {
        model: ProductState,
      },
    ],
  })
  return product.toJSON()
}