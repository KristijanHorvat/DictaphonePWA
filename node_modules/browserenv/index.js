var client = require('utilise/client')
  , document

if (!client) {
  global.window = (new (require('jsdom').JSDOM)()).window
  global.document = document = window.document
} else {
  document = window.document
}

module.exports = document
