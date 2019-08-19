import {minify} from "html-minifier"

export default html => {
  return minify(html, {
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    continueOnParseError: true,
    decodeEntities: true,
    keepClosingSlash: true,
    quoteCharacter: "\"",
    removeAttributeQuotes: true,
    removeComments: true,
  })
}