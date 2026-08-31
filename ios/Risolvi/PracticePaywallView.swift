import SwiftUI

struct PracticePaywallView: View {
    @ObservedObject var store: StoreKitManager
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("PRATICA PRO")
                            .font(.caption.weight(.black))
                            .tracking(1.4)
                            .foregroundStyle(.secondary)

                        Text(store.practiceTitle)
                            .font(.largeTitle.bold())
                            .tracking(-1.1)

                        Text("Hai già capito gratis il problema e i prossimi passi. Pro serve solo se vuoi trasformare l’analisi in una pratica pronta da gestire.")
                            .font(.body)
                            .foregroundStyle(.secondary)
                    }

                    if store.practiceAmount != nil || store.practiceCompleteness != nil || store.practiceCategory != nil {
                        VStack(alignment: .leading, spacing: 10) {
                            Text("IL CASO CHE STAI SBLOCCANDO")
                                .font(.caption2.weight(.black))
                                .tracking(1.0)
                                .foregroundStyle(.secondary)

                            if let category = store.practiceCategory {
                                LabeledContent("Categoria", value: categoryLabel(category))
                            }

                            if let amount = store.practiceAmount {
                                LabeledContent("Valore indicativo") {
                                    Text(amount, format: .currency(code: "EUR"))
                                        .fontWeight(.semibold)
                                }
                            }

                            if let completeness = store.practiceCompleteness {
                                LabeledContent("Completezza dati", value: "\(completeness)%")
                            }
                        }
                        .padding(14)
                        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
                    }

                    VStack(alignment: .leading, spacing: 12) {
                        Text("GIÀ GRATIS")
                            .font(.caption.weight(.black))
                            .tracking(1.1)
                            .foregroundStyle(.secondary)

                        freeBenefit("Diagnosi e categoria del problema")
                        freeBenefit("Urgenza, completezza e cosa manca")
                        freeBenefit("Primi passi e fonte ufficiale disponibile")
                    }

                    VStack(alignment: .leading, spacing: 12) {
                        Text("SBLOCCHI CON PRO")
                            .font(.caption.weight(.black))
                            .tracking(1.1)
                            .foregroundStyle(.secondary)

                        benefit("Checklist operativa salvabile", systemImage: "checklist")
                        benefit("Bozza pronta da copiare", systemImage: "doc.text.fill")
                        benefit("Dossier esportabile", systemImage: "shippingbox.fill")
                        benefit("Follow-up ed escalation guidata", systemImage: "arrow.up.right.circle.fill")
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        Text(store.displayPrice)
                            .font(.system(size: 42, weight: .black, design: .rounded))
                        Text("una tantum · una pratica · nessun abbonamento")
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
                                Text("Sblocca Pratica Pro")
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.large)
                    .disabled(store.isPurchasing || store.isLoadingProduct || store.practiceProduct == nil)

                    Button("Continua gratis") {
                        dismiss()
                    }
                    .frame(maxWidth: .infinity)
                    .buttonStyle(.bordered)

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

                        Text("Sblocca la stessa pratica senza passare dal foglio StoreKit. Nessun addebito reale.")
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

                    Text("Pratica Pro organizza il lavoro operativo e non promette l’esito di una controversia. In sviluppo il catalogo StoreKit è locale: non vengono effettuati addebiti reali.")
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

    @ViewBuilder
    private func freeBenefit(_ title: String) -> some View {
        HStack(spacing: 10) {
            Image(systemName: "checkmark.circle.fill")
                .foregroundStyle(.green)
            Text(title)
                .font(.subheadline.weight(.semibold))
            Spacer(minLength: 0)
        }
    }

    private func categoryLabel(_ category: String) -> String {
        switch category.lowercased() {
        case "train": "Treno"
        case "flight": "Volo"
        case "flight-bag": "Bagaglio"
        case "purchase": "Acquisto"
        case "cancel": "Disdetta"
        case "charge": "Addebito / bolletta"
        default: "Altro"
        }
    }
}
