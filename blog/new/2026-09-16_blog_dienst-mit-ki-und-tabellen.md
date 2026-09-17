# Ein Dienst in elf Tagen — mit einem KI-Agenten, und mit Tabellen, die widersprechen

*Erfahrungsbericht. Anonymisiert: Firmen- und Systemnamen sind ersetzt, die Zahlen sind echt.*

## Worum es geht

Wir haben einen ereignisgetriebenen Dienst gebaut. Er nimmt Nachrichten aus Kafka, hält seinen
Zustand in Postgres, schickt Entscheidungen wieder als Nachricht hinaus und beantwortet daneben
Anfragen einer Weboberfläche über REST.

Fachlich geht es um Anschlüsse im Schienen-Nahverkehr. Ein Fahrgast muss umsteigen, die Zeit reicht
nicht. Ein Partnersystem — ich nenne es hier den **Anschlussautomaten** — stellt daraufhin eine
**Warteanfrage** an das Leitsystem: soll der abfahrende Zug warten? Ein Disponent in der Leitstelle
entscheidet, oder die Frist läuft ab. Der Dienst verwaltet diese Anfragen, die Fristen und die
Entscheidungen.

Geschrieben hat den Code fast vollständig ein KI-Agent im Terminal: ein Werkzeug, das Dateien lesen
und schreiben und Kommandos ausführen kann. Ich habe entworfen, entschieden, geprüft und
widersprochen.

Nach elf Tagen: 8.053 Zeilen Quellcode in 54 Dateien, 9.183 Zeilen Tests, **806 Tests** (805 grün,
einer übersprungen) in 44 Dateien, 97 Commits.

Das Interessante daran ist aber nicht die Geschwindigkeit. Es ist die Reihenfolge: **erst die
Tabellen, dann die Tests, dann der Dienst.** Und der Befund, dass die Tabellen die Anforderungen
kaputt gemacht haben, bevor eine Zeile Code existierte.

## Das Werkzeug in der Mitte: Äquivalenzklassen-Tabellen

Wir benutzen **Nanook** — eine Tabellen-Engine, die Äquivalenzklassen-Tabellen aus einer
Excel-Arbeitsmappe liest und daraus Testfälle ableitet. Zwei Formen sind wichtig:

- **Entscheidungstabelle**: was etwas *ist*. Felder mit ihren Klassen, dazu Fälle, die
  Klassen-Kombinationen abdecken. Die Engine rechnet, wie viel Prozent der Kombinationen gedeckt
  sind.
- **Matrix-Tabelle**: was daraus *wird*. Zeilen sind Zustände, Spalten sind Ereignisse, jede Zelle
  ist die Reaktion.

Unsere Mappe hat am Ende 13 Blätter. Elf davon erzeugen Testfälle, zwei sind Bausteine, aus denen
die Matrix ihre Zeilen- und Spaltenbedeutung bezieht.

| Blatt | prüft | Fälle | Kombinationen | Deckung |
|---|---|---|---|---|
| WA-Eingang | die Eingangsnachricht | 20 | 55.296 | 100 % |
| FE-Filter | die Filter der Arbeitsliste | 24 | 21.600 | 100 % |
| FE-Ablehnung | eine Ablehnung über REST | 13 | 864 | 100 % |
| FE-Zusage | eine Zusage über REST | 13 | 768 | 100 % |
| FE-Abfrage | die Arbeitsliste | 11 | 256 | 100 % |
| FE-Massenaktion | Massenzusage/-ablehnung | 9 | 72 | 100 % |
| WA-Fristablauf | der Fristablauf | 8 | 30 | 100 % |
| Zeitumrechnung, WA-Zusammenhang | je eine reine Funktion | 6 + 6 | 18 + 18 | 100 % |
| Uhrzeit-Aufloesung | Uhrzeit ohne Datum | 6 | 6 | 100 % |
| WA-Statuswechsel | 8 Zustände × 14 Ereignisse | 98 Zellen | — | 14 bewusste Löcher |

Aus diesen Blättern werden **214 Testfälle** mit **1.712 Dateien** erzeugt. Ein Prüfskript hält die
Sollzahlen dagegen; weicht die Mappe ab, ohne dass die Fälle neu erzeugt wurden, bricht die
Testkette ab.

## Teil 1: Anforderungen prüfen, indem man sie in eine Tabelle zwingt

Die Designs waren gut. Zwölf Teil-Dokumente, geschnitten nach Themen: Datenvertrag, Datenmodell,
Eingang, Zuständigkeit, Fristen, Ausgang, REST-Grenze, Oberfläche, Betrieb, Testanbindung.
Trotzdem — und das ist der Kern dieses Berichts — hat erst das **Bauen der Tabellen** die Löcher
gezeigt.

