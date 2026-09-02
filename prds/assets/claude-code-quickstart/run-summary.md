# Headless run, 2026-09-02

Prompt: /createEquivalenceClassTable Login Form (claude -p, acceptEdits)
Turns: 56, duration: 17.5 min, Claude Code 2.1.258, Node 24.16.0, @xhubio/nanook-table 3.0.1, skill 0.1.0

## Final message

Fertig. Die Decision Table für das Login-Formular ist erzeugt, unabhängig geprüft und von Nanook einmal komplett durchgerechnet.

**Erzeugte Dateien**
- `resources/login-form-tests.xlsx` mit den Blättern `User` und `Login`, formatiert mit Farben, COUNTA- und Produktformeln, gecachten Werten und eingefrorenen Kopfspalten.
- `scripts/create-login-form-table.ts` baut die Mappe. Es rechnet die Deckung vorab und bricht ab, wenn sie nicht 100 % ergibt oder eine Klasse kein eigenes `x` hat.
- `scripts/check-login-form-table.ts` liest die Marker aus der fertigen Datei zurück und rechnet unabhängig vom Erzeuger nach.
- `scripts/generate-login-form-fixtures.ts` lässt Nanook die Mappe parsen und schreibt 11 Fixtures nach `fixtures/login-form/`.

**Aufbau nach dem Muster Datentabelle plus Testfall-Tabelle**
- `User` mit Execute F hält die Formularfelder email und password mit ihren Klassen. Die Fehlerfälle heißen je Feld sequentiell, etwa `email_invalid_1-4`, damit Bereichsreferenzen pro Feld möglich sind.
- `Login` mit Execute T definiert keine Feldklassen selbst. Sekundärdaten beschreiben den Basiszustand mit session, existingUser und emailVerified. Primärdaten sind email, password und rememberMe und holen die Werte per Referenz. Gleiche Instanz-Id 1 in existingUser und Eingabe ergibt den bekannten Benutzer, Instanz 2 das falsche Passwort.
- rememberMe steht als Feld mit gültiger Alternative zuletzt, damit die Kaskade exakt aufgeht.

| Blatt | Kombinationen | Spalten | Deckung |
|---|---|---|---|
| User | 15 | 7 | 100 % |
| Login | 48 | 7 | 100 % |

**Getroffene Annahmen, die Sie prüfen sollten**
- Maximale Länge E-Mail 254 Zeichen, Passwort 128 Zeichen. Beide stehen als Kommentar in der Tabelle.
- Der Server unterscheidet unbekannte E-Mail und falsches Passwort nach außen nicht, beides ergibt INVALID_CREDENTIALS.
- Unbestätigte E-Mail ergibt EMAIL_NOT_VERIFIED, wie im Artikel des Nanook-Pakets beschrieben.
- Formularfehler in der Login-Tabelle tragen FORM_ERROR_EMAIL und FORM_ERROR_PASSWORD. Der konkrete Code liegt im Expected Result der referenzierten User-Instanz und steht in jedem Fixture unter `data.User`.

**Abweichungen vom Skill, mit Grund**
- Leere Klassen nutzen `gen::text:empty` statt einer leeren Zelle. Eine Feldreferenz auf eine Klasse ohne Generator löst Nanook nie auf, was ich beim Lesen des Prozessors gesehen und im Lauf bestätigt habe.
- Nur-Leerzeichen und überlange Werte kommen aus einem kleinen eigenen Generator `text`. Der Importer trimmt Zellen, und der eingebaute Faker-Generator ruft Funktionen ohne Argumente auf.
- Die gültige Variante rememberMe bekommt eine eigene Ergebniszeile SESSION_PERSISTENT statt der generischen Zeile valid_variant.

**Ausführen**
tsx ist im Projekt nicht installiert. Node 24 führt die Scripts direkt aus:

```
node scripts/create-login-form-table.ts
node scripts/check-login-form-table.ts
node scripts/generate-login-form-fixtures.ts
```

Eine Kleinigkeit im Nanook-Verhalten: Referenziert eine Spalte dieselbe User-Instanz dreimal, hängt Nanook deren Expected-Result-Zeile dreimal an. Ein Runner sollte Schlüssel lesen, nicht Einträge zählen. Die Fixtures enthalten sonst genau das Erwartete, beim falschen Passwort etwa zwei User-Instanzen mit verschiedenen Passwörtern und der E-Mail des angelegten Benutzers als Eingabe.
