import Foundation

enum NativeStoreBridge {
    static let messageHandler = "risolviStore"

    static let userScript = #"""
    (function() {
      if (window.__risolviNativeStoreBridgeInstalled) return;
      window.__risolviNativeStoreBridgeInstalled = true;

      function nativeHandler() {
        return window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.risolviStore;
      }

      function relabelCheckout() {
        var buttons = document.querySelectorAll('.payrow .paybtn');
        if (buttons.length) {
          buttons.forEach(function(button, index) {
            if (index === 0) {
              button.textContent = ' App Store';
              button.style.display = '';
            } else {
              button.style.display = 'none';
            }
          });
        }

        var note = document.querySelector('#checkoutModal .micro');
        if (note) {
          note.textContent = 'App iOS: acquisto gestito da StoreKit. In sviluppo usa il catalogo locale di test.';
        }
      }

      function install() {
        relabelCheckout();

        if (!window.App || typeof window.App.pay !== 'function') {
          setTimeout(install, 100);
          return;
        }

        if (window.__risolviOriginalPay) return;

        window.__risolviOriginalPay = window.App.pay.bind(window.App);
        window.App.pay = function(method) {
          var handler = nativeHandler();
          if (handler) {
            handler.postMessage({
              action: 'purchasePractice',
              method: String(method || '')
            });
            return;
          }
          return window.__risolviOriginalPay(method);
        };

        window.__risolviStoreKitComplete = function() {
          window.__risolviOriginalPay('App Store');
          return 'delivered';
        };

        relabelCheckout();
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', install, { once: true });
      } else {
        install();
      }

      var observer = new MutationObserver(relabelCheckout);
      observer.observe(document.documentElement, { childList: true, subtree: true });
    })();
    """#
}