Eine Tabelle verlangt drei Dinge, die Prosa nicht verlangt: **jedes Feld braucht Klassen**, **jede
Kombination braucht eine Zeile**, **jede Zeile braucht ein Ergebnis**. Wer das ausfüllt, kann nicht
mehr höflich unbestimmt bleiben.

Was dabei herauskam:

**Ein Widerspruch zwischen zwei eigenen Artefakten.** Ein Blatt behauptete, ein bestimmter Satz
werde mit Hinweis angezeigt. Die Zuordnungsregel und der Code schlossen genau diesen Satz aus.
Beide beriefen sich auf dieselbe Design-Entscheidung. Aufgefallen war es nie, weil niemand das Blatt
Zeile für Zeile durchgespielt hatte.

**Sieben Filterkriterien, die nicht wirkten** — obwohl es Tests gab, die gegen echtes Postgres
liefen. Der Grund ist lehrreich: ein *leerer* Filter kommt auch dann richtig an, wenn die
Implementierung ihn wegwirft. Der vorhandene Test hatte sich um die Lücke herumgebaut. Erst die
Tabelle mit ihren Klassen „gesetzt / leer / mehrere" hat gefragt, was bei *gesetzt* passiert.

**Eine Kreuzung, für die es keine Antwort gab.** Priorität 0 ohne Zubringer — fachlich unklar. In der
Tabelle steht diese Kombination jetzt ausdrücklich als Ausnahme, statt dass eine Zeile ein Ergebnis
behauptet, das niemand entschieden hat. Ein offener Punkt, der sichtbar bleibt, ist besser als eine
Zeile, die raten muss.

**Ein vierter Stornofall, der ein eigener Zustand war.** In der Prosa las es sich wie eine Variante.
In der Matrix bekam er eine eigene Zeile, weil er auf drei Ereignisse anders reagiert als die
anderen.

**Zwei Zahlen, die nicht zueinander passten.** Die Oberfläche zeigt 50 Zeilen je Seite, der
Datenbank-Entwurf sagte `LIMIT 20`. Beides stand seit Tagen da, in zwei Dokumenten.

**Die Frist entscheidet nicht.** Beim Ausfüllen der Matrix fiel auf: der Fristablauf schickt keine
Nachricht hinaus. Er verändert nur, was die Oberfläche zeigt. Das Ereignis heißt seitdem nicht mehr
„Frist abgelaufen", sondern trägt den Namen des Auslösers, der es wirklich ist — der Takt, der die
Abfahrt vergleicht. Eine falsche Benennung hätte einen Ausgang gebaut, den es nicht geben darf.

**Die Matrix hat Datenbankspalten erzwungen.** Zwei Spalten des Modells existieren, weil je eine
Zelle sie verlangt: eine, um eine gesetzte Prognose zurücknehmen zu können, eine, um zu
unterscheiden, wer entschieden hat. Ohne die Zelle hätte niemand die Spalte gefordert.

**Und sie hat „ignorieren" von „Fehler" getrennt.** Beides sah in der Prosa gleich aus: es passiert
nichts. In der Matrix sind es zwei verschiedene Reaktionen — eine erwartete Nichtreaktion und eine
Meldung ins Protokoll. Aus dieser Unterscheidung wurde eine eigene Design-Entscheidung.

Das ist der eigentliche Wert. **Die Tabelle ist kein Testartefakt, sie ist ein Prüfwerkzeug für die
Anforderung.** Sie kostet einen Tag und findet Dinge, die sonst im Betrieb gefunden werden.

## Teil 2: Erst die Tests, dann der Dienst

Danach lief die Umsetzung in einer festen Reihenfolge, und die Reihenfolge war nicht verhandelbar.

**Schritt 1: der Vertrag.** Alle Typen, alle Fehler, alle Ports — 18 Port-Methoden und vier reine
Funktionen. Jede von ihnen wirft „nicht implementiert", mit demselben Wortlaut aus einer Konstante.
Kein Verhalten, nur Form. Die Typprüfung ist grün.

**Schritt 2: das Orakel.** Ein Lader, der die erzeugten Fallordner liest, und **eine** Stelle, die
die Kurzcodes der Tabelle in Behauptungen übersetzt. Diese Übersetzung ist selbst getestet. Alles
andere im Testcode deutet nicht, es reicht durch.

**Schritt 3: rote Tests.** Nicht ein paar — alle. Erst 112 rot bei 15 grün (die grünen waren die
Tests des Orakels selbst), dann 245 rot, **alle mit derselben Meldung**. Eine rote Kette ist hier der
Sollzustand, und sie ist prüfbar: wenn alle 245 mit „nicht implementiert" scheitern, testet die
Testsuite noch nichts anderes als sich selbst.

