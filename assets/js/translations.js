window.localization = window.localization || {},
function(n) {
  localization.translate = {
    signIn: function() {
      $('#issuer-label').text(i18n.__('Issuer Account'))
      $('#distribuitor-label').text(i18n.__('Distributor Account'))
      $('#signin-button').text(i18n.__('Continue'))
    },
    manageAssets: function() {
      $('#assets-balances-label').text(i18n.__('Asset Balances'))
    },
    init: function() {
     this.signIn()
     this.manageAssets()
    }
};

 n(function() {
   localization.translate.init();
 })

}(jQuery);
