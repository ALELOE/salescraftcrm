import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { LeadWithCustomer, QuoteLineItem } from '@/lib/types'

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, padding: 50, color: '#1a1a1a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  company: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#1e40af' },
  tagline: { fontSize: 9, color: '#6b7280', marginTop: 4 },
  title: { fontSize: 9, color: '#6b7280', textAlign: 'right' },
  titleBig: { fontSize: 18, fontFamily: 'Helvetica-Bold', textAlign: 'right', marginTop: 4 },
  section: { marginBottom: 20 },
  sectionTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', gap: 4 },
  metaRow: { flexDirection: 'row', marginBottom: 4 },
  metaLabel: { width: 80, color: '#6b7280', fontSize: 9 },
  metaValue: { flex: 1 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6', padding: 8, borderRadius: 4, marginBottom: 4 },
  tableHeaderText: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#374151' },
  tableRow: { flexDirection: 'row', padding: '6 8', borderBottom: '1 solid #e5e7eb' },
  tableCell: { fontSize: 9 },
  colDesc: { flex: 1 },
  colNum: { width: 50, textAlign: 'right' },
  totalsSection: { marginTop: 16, alignItems: 'flex-end' },
  totalRow: { flexDirection: 'row', marginBottom: 4, width: 200 },
  totalLabel: { flex: 1, color: '#6b7280', fontSize: 9 },
  totalValue: { fontSize: 9, textAlign: 'right' },
  totalFinalRow: { flexDirection: 'row', width: 200, borderTop: '1 solid #1e40af', paddingTop: 6, marginTop: 4 },
  totalFinalLabel: { flex: 1, fontFamily: 'Helvetica-Bold', fontSize: 11 },
  totalFinalValue: { fontFamily: 'Helvetica-Bold', fontSize: 11, textAlign: 'right' },
  footer: { position: 'absolute', bottom: 40, left: 50, right: 50, borderTop: '1 solid #e5e7eb', paddingTop: 12, color: '#6b7280', fontSize: 8, textAlign: 'center' },
})

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)
}

interface QuotePDFProps {
  lead: LeadWithCustomer
  items: QuoteLineItem[]
  total: number
  validUntil: string
  quoteId: string
}

export default function QuotePDF({ lead, items, total, validUntil, quoteId }: QuotePDFProps) {
  const { customers } = lead
  const mwst = total * 0.19
  const brutto = total * 1.19
  const shortId = quoteId.substring(0, 8).toUpperCase()
  const today = new Date().toLocaleDateString('de-DE')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.company}>Dachblick</Text>
            <Text style={styles.tagline}>Velux Dachfenster Fachbetrieb</Text>
          </View>
          <View>
            <Text style={styles.title}>Dokument</Text>
            <Text style={styles.titleBig}>Angebot</Text>
          </View>
        </View>

        <View style={[styles.section, { flexDirection: 'row', gap: 40 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Empfänger</Text>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>
              {customers.vorname} {customers.nachname}
            </Text>
            <Text>{customers.plz} {customers.city}</Text>
            <Text>{customers.email}</Text>
            <Text>{customers.phone}</Text>
          </View>
          <View style={{ width: 160 }}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Angebots-Nr.</Text>
              <Text style={styles.metaValue}>{shortId}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Datum</Text>
              <Text style={styles.metaValue}>{today}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Gültig bis</Text>
              <Text style={styles.metaValue}>
                {validUntil ? new Date(validUntil).toLocaleDateString('de-DE') : '—'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Positionen</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDesc]}>Beschreibung</Text>
            <Text style={[styles.tableHeaderText, styles.colNum]}>Menge</Text>
            <Text style={[styles.tableHeaderText, styles.colNum]}>Einzelpreis</Text>
            <Text style={[styles.tableHeaderText, styles.colNum]}>Gesamt</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colDesc]}>{item.beschreibung}</Text>
              <Text style={[styles.tableCell, styles.colNum]}>{item.menge}</Text>
              <Text style={[styles.tableCell, styles.colNum]}>{formatCurrency(item.einzelpreis)}</Text>
              <Text style={[styles.tableCell, styles.colNum]}>{formatCurrency(item.menge * item.einzelpreis)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Nettobetrag</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>MwSt. 19%</Text>
            <Text style={styles.totalValue}>{formatCurrency(mwst)}</Text>
          </View>
          <View style={styles.totalFinalRow}>
            <Text style={styles.totalFinalLabel}>Gesamtbetrag</Text>
            <Text style={styles.totalFinalValue}>{formatCurrency(brutto)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Vielen Dank für Ihr Vertrauen. — Dachblick Velux Fachbetrieb
        </Text>
      </Page>
    </Document>
  )
}
