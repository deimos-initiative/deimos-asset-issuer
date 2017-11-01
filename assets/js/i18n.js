const path = require('path')
const electron = require('electron')
const fs = require('fs')
let loadedLanguage
let app = electron.app ? electron.app : electron.remote.app

module.exports = i18n

function i18n() {
   let localizationFile = '../../i18n/' + app.getLocale() + '.js'
   console.log(localizationFile)
  if(fs.existsSync(path.join(__dirname, localizationFile))) {
    loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, localizationFile), 'utf8'))
  }
  else {
    loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, 'en.js'), 'utf8'))
  }
}

i18n.prototype.__ = function(phrase) {
  let translation = loadedLanguage[phrase]
  if(translation === undefined) {
       translation = phrase
  }
  return translation
}
