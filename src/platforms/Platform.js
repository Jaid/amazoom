/* eslint-disable no-unused-vars */

/**
 * @typedef {Object<string, *>} CollectedData
 * @prop {number} price
 * @prop {string} title
 * @prop {string} currency
 */

/**
 * @class
 */
export default class Platform {

  /**
   * @param {import("src/models/ProductState").default} productState
   * @return {string}
   */
  async getUrl(productState) {}

  /**
   * @param {import("got").GotInstance} got
   * @param {import("src/models/ProductState").default} productState
   * @return {import("got").GotInstance}
   */
  async makeGot(got, productState) {}

  /**
   * @param {import("src/models/ProductFetch").default} productFetch
   * @param {import("src/models/ProductState").default} productState
   * @return {CollectedData}
   */
  checkState(response, productState) {}

}