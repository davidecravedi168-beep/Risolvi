import Foundation
import StoreKit
import SwiftUI

enum RisolviStoreError: LocalizedError {
    case failedVerification

    var errorDescription: String? {
        switch self {
        case .failedVerification:
            return "La transazione App Store non ha superato la verifica locale."
        }
    }
}

@MainActor
final class StoreKitManager: ObservableObject {
    static let practiceProductID = "it.risolvi.practice.pro"

    @Published private(set) var practiceProduct: Product?
    @Published private(set) var isLoadingProduct = false
    @Published private(set) var isPurchasing = false
    @Published var isPaywallPresented = false
    @Published private(set) var statusMessage: String?
    @Published private(set) var pendingDelivery = false
    @Published private(set) var deliveryToken = UUID()

    private var pendingTransaction: Transaction?
    private var updatesTask: Task<Void, Never>?

    init() {
        updatesTask = observeTransactions()
        Task { [weak self] in
            guard let self else { return }
            await self.loadPracticeProduct()
            await self.recoverUnfinishedPractice()
        }
    }

    deinit {
        updatesTask?.cancel()
    }

    var displayPrice: String {
        practiceProduct?.displayPrice ?? "€6,99"
    }

    var displayName: String {
        practiceProduct?.displayName ?? "Pratica Pro"
    }

    func presentPracticePaywall() {
        statusMessage = nil
        isPaywallPresented = true

        if practiceProduct == nil && !isLoadingProduct {
            Task { await loadPracticeProduct() }
        }
    }

    func loadPracticeProduct() async {
        guard !isLoadingProduct else { return }
        isLoadingProduct = true
        defer { isLoadingProduct = false }

        do {
            let products = try await Product.products(for: [Self.practiceProductID])
            practiceProduct = products.first(where: { $0.id == Self.practiceProductID })

            if practiceProduct == nil {
                statusMessage = "Prodotto di test non disponibile. Verifica che Risolvi.storekit sia attivo nello scheme."
            } else if statusMessage?.contains("Prodotto di test") == true {
                statusMessage = nil
            }
        } catch {
            statusMessage = "Impossibile caricare Pratica Pro: \(error.localizedDescription)"
        }
    }

    func purchasePractice() async {
        guard !isPurchasing else { return }

        if practiceProduct == nil {
            await loadPracticeProduct()
        }

        guard let product = practiceProduct else {
            statusMessage = "Pratica Pro non è ancora disponibile nel catalogo StoreKit di test."
            return
        }

        isPurchasing = true
        statusMessage = nil
        defer { isPurchasing = false }

        do {
            let result = try await product.purchase()

            switch result {
            case .success(let verification):
                let transaction = try verified(verification)
                guard transaction.productID == Self.practiceProductID else {
                    statusMessage = "La transazione ricevuta non corrisponde a Pratica Pro."
                    return
                }
                queueForDelivery(transaction)

            case .pending:
                statusMessage = "Acquisto in attesa di conferma. La pratica verrà sbloccata appena StoreKit lo completa."

            case .userCancelled:
                statusMessage = nil

            @unknown default:
                statusMessage = "StoreKit ha restituito uno stato di acquisto non riconosciuto."
            }
        } catch {
            statusMessage = "Acquisto non completato: \(error.localizedDescription)"
        }
    }

    #if DEBUG
    func debugUnlockPractice() {
        pendingTransaction = nil
        pendingDelivery = true
        deliveryToken = UUID()
        statusMessage = "Sblocco locale DEBUG: nessun addebito reale."
        isPaywallPresented = false
    }
    #endif

    func finishPendingDelivery() async {
        guard pendingDelivery else { return }

        if let transaction = pendingTransaction {
            await transaction.finish()
        }

        pendingTransaction = nil
        pendingDelivery = false
        statusMessage = nil
    }

    func markDeliveryPending() {
        guard pendingDelivery else { return }
        statusMessage = "Acquisto verificato. La pratica verrà consegnata appena la pagina RISOLVI è pronta."
    }

    private func queueForDelivery(_ transaction: Transaction) {
        pendingTransaction = transaction
        pendingDelivery = true
        deliveryToken = UUID()
        statusMessage = nil
        isPaywallPresented = false
    }

    private func recoverUnfinishedPractice() async {
        for await result in Transaction.unfinished {
            do {
                let transaction = try verified(result)
                guard transaction.productID == Self.practiceProductID else { continue }
                queueForDelivery(transaction)
                return
            } catch {
                statusMessage = "È presente un acquisto non ancora verificabile. Riprova più tardi."
            }
        }
    }

    private func observeTransactions() -> Task<Void, Never> {
        Task { [weak self] in
            for await result in Transaction.updates {
                guard let self else { return }

                do {
                    let transaction = try self.verified(result)
                    guard transaction.productID == Self.practiceProductID else { continue }
                    self.queueForDelivery(transaction)
                } catch {
                    self.statusMessage = "Aggiornamento StoreKit non verificato."
                }
            }
        }
    }

    private func verified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .verified(let safe):
            return safe
        case .unverified:
            throw RisolviStoreError.failedVerification
        }
    }
}