**Schritt 4: die Implementierung, Stufe für Stufe.** Fünf Stufen, jede mit einem Verbot:

1. **Reine Funktionen** — sehen nur ihre Eingabe. Keine Uhr, keine Datenbank.
2. **Bibliothek gegen Ports** — die Fachlogik gegen Attrappen, mit injizierter Uhr.
3. **Persistenz** — gegen eine echte Postgres-Engine im Prozess, die das echte DDL-Skript abspielt.
   Keine Fachregel auf dieser Stufe.
4. **Ränder** — Kafka-Adapter, HTTP, Konfiguration, Start und Abbruch.
5. **Ende zu Ende** — der Dienst als Bündel, mit einer Rauchprobe.

Am Ende von Stufe 2: **280 Tests grün — und keine einzige Erwartung geändert.** Achtmal musste etwas
angepasst werden, und zwar immer nur die Vorbereitung des Falls, nie das erwartete Ergebnis. Jede
dieser acht Korrekturen ist mit Grund in der Mappe oder im Design vermerkt.

Das ist die Regel, die den ganzen Ansatz trägt: **Wenn ein Test rot ist, ändert man den Code. Will
man die Erwartung ändern, ändert man zuerst die Tabelle — und schreibt hin, warum.** Ohne diese
Regel schreibt ein KI-Agent (oder ein Mensch unter Zeitdruck) die Erwartung so lange um, bis es
passt.

**Schritt 5: Gegenproben.** Ein grüner Test beweist nichts, wenn er auch grün wäre, ohne dass die
Sache funktioniert. Also haben wir sieben Sicherungen absichtlich kaputt gemacht und geprüft, dass
genau die richtigen Tests rot werden:

| Eingriff | erwartet | gemessen |
|---|---|---|
| Tippfehler in einer Modellspalte | das Modell-Gate schlägt an | 2 rot |
| eine Datenbank-Bedingung entfernt | die Bedingung wird geprüft | 4 rot |
| die Zuständigkeits-Herleitung stillgelegt | Zuordnung wirkt | 5 von 8 rot |
| die Führungszeile ausgebaut | nur eine Instanz entscheidet | rot |
| die alte Rücknahme-Logik zurück | der neue Weg wirkt | 1 rot |
| lokale Zeit statt fester Zone | die Zone ist gepinnt | genau 3 rot |
| leere Filterliste als leere Menge gedeutet | leer heißt „kein Filter" | 13 rot |

Eine Lehre daraus, die Zeit gekostet hat: **eine Gegenprobe am falschen Ort belegt nichts.** Beim
ersten Versuch habe ich den alten Zustand an einer Stelle nachgebaut, die der Test gar nicht
berührt. Der Test blieb grün, und das sah nach einer nutzlosen Sicherung aus. Sie war nicht nutzlos,
die Probe war an der falschen Stelle.

## Teil 3: Von der Excel-Zelle zur Testdatei

Die Mappe ist die Quelle und wird **von Hand** gepflegt. Ein Skript erzeugt daraus die Fälle:

```
warteanfrage-verarbeitung.xlsx
        │   Nanook liest die Blätter, löst Generatoren und Verweise auf
        ▼
tests/fixtures/cases/<blatt>/<fall>/   (8 Dateien je Fall)
        │   ein Lader zieht sie in die Tests
        ▼
Vitest
```

Drei Details, die den Unterschied machen:

**Der Erzeuger deutet nicht.** Die Kurzcodes der Tabelle (`INS>OFFEN`, `UPD>SACH`, `IGN`, `ERR`)
wandern unverändert in die Falldateien. Gedeutet wird an genau einer Stelle im Testcode. Wer die
Deutung im Erzeuger unterbringt, prüft am Ende seine eigene Übersetzung.

**„Nichts erwartet" ist ein geschriebener Wert**, kein fehlender. Die Datei enthält dann
`{"artefakt": "keiner", "grund": …}`. Eine fehlende Datei kann man vergessen; ein geschriebenes
„keiner" prüft, dass wirklich nichts passiert.

**Eine Matrixzelle bezieht ihre Bedeutung aus zwei anderen Blättern.** Zeile und Spalte sind
Verweise: der Vorzustand kommt aus einem Zustandsblatt, das Ereignis aus einem Ereignisblatt. Vorher
prüfte die Matrix nur, *ob* etwas hinausgeht. Seit den Verweisen prüft sie, *was*.

Der Test zur Zustandsmatrix enthält 98 Tests — genau die 98 belegten Zellen. Er iteriert über die
Fälle, er schreibt sie nicht ab. Kommt eine Zelle dazu, kommt ein Test dazu, ohne dass jemand
Testcode anfasst.

