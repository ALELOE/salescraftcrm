import { NextResponse } from 'next/server'
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import React from 'react'

const C = {
  black: '#0a0a0a',
  mid: '#525252',
  muted: '#a3a3a3',
  border: '#ececec',
  bg: '#fafafa',
  white: '#ffffff',
  accent: '#0a0a0a',
}

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9.5, color: C.black, backgroundColor: C.white },

  // Cover
  cover: { flex: 1, padding: 60, justifyContent: 'space-between' },
  coverTop: { marginTop: 60 },
  coverLabel: { fontSize: 8, color: C.muted, letterSpacing: 1.5, marginBottom: 16 },
  coverTitle: { fontFamily: 'Helvetica-Bold', fontSize: 32, color: C.black, marginBottom: 8 },
  coverSub: { fontSize: 13, color: C.mid },
  coverMeta: { borderTop: `1 solid ${C.border}`, paddingTop: 20 },
  coverMetaRow: { flexDirection: 'row', marginBottom: 6 },
  coverMetaLabel: { width: 100, color: C.muted, fontSize: 9 },
  coverMetaValue: { fontSize: 9, color: C.black },

  // Content pages
  content: { padding: '40 50' },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 12, borderBottom: `1 solid ${C.border}` },
  pageHeaderLeft: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: C.black },
  pageHeaderRight: { fontSize: 8, color: C.muted },
  footer: { position: 'absolute', bottom: 28, left: 50, right: 50, flexDirection: 'row', justifyContent: 'space-between', borderTop: `1 solid ${C.border}`, paddingTop: 8 },
  footerText: { fontSize: 7.5, color: C.muted },

  // Typography
  h1: { fontFamily: 'Helvetica-Bold', fontSize: 18, color: C.black, marginBottom: 20 },
  h2: { fontFamily: 'Helvetica-Bold', fontSize: 12, color: C.black, marginBottom: 10, marginTop: 24 },
  h3: { fontFamily: 'Helvetica-Bold', fontSize: 9.5, color: C.black, marginBottom: 6, marginTop: 14 },
  label: { fontSize: 7.5, color: C.muted, letterSpacing: 1, marginBottom: 8 },
  body: { fontSize: 9.5, color: C.mid, lineHeight: 1.55, marginBottom: 6 },

  // Table
  table: { marginBottom: 16 },
  tableHead: { flexDirection: 'row', backgroundColor: C.bg, padding: '7 8', borderRadius: 3 },
  tableHeadCell: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.mid },
  tableRow: { flexDirection: 'row', padding: '7 8', borderBottom: `1 solid ${C.border}` },
  tableCell: { fontSize: 9, color: C.black },
  tableCellMuted: { fontSize: 9, color: C.mid },

  // File entry
  fileRow: { flexDirection: 'row', paddingVertical: 5, borderBottom: `1 solid ${C.border}` },
  filePath: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: C.black, width: 220 },
  fileDesc: { fontSize: 8.5, color: C.mid, flex: 1, lineHeight: 1.4 },

  // Tag/badge
  tag: { backgroundColor: C.bg, borderRadius: 3, padding: '2 6', marginRight: 5, marginBottom: 4 },
  tagText: { fontSize: 8, color: C.mid },

  // Section divider
  divider: { borderBottom: `1 solid ${C.border}`, marginVertical: 14 },

  // DB field row
  fieldRow: { flexDirection: 'row', paddingVertical: 4, borderBottom: `1 solid ${C.border}` },
  fieldName: { fontFamily: 'Helvetica-Bold', fontSize: 8.5, color: C.black, width: 130 },
  fieldType: { fontSize: 8.5, color: '#6366f1', width: 80 },
  fieldDesc: { fontSize: 8.5, color: C.mid, flex: 1 },
})

// ─── Helper components ────────────────────────────────────────────────────────

function PageHeader({ section }: { section: string }) {
  return React.createElement(View, { style: s.pageHeader },
    React.createElement(Text, { style: s.pageHeaderLeft }, 'SalesCraft CRM — Technische Dokumentation'),
    React.createElement(Text, { style: s.pageHeaderRight }, section),
  )
}

function Footer({ page }: { page: number }) {
  return React.createElement(View, { style: s.footer },
    React.createElement(Text, { style: s.footerText }, `SalesCraft CRM · Stand ${new Date().toLocaleDateString('de-DE')}`),
    React.createElement(Text, { style: s.footerText }, `Seite ${page}`),
  )
}

