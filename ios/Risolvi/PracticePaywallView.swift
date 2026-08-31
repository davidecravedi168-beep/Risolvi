import SwiftUI

struct PracticePaywallView: View {
    @ObservedObject var store: StoreKitManager
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("PRATICA PRO")
                            .font(.caption.weight(.black))
                            .tracking(1.4)
                            .foregroundStyle(.secondary)

                        Text("Porta il problema fino al reclamo pronto")
                            .font(.largeTitle.bold())
                            .tracking(-1.1)

                        Text("Un acquisto sblocca una pratica completa. Nessun abbonamento.")
                            .font(.body)
                            .foregroundStyle(.secondary)
                    }

                    VStack(spacing: 12) {
                        benefit("Reclamo pronto da copiare", systemImage: "doc.text.fill")
                        benefit("Resolution Pack completo", systemImage: "shippingbox.fill")
                        benefit("Prove e prossima azione", systemImage: "checklist")
                        benefit("Follow-up ed escalation guidata", systemImage: "arrow.up.right.circle.fill")
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        Text(store.displayPrice)
                            .font(.system(size: 42, weight: .black, design: .rounded))
                        Text("una tantum · una pratica")
                            .foregroundStyle(.secondary)
                    }

                    Button {
                        Task { await store.purchasePractice() }
                    } label: {
                        HStack {
                            if store.isPurchasing {
                                ProgressView()
                            } else {
                                Image(systemName: "apple.logo")
                                Text("Acquista con App Store")
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.large)
                    .disabled(store.isPurchasing || store.isLoadingProduct || store.practiceProduct == nil)

                    if store.practiceProduct == nil {
                        Button("Ricarica prodotto di test") {
                            Task { await store.loadPracticeProduct() }
                        }
                        .frame(maxWidth: .infinity)
                        .buttonStyle(.bordered)
                    }

                    #if DEBUG
                    Divider()

                    VStack(alignment: .leading, spacing: 8) {
                        Label("MODALITÀ SVILUPPO", systemImage: "hammer.fill")
                            .font(.caption.weight(.black))
                            .foregroundStyle(.orange)

                        Text("Puoi sbloccare la pratica senza passare dal foglio di pagamento StoreKit. Nessun addebito reale.")
                            .font(.footnote)
                            .foregroundStyle(.secondary)

                        Button("Sblocca pratica · DEBUG") {
                            store.debugUnlockPractice()
                        }
                        .frame(maxWidth: .infinity)
                        .buttonStyle(.bordered)
                    }
                    #endif

                    if let statusMessage = store.statusMessage {
                        Text(statusMessage)
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                            .padding(12)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 14))
                    }

                    Text("Il pagamento viene gestito da StoreKit. In sviluppo il catalogo è locale e non richiede prodotti già creati in App Store Connect.")
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                }
                .padding(20)
            }
            .navigationTitle(store.displayName)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Chiudi") { dismiss() }
                }
            }
        }
        .presentationDetents([.large])
    }

    @ViewBuilder
    private func benefit(_ title: String, systemImage: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: systemImage)
                .font(.title3.weight(.semibold))
                .frame(width: 30)
                .foregroundStyle(.tint)

            Text(title)
                .font(.body.weight(.semibold))

            Spacer(minLength: 0)
        }
        .padding(14)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
    }
}
