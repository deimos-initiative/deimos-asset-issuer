window.localization = window.localization || {},
function(n) {
  localization.translate = {
    deimosApp: function() {
      $('[data-label-issuer-account]').text(i18n.__('Issuer Account'))
      $('[data-label-distribuitor-account]').text(i18n.__('Distributor Account'))
      $('[data-label-continue]').text(i18n.__('Continue'))
      $('[data-label-close-app]').text(i18n.__('Close App'))
      $('[data-label-asset-balances]').text(i18n.__('Asset Balances'))
      $('[data-label-no-balance]').text(i18n.__('No balance'))
      $('[data-label-public-key]').text(i18n.__('Public Key'))
      $('[data-label-secret-seed]').text(i18n.__('Secret Seed'))
      $('[data-label-create-key-pairs]').text(i18n.__('Create Key Pairs'))
      $('[data-label-issue-a-new-asset]').text(i18n.__('Issue a New Asset'))
      $('[data-label-manage-assets]').text(i18n.__('Manage Assets'))
      $('[data-label-last-balances-update]').text(i18n.__('Last balances update'))
      $('[data-label-update-balances-error]').text(i18n.__('Update balances error'))
    },
    init: function() {
     this.deimosApp()
     //this.manageAssets()
    }
  }

  n(function() {
    localization.translate.init();
  })

}(jQuery);
