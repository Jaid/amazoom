import ProductState from "src/models/ProductState"
import Product from "src/models/Product"

export default async () => {
  const productStates = await ProductState.findAll({
    order: [["updatedAt", "desc"]],
    attributes: ["platform", "price", "platformIdentifier", "currency"],
    include: [
      {
        model: Product,
        attributes: ["id", "title"],
        required: true,
      },
    ],
  })
  return productStates.map(productState => productState.toJSON())
}