function SectionLabel({ children }: { children: string }) {
  return React.createElement(Text, { style: s.label }, children.toUpperCase())
}

function H2({ children }: { children: string }) {
  return React.createElement(Text, { style: s.h2 }, children)
}

function H3({ children }: { children: string }) {
  return React.createElement(Text, { style: s.h3 }, children)
}

function Body({ children }: { children: string }) {
  return React.createElement(Text, { style: s.body }, children)
}

function Divider() {
  return React.createElement(View, { style: s.divider })
}

function FileRow({ path, desc }: { path: string; desc: string }) {
  return React.createElement(View, { style: s.fileRow },
    React.createElement(Text, { style: s.filePath }, path),
    React.createElement(Text, { style: s.fileDesc }, desc),
  )
}


// ─── Document ─────────────────────────────────────────────────────────────────

function DocsPDF() {
  const today = new Date().toLocaleDateString('de-DE')

  return React.createElement(Document, { title: 'SalesCraft CRM — Technische Dokumentation' },

    // ── Seite 1: Cover ──────────────────────────────────────────────────────
    React.createElement(Page, { size: 'A4', style: s.page },
      React.createElement(View, { style: s.cover },
        React.createElement(View, { style: s.coverTop },
          React.createElement(Text, { style: s.coverLabel }, 'TECHNISCHE DOKUMENTATION'),
          React.createElement(Text, { style: s.coverTitle }, 'SalesCraft CRM'),
          React.createElement(Text, { style: s.coverSub }, 'Dachblick Velux Leadmanagement-System'),
        ),
        React.createElement(View, { style: s.coverMeta },
          ...[
            ['Erstellt am', today],
            ['Version', '1.0'],
            ['Framework', 'Next.js 14 (App Router)'],
            ['Datenbank', 'Supabase (PostgreSQL)'],
            ['Deployment', 'Vercel'],
            ['Repository', 'github.com/ALELOE/salescraftcrm'],
          ].map(([label, value]) =>
            React.createElement(View, { style: s.coverMetaRow, key: label },
              React.createElement(Text, { style: s.coverMetaLabel }, label),
              React.createElement(Text, { style: s.coverMetaValue }, value),
            )
          ),
        ),
      ),
    ),

    // ── Seite 2: Übersicht & Tech Stack ─────────────────────────────────────
    React.createElement(Page, { size: 'A4', style: s.page },
      React.createElement(View, { style: s.content },
        React.createElement(PageHeader, { section: '1. Übersicht' }),
        React.createElement(Text, { style: s.h1 }, '1. Übersicht'),
        React.createElement(Body, null, 'SalesCraft CRM ist ein internes Vertriebssystem für den Velux-Fachbetrieb Dachblick. Es ermöglicht die vollständige Verwaltung von Leads — vom Eingang über die Landingpage-Webhook-Schnittstelle oder manueller Erfassung bis hin zu Angebotserstellung, Terminplanung und Statusverfolgung durch die Sales Pipeline.'),
        React.createElement(Body, null, 'Die Anwendung ist vollständig auf Deutsch (formelles "Sie") ausgelegt und folgt einem minimalistischen Designsystem im Linear/Notion-Stil: monochromes Farbschema, keine Schatten, keine Verläufe, klare Typografie.'),
        React.createElement(H2, null, '2. Technologie-Stack'),
        React.createElement(SectionLabel, null, 'Frontend & Framework'),
        React.createElement(View, { style: s.table },
          ...[
            ['Next.js 14', 'App Router', 'Server- und Client-Komponenten, API Routes, Middleware'],
            ['TypeScript 5', 'Strict Mode', 'Vollständige Typsicherheit über das gesamte Projekt'],
            ['Tailwind CSS 3.4', 'Utility-First CSS', 'Design-Tokens und Utility-Klassen'],
            ['Inter', 'Google Fonts', 'Primäre Schriftart (400/500/600)'],
            ['Lucide React', 'Icon Library', 'Konsistente SVG-Icons'],
            ['Sonner', 'Toast Library', 'Benutzer-Feedback (Erfolg/Fehler)'],
          ].map(([tech, cat, desc], i) =>
            React.createElement(View, { style: i === 0 ? s.tableHead : s.tableRow, key: tech },
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.tableCell), width: 100 } }, tech),
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.tableCellMuted), width: 90 } }, cat),
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.tableCellMuted), flex: 1 } }, desc),
            )
          ),
        ),
        React.createElement(SectionLabel, null, 'Backend & Datenbank'),
        React.createElement(View, { style: s.table },
          ...[
            ['Supabase', 'Auth + PostgreSQL', 'Authentifizierung, Datenbank, Row Level Security (RLS)'],
            ['@supabase/ssr', 'SSR Client', 'Cookie-basierte Auth für Server Components'],
            ['Resend', 'E-Mail Service', 'Transaktions-E-Mails (Angebote, Benachrichtigungen)'],
          ].map(([tech, cat, desc], i) =>
            React.createElement(View, { style: i === 0 ? s.tableHead : s.tableRow, key: tech },
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.tableCell), width: 100 } }, tech),
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.tableCellMuted), width: 90 } }, cat),
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.tableCellMuted), flex: 1 } }, desc),
            )
          ),
        ),
        React.createElement(SectionLabel, null, 'Weitere Libraries'),
        React.createElement(View, { style: s.table },
          ...[
            ['@react-pdf/renderer', 'PDF-Generierung', 'Angebot-PDFs (Client-seitig per Download-Button)'],
            ['date-fns', 'Datumsformatierung', 'Deutsche Datumsformate (de Locale)'],
            ['react-day-picker', 'Datumauswahl', 'Kalender-Komponente für Terminplanung'],
          ].map(([tech, cat, desc], i) =>
            React.createElement(View, { style: i === 0 ? s.tableHead : s.tableRow, key: tech },
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.tableCell), width: 110 } }, tech),
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.tableCellMuted), width: 80 } }, cat),
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.tableCellMuted), flex: 1 } }, desc),
            )
          ),
        ),
      ),
      React.createElement(Footer, { page: 2 }),
    ),

    // ── Seite 3: Projektstruktur ─────────────────────────────────────────────
    React.createElement(Page, { size: 'A4', style: s.page },
      React.createElement(View, { style: s.content },
        React.createElement(PageHeader, { section: '3. Projektstruktur' }),
        React.createElement(Text, { style: s.h1 }, '3. Projektstruktur'),
        React.createElement(SectionLabel, null, 'Konfiguration & Root'),
        ...[
          ['middleware.ts', 'Auth-Middleware: leitet unauthentifizierte Nutzer zu /login um'],
          ['next.config.mjs', 'Next.js-Konfiguration (canvas webpack alias für PDF-Renderer)'],
          ['tailwind.config.ts', 'Tailwind CSS Design-Token und Typografie-Skala'],
          ['.env.local', 'Umgebungsvariablen (Supabase URL/Keys, Resend API, Webhook Secret)'],
        ].map(([path, desc]) => React.createElement(FileRow, { key: path, path, desc })),

        React.createElement(H3, null, 'lib/'),
        ...[
          ['lib/types.ts', 'Alle TypeScript-Interfaces: User, Lead, Customer, Quote, Activity, Appointment, WebhookPayload'],
          ['lib/constants.ts', 'Lead-Status-Labels, Pipeline-Schritte, Aktivitätstypen mit Icons'],
          ['lib/utils.ts', 'Hilfsfunktion cn() für Tailwind-Klassen-Zusammenführung'],
          ['lib/supabase/client.ts', 'Browser-seitiger Supabase-Client (SSR-Modus)'],
          ['lib/supabase/server.ts', 'Server-seitiger Supabase-Client (Cookie-Auth) + Admin-Client'],
        ].map(([path, desc]) => React.createElement(FileRow, { key: path, path, desc })),

        React.createElement(H3, null, 'app/ — Seiten & Layouts'),
        ...[
          ['app/layout.tsx', 'Root-HTML-Layout: Inter-Font, Sonner-Toast-Provider, Metadaten'],
          ['app/page.tsx', 'Startseite: Redirect zu /dashboard'],
          ['app/globals.css', 'Globale Styles, Design-Tokens (CSS Custom Properties), Hover-Utilities'],
          ['app/(auth)/login/page.tsx', 'Login-Seite: E-Mail/Passwort-Formular, Supabase Auth'],
          ['app/(crm)/layout.tsx', 'CRM-Layout: CSS-Grid (240px Sidebar + 1fr), Auth-Check, Nutzerprofil'],
          ['app/(crm)/dashboard/page.tsx', 'Dashboard: KPI-Karten, Pipeline-Balkendiagramm, offene Leads'],
          ['app/(crm)/dashboard/DashboardGreeting.tsx', 'Client-Komponente: tageszeit-abhängige Begrüßung'],
          ['app/(crm)/leads/page.tsx', 'Lead-Liste: Suche, Filter, Paginierung, "+ Neuer Lead"-Button'],
          ['app/(crm)/leads/[id]/page.tsx', 'Lead-Detail: Pipeline-Stepper, Status/Zuweisung, Aktivitäten'],
          ['app/(crm)/leads/[id]/angebot/page.tsx', 'Angebots-Editor: Positionen, Berechnung, PDF-Download, E-Mail-Versand'],
          ['app/(crm)/appointments/page.tsx', 'Terminübersicht: bevorstehend/abgeschlossen, Typ-Badges'],
          ['app/(crm)/appointments/MarkCompleteButton.tsx', 'Client-Komponente: Termin als erledigt markieren'],
          ['app/(crm)/settings/page.tsx', 'Admin-Einstellungen: Nutzerverwaltung (nur admin-Rolle)'],
          ['app/(crm)/settings/AddUserForm.tsx', 'Formular: neuen Nutzer mit Rolle anlegen'],
        ].map(([path, desc]) => React.createElement(FileRow, { key: path, path, desc })),
      ),
      React.createElement(Footer, { page: 3 }),
    ),

    // ── Seite 4: API Routen & Komponenten ───────────────────────────────────
    React.createElement(Page, { size: 'A4', style: s.page },
      React.createElement(View, { style: s.content },
        React.createElement(PageHeader, { section: '4. API Routen & Komponenten' }),
        React.createElement(Text, { style: s.h1 }, '4. API Routen'),
        React.createElement(SectionLabel, null, 'Endpunkte'),
        React.createElement(View, { style: s.table },
          ...[
            ['Methode', 'Route', 'Beschreibung'],
            ['POST', '/api/leads', 'Lead + Kunde anlegen. Unterstützt internes Formular-Format ({ customer, lead }) und externes Webhook-Format ({ service_type, metadata, customer }). Kein Auth erforderlich.'],
            ['POST', '/api/users', 'Neuen Nutzer erstellen (nur admin). Legt Supabase Auth-Nutzer und users-Profil an.'],
            ['POST', '/api/quotes/[id]/send', 'Angebot per E-Mail versenden (Resend). Erfordert Auth. Aktualisiert Quote-Status auf "versendet".'],
            ['POST', '/api/webhook/leads', 'Externer Webhook von der Landingpage. Validiert x-webhook-secret Header, legt Lead an, sendet interne Benachrichtigungs-E-Mail.'],
            ['GET', '/api/docs', 'Gibt diese technische Dokumentation als PDF zurück.'],
          ].map(([method, route, desc], i) =>
            React.createElement(View, { style: i === 0 ? s.tableHead : s.tableRow, key: route },
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.tableCell), width: 40 } }, method),
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.tableCell), width: 130 } }, route),
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.tableCellMuted), flex: 1 } }, desc),
            )
          ),
        ),

        React.createElement(Divider, null),
        React.createElement(Text, { style: s.h1 }, '5. Komponenten'),
        React.createElement(SectionLabel, null, 'Layout'),
        ...[
          ['components/layout/Sidebar.tsx', '240px sticky Sidebar: Navigation, Wortmarke "SalesCraft", Nutzer-Avatar, Logout'],
          ['components/layout/TopBar.tsx', '48px TopBar: Seitentitel, Untertitel, Action-Buttons (Slot)'],
        ].map(([path, desc]) => React.createElement(FileRow, { key: path, path, desc })),

        React.createElement(SectionLabel, null, 'Leads'),
        ...[
          ['components/leads/LeadTable.tsx', 'Tabelle: Kunde, PLZ, Maßnahme, Fensterzahl, Status-Dot, Zuweisung, Datum'],
          ['components/leads/CreateLeadModal.tsx', 'Modal: Kundendaten, Leaddaten, bedingte Maßfelder (Austausch/Neueinbau), Zubehör'],
          ['components/leads/LeadDetailCard.tsx', 'Detail-Karte: Kundeninformationen und Lead-Spezifikationen'],
          ['components/leads/LeadStatusBadge.tsx', '8px Statusdot + Label. Exportiert STATUS_CONFIG (7 Status mit Farben)'],
          ['components/leads/ActivityTimeline.tsx', 'Aktivitäts-Timeline mit Lucide-Icons pro Typ'],
          ['components/leads/AddNoteForm.tsx', 'Formular: Notiz zur Lead-Aktivität hinzufügen'],
        ].map(([path, desc]) => React.createElement(FileRow, { key: path, path, desc })),

        React.createElement(SectionLabel, null, 'Angebote & Termine'),
        ...[
          ['components/quotes/QuoteEditor.tsx', 'Angebots-Editor: Positionen (Beschreibung, Menge, Einzelpreis), Summenberechnung'],
          ['components/quotes/QuotePDF.tsx', 'PDF-Dokument-Komponente (react-pdf/renderer): A4, Logobereich, Tabelle, MwSt.'],
          ['components/quotes/PDFDownloadButton.tsx', 'Client-Button: lädt Angebots-PDF herunter (dynamic() Import)'],
          ['components/appointments/AppointmentForm.tsx', 'Formular: Datum/Uhrzeit, Typ (Aufmaß/Montage), Ort, Dauer, Notiz'],
        ].map(([path, desc]) => React.createElement(FileRow, { key: path, path, desc })),
      ),
      React.createElement(Footer, { page: 4 }),
    ),

    // ── Seite 5: Datenbankschema ─────────────────────────────────────────────
    React.createElement(Page, { size: 'A4', style: s.page },
      React.createElement(View, { style: s.content },
        React.createElement(PageHeader, { section: '6. Datenbankschema' }),
        React.createElement(Text, { style: s.h1 }, '6. Datenbankschema (Supabase / PostgreSQL)'),
        React.createElement(Body, null, 'Alle Tabellen liegen in Supabase. Row Level Security (RLS) ist aktiv: authentifizierte Nutzer dürfen Leads lesen und aktualisieren, aber nicht direkt einfügen. INSERT-Operationen laufen über den Service-Role-Client in API-Routen.'),

        React.createElement(H3, null, 'Tabelle: leads'),
        React.createElement(View, { style: s.table },
          ...[
            ['Spalte', 'Typ', 'Beschreibung'],
            ['id', 'uuid PK', 'Primärschlüssel, automatisch generiert'],
            ['customer_id', 'uuid FK', 'Fremdschlüssel → customers.id'],
            ['status', 'text', 'neu | kontaktiert | angebot_versendet | termin_geplant | angebot_aktualisiert | gewonnen | verloren'],
            ['source', 'text CHECK', 'Herkunft: landingpage (Webhook). CHECK-Constraint aktiv.'],
            ['massnahme', 'text', 'austausch | neueinbau'],
            ['anzahl_fenster', 'integer', 'Anzahl der Dachfenster'],
            ['assigned_to', 'uuid FK', 'Fremdschlüssel → users.id (nullable)'],
            ['typenschild', 'text', 'Velux Typenschild z.B. "GGL MK06" (nur Austausch)'],
            ['fenster_breite_cm', 'integer', 'Fensterbreite in cm (nur Austausch)'],
            ['fenster_hoehe_cm', 'integer', 'Fensterhöhe in cm (nur Austausch)'],
            ['rohbau_breite_cm', 'integer', 'Rohbaumaß Breite in cm (nur Neueinbau)'],
            ['rohbau_hoehe_cm', 'integer', 'Rohbaumaß Höhe in cm (nur Neueinbau)'],
            ['dachneigung', 'text', 'Dachneigung z.B. "35°" (nur Neueinbau)'],
            ['zubehoer', 'text[]', 'Array: Rollladen, Mückennetz, Verdunkelungsrollo, etc.'],
            ['anmerkungen', 'text', 'Freitext-Notiz (nullable)'],
            ['created_at', 'timestamptz', 'Erstellungszeitpunkt (automatisch)'],
            ['updated_at', 'timestamptz', 'Letztes Update (manuell gesetzt)'],
          ].map(([name, type, desc], i) =>
            React.createElement(View, { style: i === 0 ? s.tableHead : s.tableRow, key: name + i },
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.fieldName), width: 120 } }, name),
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.fieldType), width: 80 } }, type),
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.fieldDesc), flex: 1 } }, desc),
            )
          ),
        ),

        React.createElement(H3, null, 'Tabelle: customers'),
        React.createElement(View, { style: s.table },
          ...[
            ['Spalte', 'Typ', 'Beschreibung'],
            ['id', 'uuid PK', 'Primärschlüssel'],
            ['vorname', 'text', 'Vorname des Kunden'],
            ['nachname', 'text', 'Nachname des Kunden'],
            ['email', 'text', 'E-Mail-Adresse'],
            ['phone', 'text', 'Telefonnummer (nullable)'],
            ['plz', 'text', 'Postleitzahl'],
            ['city', 'text', 'Stadt (nullable)'],
          ].map(([name, type, desc], i) =>
            React.createElement(View, { style: i === 0 ? s.tableHead : s.tableRow, key: name + i },
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.fieldName), width: 120 } }, name),
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.fieldType), width: 80 } }, type),
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.fieldDesc), flex: 1 } }, desc),
            )
          ),
        ),
      ),
      React.createElement(Footer, { page: 5 }),
    ),

    // ── Seite 6: DB Schema (Fortsetzung) + Auth + Deployment ────────────────
    React.createElement(Page, { size: 'A4', style: s.page },
      React.createElement(View, { style: s.content },
        React.createElement(PageHeader, { section: '6. Datenbankschema (Forts.) · 7. Auth · 8. Deployment' }),

        React.createElement(H3, null, 'Tabelle: users'),
        React.createElement(View, { style: s.table },
          ...[
            ['Spalte', 'Typ', 'Beschreibung'],
            ['id', 'uuid PK', 'Gleiche ID wie Supabase Auth-Nutzer'],
            ['name', 'text', 'Anzeigename'],
            ['email', 'text', 'E-Mail-Adresse'],
            ['role', 'text', 'admin | sales'],
          ].map(([name, type, desc], i) =>
            React.createElement(View, { style: i === 0 ? s.tableHead : s.tableRow, key: name + i },
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.fieldName), width: 120 } }, name),
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.fieldType), width: 80 } }, type),
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.fieldDesc), flex: 1 } }, desc),
            )
          ),
        ),

        React.createElement(H3, null, 'Tabelle: activities'),
        React.createElement(View, { style: s.table },
          ...[
            ['Spalte', 'Typ', 'Beschreibung'],
            ['id', 'uuid PK', 'Primärschlüssel'],
            ['lead_id', 'uuid FK', 'Fremdschlüssel → leads.id'],
            ['user_id', 'uuid FK', 'Fremdschlüssel → users.id (nullable bei Webhook/API)'],
            ['type', 'text', 'notiz | anruf | email | status_aenderung | angebot_erstellt | angebot_versendet | termin_vereinbart'],
            ['note', 'text', 'Freitext-Inhalt der Aktivität'],
            ['created_at', 'timestamptz', 'Erstellungszeitpunkt'],
          ].map(([name, type, desc], i) =>
            React.createElement(View, { style: i === 0 ? s.tableHead : s.tableRow, key: name + i },
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.fieldName), width: 120 } }, name),
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.fieldType), width: 80 } }, type),
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.fieldDesc), flex: 1 } }, desc),
            )
          ),
        ),

        React.createElement(H3, null, 'Tabelle: appointments'),
        React.createElement(View, { style: s.table },
          ...[
            ['Spalte', 'Typ', 'Beschreibung'],
            ['id', 'uuid PK', 'Primärschlüssel'],
            ['lead_id', 'uuid FK', 'Fremdschlüssel → leads.id'],
            ['user_id', 'uuid FK', 'Zuständiger Mitarbeiter → users.id'],
            ['type', 'text', 'aufmass | montage | beratung | sonstiges'],
            ['scheduled_at', 'timestamptz', 'Geplanter Termin (Datum + Uhrzeit)'],
            ['duration_min', 'integer', 'Dauer in Minuten'],
            ['location', 'text', 'Ort/Adresse (nullable)'],
            ['note', 'text', 'Notiz zum Termin (nullable)'],
            ['completed', 'boolean', 'Ob Termin abgeschlossen ist'],
          ].map(([name, type, desc], i) =>
            React.createElement(View, { style: i === 0 ? s.tableHead : s.tableRow, key: name + i },
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.fieldName), width: 120 } }, name),
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.fieldType), width: 80 } }, type),
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.fieldDesc), flex: 1 } }, desc),
            )
          ),
        ),

        React.createElement(H3, null, 'Tabelle: quotes'),
        React.createElement(View, { style: s.table },
          ...[
            ['Spalte', 'Typ', 'Beschreibung'],
            ['id', 'uuid PK', 'Primärschlüssel'],
            ['lead_id', 'uuid FK', 'Fremdschlüssel → leads.id'],
            ['line_items', 'jsonb', 'Array aus { beschreibung, menge, einzelpreis }'],
            ['total_amount', 'numeric', 'Nettobetrag (Summe der Positionen)'],
            ['status', 'text', 'entwurf | versendet | akzeptiert | abgelehnt'],
            ['valid_until', 'date', 'Gültigkeitsdatum des Angebots (nullable)'],
            ['sent_at', 'timestamptz', 'Versandzeitpunkt per E-Mail (nullable)'],
          ].map(([name, type, desc], i) =>
            React.createElement(View, { style: i === 0 ? s.tableHead : s.tableRow, key: name + i },
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.fieldName), width: 120 } }, name),
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.fieldType), width: 80 } }, type),
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.fieldDesc), flex: 1 } }, desc),
            )
          ),
        ),

        React.createElement(Divider, null),
        React.createElement(Text, { style: s.h1 }, '7. Authentifizierung'),
        React.createElement(Body, null, 'Supabase Auth mit E-Mail/Passwort. Keine Selbstregistrierung — Nutzer werden ausschließlich vom Admin über /settings angelegt.'),
        React.createElement(Body, null, 'Die middleware.ts schützt alle Routen unter /(crm)/. Nicht authentifizierte Anfragen werden zu /login weitergeleitet. Der Session-Token wird als HttpOnly-Cookie gespeichert und vom @supabase/ssr-Client serverseitig gelesen.'),
        React.createElement(Body, null, 'API-Routen, die privilegierte DB-Operationen ausführen (INSERT mit bypasster RLS), verwenden den Service-Role-Client aus lib/supabase/server.ts::createAdminClient(). Dieser Client verwendet den SUPABASE_SERVICE_ROLE_KEY und darf niemals client-seitig exponiert werden.'),

        React.createElement(Divider, null),
        React.createElement(Text, { style: s.h1 }, '8. Deployment & Umgebungsvariablen'),
        React.createElement(View, { style: s.table },
          ...[
            ['Variable', 'Beschreibung'],
            ['NEXT_PUBLIC_SUPABASE_URL', 'Supabase Projekt-URL (öffentlich)'],
            ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Supabase Anon Key für Client-Operationen (öffentlich)'],
            ['SUPABASE_SERVICE_ROLE_KEY', 'Service Role Key — niemals client-seitig verwenden (geheim)'],
            ['RESEND_API_KEY', 'Resend API Key für E-Mail-Versand (geheim)'],
            ['WEBHOOK_SECRET', 'Gemeinsames Secret für den Landingpage-Webhook (geheim)'],
            ['INTERNAL_NOTIFY_EMAIL', 'E-Mail-Adresse für interne Lead-Benachrichtigungen'],
            ['NEXT_PUBLIC_APP_URL', 'Öffentliche App-URL z.B. https://salescraftcrm.vercel.app'],
          ].map(([name, desc], i) =>
            React.createElement(View, { style: i === 0 ? s.tableHead : s.tableRow, key: name + i },
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.tableCell), width: 200 } }, name),
              React.createElement(Text, { style: { ...(i === 0 ? s.tableHeadCell : s.tableCellMuted), flex: 1 } }, desc),
            )
          ),
        ),
        React.createElement(Body, null, 'Deployment auf Vercel via GitHub-Integration. Jeder Push auf den main-Branch löst automatisch einen neuen Build und Deploy aus. Umgebungsvariablen werden im Vercel-Dashboard unter Project Settings > Environment Variables gepflegt.'),
      ),
      React.createElement(Footer, { page: 6 }),
    ),
  )
}

export async function GET() {
  const buffer = await renderToBuffer(React.createElement(DocsPDF))
  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="SalesCraft-CRM-Technische-Dokumentation.pdf"',
    },
  })
}
