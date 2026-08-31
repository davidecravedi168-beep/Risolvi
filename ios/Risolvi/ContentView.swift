import SwiftUI
import WebKit
import UIKit

final class WebViewModel: ObservableObject {
    @Published var currentURL: URL?
    @Published var isLoading = false
    @Published var loadFailed = false
    @Published var reloadToken = UUID()
    @Published var homeToken = UUID()

    let homeURL: URL

    init() {
        let configured = Bundle.main.object(forInfoDictionaryKey: "RISOLVI_BASE_URL") as? String
        let fallback = "https://davidecravedi168-beep.github.io/Risolvi/"
        self.homeURL = URL(string: configured?.isEmpty == false ? configured! : fallback)!
        self.currentURL = self.homeURL
    }

    func reload() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
        loadFailed = false
        reloadToken = UUID()
    }

    func goHome() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
        loadFailed = false
        currentURL = homeURL
        homeToken = UUID()
    }
}

struct ContentView: View {
    @StateObject private var web = WebViewModel()
    @State private var showPrivacy = false

    var body: some View {
        NavigationStack {
            ZStack {
                WebContainer(model: web)
                    .ignoresSafeArea(edges: .bottom)

                if web.loadFailed {
                    ContentUnavailableView {
                        Label("RISOLVI non è raggiungibile", systemImage: "wifi.exclamationmark")
                    } description: {
                        Text("Controlla la connessione e riprova. Nessun dato viene inviato da questa schermata di errore.")
                    } actions: {
                        Button("Riprova") { web.reload() }
                            .buttonStyle(.borderedProminent)
                    }
                    .padding()
                    .background(.regularMaterial)
                }
            }
            .navigationTitle("RISOLVI")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItemGroup(placement: .topBarLeading) {
                    Button {
                        web.goHome()
                    } label: {
                        Image(systemName: "house")
                    }
                    .accessibilityLabel("Torna alla home di Risolvi")

                    Button {
                        web.reload()
                    } label: {
                        Image(systemName: "arrow.clockwise")
                    }
                    .accessibilityLabel("Aggiorna")
                }

                ToolbarItemGroup(placement: .topBarTrailing) {
                    ShareLink(item: web.currentURL ?? web.homeURL) {
                        Image(systemName: "square.and.arrow.up")
                    }
                    .accessibilityLabel("Condividi")

                    Button {
                        showPrivacy = true
                    } label: {
                        Image(systemName: "shield.lefthalf.filled")
                    }
                    .accessibilityLabel("Privacy e sicurezza")
                }
            }
            .sheet(isPresented: $showPrivacy) {
                NavigationStack {
                    List {
                        Section("Permessi") {
                            Label("Fotocamera, foto e microfono vengono richiesti solo quando una funzione li usa.", systemImage: "hand.raised")
                        }
                        Section("Navigazione") {
                            Label("I link esterni vengono aperti fuori dal contenitore RISOLVI.", systemImage: "safari")
                            Label("Il contenuto principale usa HTTPS.", systemImage: "lock")
                        }
                        Section("Release") {
                            Text("Prima della pubblicazione commerciale devono essere definite Privacy Policy, App Privacy e URL di supporto definitivi in App Store Connect.")
                        }
                    }
                    .navigationTitle("Privacy")
                    .navigationBarTitleDisplayMode(.inline)
                    .toolbar {
                        ToolbarItem(placement: .confirmationAction) {
                            Button("Fine") { showPrivacy = false }
                        }
                    }
                }
            }
        }
    }
}

struct WebContainer: UIViewRepresentable {
    @ObservedObject var model: WebViewModel

    func makeCoordinator() -> Coordinator {
        Coordinator(model: model)
    }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.contentInsetAdjustmentBehavior = .automatic
        webView.isOpaque = false
        webView.backgroundColor = .systemBackground

        let refresh = UIRefreshControl()
        refresh.addTarget(context.coordinator, action: #selector(Coordinator.refresh(_:)), for: .valueChanged)
        webView.scrollView.refreshControl = refresh
        context.coordinator.webView = webView
        context.coordinator.loadHomeIfNeeded()
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        if context.coordinator.lastReloadToken != model.reloadToken {
            context.coordinator.lastReloadToken = model.reloadToken
            webView.reload()
        }
        if context.coordinator.lastHomeToken != model.homeToken {
            context.coordinator.lastHomeToken = model.homeToken
            webView.load(URLRequest(url: model.homeURL, cachePolicy: .reloadRevalidatingCacheData, timeoutInterval: 20))
        }
    }

    final class Coordinator: NSObject, WKNavigationDelegate {
        let model: WebViewModel
        weak var webView: WKWebView?
        var lastReloadToken: UUID
        var lastHomeToken: UUID
        private var didInitialLoad = false

        init(model: WebViewModel) {
            self.model = model
            self.lastReloadToken = model.reloadToken
            self.lastHomeToken = model.homeToken
        }

        func loadHomeIfNeeded() {
            guard !didInitialLoad, let webView else { return }
            didInitialLoad = true
            webView.load(URLRequest(url: model.homeURL, cachePolicy: .returnCacheDataElseLoad, timeoutInterval: 20))
        }

        @objc func refresh(_ sender: UIRefreshControl) {
            model.loadFailed = false
            webView?.reload()
            sender.endRefreshing()
        }

        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            model.isLoading = true
            model.loadFailed = false
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            model.isLoading = false
            model.loadFailed = false
            model.currentURL = webView.url ?? model.homeURL
            webView.scrollView.refreshControl?.endRefreshing()
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            fail(webView)
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            fail(webView)
        }

        private func fail(_ webView: WKWebView) {
            model.isLoading = false
            model.loadFailed = true
            webView.scrollView.refreshControl?.endRefreshing()
        }

        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = navigationAction.request.url else {
                decisionHandler(.cancel)
                return
            }

            if url.scheme == "about" || url.scheme == "blob" || url.scheme == "data" {
                decisionHandler(.allow)
                return
            }

            let homeHost = model.homeURL.host
            if let host = url.host, host != homeHost {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
                return
            }

            decisionHandler(.allow)
        }
    }
}