## Teil 4: Zehn Gates, weil ein KI-Agent Gates braucht

`pnpm test` ist eine Kette. Jedes Glied verhindert etwas, das schon einmal passiert ist:

| Glied | verhindert |
|---|---|
| Format, Lint | Streit über Formalien in jedem Diff |
| Typprüfung als **eigener** Schritt | der Bundler wirft Typen weg, statt sie zu prüfen |
| Totes-Code-Prüfung | Reste, die nach einem Umbau niemand entfernt |
| Schema-Deskriptor prüfen | die Nachrichtenschemas laufen dem Code weg |
| Mappe prüfen | Nanook meldet Fehler **im Logger**, nicht als Ausnahme — ohne Gate sieht ein kaputtes Blatt aus wie ein gutes |
| Diagramm prüfen | die Zeichnung in der README fällt hinter die Mappe zurück |
| Fälle prüfen | die Mappe wurde geändert, die Fälle nicht neu erzeugt |
| Build inkl. Rauchprobe | Build grün, Typen grün, 391 Tests grün — und das Bündel startet nicht (genau so passiert) |
| Tests mit Abdeckung | der Rest |

Das eigentliche Gate ist aber nicht die Codeabdeckung. Es ist die **Deckung der Tabelle**: jedes
Blatt muss 100 % seiner Klassen-Kombinationen abdecken, sonst bricht der Bau der Mappe ab. Die
Codeabdeckung sagt, welche Zeilen liefen. Die Tabellendeckung sagt, welche *Fälle* bedacht sind.

## Was ich über die Zusammenarbeit gelernt habe

**Der Agent ist schnell, aber er ist gefällig.** Ohne die Regel „Erwartung nur mit Begründung
ändern" hätte ich am zweiten Tag eine grüne Testsuite gehabt, die nichts mehr behauptet. Die Regel
kostet nichts und ist der wichtigste Satz im ganzen Projekt.

**Werkzeuge, die lautlos scheitern, sind die teuersten.** Drei Beispiele aus diesen elf Tagen: ein
Marker, der in einem Blatt wahr ist und im anderen nicht — falsch gesetzt erzeugt er *null* Fälle
und meldet Erfolg. Eine Zelle, die leer bleiben muss, obwohl die Doku etwas anderes sagt. Ein
mehrzeilig formatiertes Array, das ein Änderungsskript stillschweigend überspringt. Jedes Mal war
das Ergebnis: „alles grün", und die Prüfung war weg. Deshalb die Sollzahlen im Gate.

**Die Doku eines Werkzeugs ist eine Behauptung, der Quellcode ist der Beleg.** Zwei Stellen der
Skill-Dokumentation widersprachen dem Code. Beide Male hat der Code gewonnen.

**Was der Agent nicht ersetzt, ist die Entscheidung.** Die Designs enthalten ein Entscheidungs-Log,
und dort steht auch, was verworfen wurde: getrennte Lese-/Schreibpfade, ein eigenes Drift-Gate, der
Zustand im Speicher mit nur einer Instanz, Aufteilung nach Zuständigkeit, und eine Sperre der
Datenbank für den Takt. Die Sperre ist das schönste Beispiel: sie klang richtig, war aber in der
Testumgebung nicht prüfbar (dort gibt es nur eine Sitzung, beide Instanzen bekommen die Sperre) und
hätte am Verbindungspool vorbei gearbeitet. Stattdessen steht die Führung als **Zeile** in einer
Tabelle: poolfest, prüfbar, selbstheilend.

**Und: Prosa lügt nicht, sie schweigt.** Kein Design war falsch. Sie waren an genau den Stellen
unbestimmt, an denen später Arbeit liegt. Eine Tabelle kann nicht schweigen.

## Die Zahlen zum Schluss

| | |
|---|---|
| Zeitraum | 11 Tage, davon 12 Designs am ersten |
| Commits | 97 |
| Quellcode | 8.053 Zeilen in 54 Dateien |
| Testcode | 9.183 Zeilen in 44 Dateien |
| Tests | 806 (805 grün, 1 übersprungen) |
| Tabellenblätter | 13, davon 11 mit Fällen |
| erzeugte Fälle | 214 mit 1.712 Dateien |
| Tabellendeckung | 100 % je Blatt, Gate bricht sonst ab |
| Zustandsmatrix | 8 × 14, 98 belegte Zellen, 14 bewusste Löcher |

Ein Leitfaden mit dem Vorgehen Schritt für Schritt liegt daneben:
[Leitfaden](2026-09-16_leitfaden_event-driven-service.md).
