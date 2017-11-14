const i18next = require('i18next');
const i18nextXHRBackend = require('i18next-xhr-backend');
const jqueryI18next = require('jquery-i18next');

i18next
.use(i18nextXHRBackend)
.init({
    whitelist: ['en-US', 'pt-BR'],
    fallbackLng: 'en-US',
    debug: false,
    ns: ['deimos-issuer'],
    defaultNS: 'deimos-issuer',
    backend: {
      loadPath: 'locales/{{lng}}/{{ns}}.json'
    }
}, function(err, t) {
    jqueryI18next.init(i18next, $);
    $('body').localize();
    $('#language').change(function() {
      i18next.changeLanguage($('#language').val(), function() {
        ipcRenderer.send('language-change', $('#language').val());
         $('body').localize();

      });
    });
});

function loadTranslations() {
    const language = remote.getGlobal('settings').language;
    $('#language').val(language);
    $('#language').trigger('change');
}
