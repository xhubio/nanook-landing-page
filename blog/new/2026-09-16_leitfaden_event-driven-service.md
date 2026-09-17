# Leitfaden: einen ereignisgetriebenen Dienst mit Tabellen und einem KI-Agenten bauen

*Das Vorgehen, Schritt für Schritt. Abgeleitet aus einem Dienst, der so entstanden ist:
Kafka hinein, Postgres als Zustand, Kafka hinaus, REST für eine Oberfläche.
Anonymisiert — Firmen- und Systemnamen sind ersetzt.*

Der Leitfaden ist eine Reihenfolge, kein Baukasten. Jeder Schritt setzt voraus, dass der vorige
abgeschlossen ist. Wer die Reihenfolge tauscht, verliert genau die Prüfung, die den Schritt lohnend
macht.

## Überblick

```
0  Hausstand        Repo, Werkzeuge, Gates
1  Schneiden        das Vorhaben in kleine Designs
2  Erste Tabelle    die Eingangsnachricht als Entscheidungstabelle
3  Zustandsmatrix   Zustände × Ereignisse, Löcher statt Fehlerfälle
4  Kreuzprüfung     Design gegen Tabelle, beide Richtungen
5  Datenmodell      Spalten, die aus Zellen folgen
6  Vertrag          Typen, Fehler, Ports — alles wirft "nicht implementiert"
7  Orakel           eine Stelle, die Kurzcodes deutet
8  Fälle erzeugen   von der Zelle zur Testdatei
9  Rote Kette       alle Tests rot, mit derselben Meldung
10 Umsetzen         fünf Stufen, jede mit einem Verbot
11 Gegenproben      jede Sicherung einmal absichtlich brechen
12 Ränder           Adapter, echte Datenbank, Rauchprobe
13 Betrieb          mehrere Instanzen, Puls, Aufräumen
14 Gates            die Kette schließen
```

## 0. Hausstand: was vor dem ersten Design steht

Ein Repo mit einer Kette, die alles prüft, was maschinell prüfbar ist. Sonst wird jede spätere
Prüfung eine Verabredung, an die sich niemand hält.

- Formatierer und Linter mit einer Konfiguration, die nicht diskutiert wird.
- **Typprüfung als eigener Schritt.** Wer mit einem Bundler baut, hat keine Typprüfung — Bundler
  werfen Typen weg, statt sie zu prüfen.
- Test-Runner mit Abdeckungsbericht.
- Eine Prüfung auf toten Code.
- Ein Sitzungs-Dokument für den Agenten im Repo-Wurzelverzeichnis: was gilt hier, welche Fallen sind
  bekannt, welche Regel ist nicht verhandelbar. Der Agent liest es zu Beginn jeder Sitzung.

Regeln, die dort von Anfang an stehen sollten:

1. **Tests zuerst.** Vertrag, dann Orakel, dann rote Tests, dann Code.
2. **Eine Erwartung wird nur geändert, wenn zuerst die Tabelle geändert wurde — mit Begründung.**
3. **Keine Uhr in der Fachlogik.** Zeit kommt als Parameter herein.
4. **Kein Migrationswerkzeug im Datenzugriff.** Das Schema gehört einer Stelle, der Zugriff einer
   anderen.

## 1. Das Vorhaben schneiden

Ein Monolith-Design wird nicht gelesen und nicht geprüft. Schneide nach Themen, ein Dokument je
Thema, jedes so eigenständig, dass daraus ein eigener Plan werden kann.

Bewährter Schnitt für einen ereignisgetriebenen Dienst:

| Nr. | Design | legt fest |
|---|---|---|
| 00 | Überblick | Vision, Kernentscheidungen, Glossar, **Entscheidungs-Log** |
| 10 | Datenvertrag | die Nachrichten: Felder, Pflicht, Enum-Werte, Schlüssel |
| 20 | Datenmodell und Persistenz | Tabellen, Indexe, Rechte, wer migriert |
| 30 | Eingangsverarbeitung | Reihenfolge, Konflikte, Idempotenz |
| 40 | Zuständigkeit | wer sieht und darf was |
| 50 | Fristen und Zeitsteuerung | Takt, Kulanz, was eine Frist auslöst |
| 60 | Ausgang | welche Nachricht geht wann hinaus |
| 70 | Schnittstelle zur Oberfläche | Pfade, Rollen, Fehlerbilder |
| 75 | Oberfläche | Ansicht, Filter, Seitengröße |
| 80 | Betrieb | Instanzen, Gesundheit, Alarme, Aufräumen |
| 90 | Testanbindung | wie der Dienst in die bestehende Testlandschaft passt |

Zwei Dinge in jedes Dokument:

- **Offene Punkte** als eigener Abschnitt. Was unklar ist, bleibt sichtbar.
- Ins Überblick-Dokument ein **Entscheidungs-Log** mit Nummern: getroffen, verworfen, mit Grund. Der
  verworfene Entwurf ist der wertvollere Eintrag.

## 2. Die erste Tabelle: die Eingangsnachricht

Nimm die Nachricht, die den Dienst auslöst, und bau daraus eine Entscheidungstabelle.

**Vorgehen:**

1. Felder wählen, die das Verhalten steuern. Nicht alle Felder der Nachricht — nur die, an denen
   sich etwas entscheidet.
2. Für jedes Feld **Klassen** bilden: gültig, Grenzwert, fehlend, unbekannter Enum-Wert. Klassen,
   nicht Werte.
3. Fälle anlegen, bis die Deckung 100 % ist. Die Engine rechnet die Kombinationen; sie sagt auch,
   welche noch fehlt.
4. Für jeden Fall das **erwartete Ergebnis** hinschreiben. Auch „es passiert nichts" ist ein Wert,
   und er wird geschrieben, nicht weggelassen.

**Was du hier lernst, noch ohne Code:** welche Felder Pflicht sind, welche Kombinationen fachlich
verboten sind, und an welcher Stelle das Design keine Antwort hat.

Ein Feld mit vier Klassen und ein zweites mit drei ergeben zwölf Kombinationen. Wenn für zwei davon
niemand ein Ergebnis nennen kann, hast du zwei offene Fachfragen gefunden — am ersten Tag.

## 3. Die Zustandsmatrix

Das zweite Artefakt ist die Matrix: **Zeilen = Zustände**, **Spalten = Ereignisse**, **Zelle =
Reaktion**.

- Bau die Zustände zuerst als eigenes Blatt, die Ereignisse als zweites. Die Matrix verweist auf
  beide, statt sie abzuschreiben. Damit trägt jede Zelle mit, *welcher* Vorzustand und *welches*
  Ereignis gemeint sind — sonst prüft der Test später nur, dass irgendetwas passiert.
- **Ein verbotener Übergang ist ein Loch im Gitter**, kein Fehlerfall in einer Liste. Ein Loch sieht
  man. Einen vergessenen Fehlerfall sieht man nicht.
- Trenne **„ignorieren"** von **„Fehler"**. Beides heißt „es passiert nichts nach außen", aber das
  eine ist erwartet und das andere gehört ins Protokoll. In Prosa fällt der Unterschied weg.
- Halte die Reaktionen als **kurze Codes** (`INS>OFFEN`, `UPD>SACH`, `IGN`, `ERR`, `+OUT`). Sie
  müssen in eine Zelle passen und dürfen keine Prosa sein.

**Die Matrix ist der Ort, an dem das Datenmodell entsteht.** Wenn eine Zelle sagt „nimm die Prognose
zurück", brauchst du eine Spalte, in der steht, dass eine gesetzt wurde. Solche Spalten fordert kein
Design von sich aus.

## 4. Kreuzprüfung: Design gegen Tabelle

Jetzt die Arbeit, die den größten Teil des Nutzens bringt. Geh beide Richtungen:

- **Design → Tabelle:** hat jede Regel des Designs eine Zeile? Wenn nicht, ist sie entweder
  überflüssig oder die Tabelle ist unvollständig.
- **Tabelle → Design:** hat jede Zeile eine Regel? Wenn nicht, hat die Tabelle geraten.

Fragenkatalog, der sich bewährt hat:

1. Widersprechen sich zwei Dokumente in einer Zahl? (Seitengröße, Grenzwert, Frist, Zeitfenster)
2. Steht in der Tabelle eine Erwartung, die niemand entschieden hat?
3. Ist ein Ereignis nach seiner **Wirkung** benannt oder nach seinem **Auslöser**? Falsche Benennung
   baut Ausgänge, die es nicht geben soll.
4. Ist ein „Sonderfall" der Prosa in Wahrheit ein eigener Zustand? Prüfe, ob er auf mindestens ein
   Ereignis anders reagiert als sein Nachbar.
5. Gibt es eine Klasse „leer" oder „fehlt" für jedes optionale Feld? Genau dort sitzen die Fehler,
   die spätere Tests nicht finden — ein leerer Filter kommt auch dann richtig an, wenn er
   weggeworfen wird.

Jeden Befund festhalten: als offenen Punkt im Design, als Ausnahme in der Tabelle, oder als
Entscheidung im Log. **Kein Befund darf nur im Gespräch bleiben.**

## 5. Datenmodell

Erst jetzt die Tabellen der Datenbank. Sie folgen aus Matrix und Datenvertrag.

- **Eine Stelle migriert, eine andere greift zu.** Das Migrationswerkzeug besitzt das Schema, der
  Datenzugriff im Dienst kennt es nur. Zwischen beiden gehört ein **Gate**: ein Start-Lauf, der
  jede modellierte Spalte anfasst und beim ersten Fehlen abbricht. Eine leere Tabelle genügt dafür.
- Rechte **je Tabelle** nennen, nicht per Sammelbefehl über das Schema — der wirkt nur auf
  Tabellen, die beim Lauf schon existieren.
- Überlege, ob der Dienst löschen darf. Wenn nicht: markieren statt löschen, und dann gehören ein
  partieller eindeutiger Index, ein Filter in **jeder** Leseabfrage und ein Aufräumlauf in der
  Datenbank dazu.
- Jede Abfrage mit `LIMIT` braucht eine **eindeutige** Ordnung. Sonst erscheint beim Blättern eine
  Zeile zweimal oder nie.

## 6. Der Vertrag

Alles anlegen, nichts implementieren:

- Typen und Schemas der Nachrichten,
- die Fehlerklassen,
- die **Ports** — je ein Vertrag für Persistenz, Ausgang, Uhr, Protokoll, Fremddaten,
- die reinen Funktionen der Fachlogik.

Jede Methode wirft „nicht implementiert", und zwar mit **einem Wortlaut aus einer Konstante**. Der
gemeinsame Wortlaut ist wichtig: er macht die rote Kette prüfbar.

Ziel dieses Schritts: die Typprüfung ist grün, es gibt kein Verhalten.

## 7. Das Orakel

Der Testcode braucht eine Stelle, die aus einem Kurzcode eine Behauptung macht — und nur diese eine.

- Ein **Lader**, der einen Fallordner in ein Objekt liest.
- Eine **Deutung**, die `INS>OFFEN` in „es wurde eingefügt, Zustand offen" übersetzt.
- Diese Deutung wird **selbst getestet**.

Alles andere im Testcode reicht Werte durch. Wer die Deutung in den Erzeuger legt, prüft am Ende die
eigene Übersetzung gegen sich selbst.

## 8. Fälle erzeugen

Ein Skript liest die Mappe und schreibt je Fall einen Ordner mit Dateien: Eingabe, Vorzustand,
Erwartungen, Metadaten.

Regeln, die sich bezahlt haben:

- **Der Erzeuger deutet nicht.** Kurzcodes wandern unverändert durch.
- **„Nichts erwartet" ist ein geschriebener Wert** mit Grund, keine fehlende Datei.
- **Generierte Werte tragen ein Kennzeichen**, damit ein Lauf reproduzierbar bleibt.
- **Verwaiste Dateien werden gelöscht**, sonst laufen Fälle mit, die es nicht mehr gibt.
- **Sollzahlen ins Prüfskript** (Blätter, Fälle, Zellen). Ohne sie fällt eine stille Änderung nicht
  auf.

## 9. Die rote Kette

Alle Tests schreiben, bevor Fachlogik existiert. Erwartet: **jeder** Test rot, **alle** mit
derselben Meldung.

Das ist der einzige Zeitpunkt, an dem du beweisen kannst, dass die Tests etwas behaupten. Prüfe die
Meldung maschinell, nicht mit dem Auge — der Test-Runner kann sie als Datenformat ausgeben.

Ein Test, der aus einem anderen Grund rot ist, ist ein kaputter Test. Jetzt gefunden kostet er
Minuten.

## 10. Umsetzen in fünf Stufen

| Stufe | Gegenstand | Verbot |
|---|---|---|
| 1 | reine Funktionen | keine Uhr, keine Datenbank, keine Nachricht |
| 2 | Fachlogik gegen Ports | keine echte Infrastruktur; Uhr injiziert; Aufzeichner statt Adapter |
| 3 | Persistenz | **keine Fachregel** — nur, dass geschrieben und gelesen wird, was gemeint ist |
| 4 | Ränder | Konfiguration, Start, Abbruch, Adapter |
| 5 | Ende zu Ende | das gebaute Bündel, Rauchprobe |

Für Stufe 3 lohnt eine Datenbank-Engine, die **im Prozess** läuft und das **echte** DDL-Skript
abspielt. Damit prüft der Test das Schema, nicht eine Nachbildung.

Halte die Regel durch: rot → Code ändern. Passt die Erwartung nicht, zuerst die Tabelle ändern und
den Grund hinschreiben. Erlaubt ist, die **Vorbereitung** eines Falls zu korrigieren; nicht erlaubt
ist, das Ergebnis zu verschieben.

## 11. Gegenproben

Für jede Sicherung, die du gebaut hast, eine Probe: Sicherung entfernen, Tests laufen lassen,
Rotwerden **zählen**.

- Erwarte eine **Zahl**, nicht „irgendwas wird rot".
- Setze die Probe **an der Stelle an, die der Test wirklich berührt**. Eine Probe am falschen Ort
  bleibt grün und lässt eine gute Sicherung nutzlos aussehen.
- Notiere Eingriff und Zahl. Das ist der Beleg, dass die Suite trägt.

Kandidaten: Modell-Gate, Datenbank-Bedingungen, Zuständigkeits-Herleitung, Zeitzone,
Deutung leerer Listen, Nebenläufigkeit.

## 12. Ränder und Rauchprobe

- Adapter dünn halten: übersetzen, nicht entscheiden.
- Konfiguration einmal beim Start lesen, prüfen, und bei Pflichtlücken **abbrechen** statt
  weiterzulaufen.
- **Rauchprobe auf dem gebauten Bündel.** Build grün, Typen grün, Tests grün — und das Bündel
  startet nicht, weil ein Import im Bundle fehlt. Genau dafür ist die Probe da.

## 13. Betrieb

- **Mehrere Instanzen** sind der Normalfall. Halte keinen Zustand im Speicher.
- Genau eine Instanz darf den Takt führen. Nimm dafür **eine Zeile in einer Tabelle** mit Instanzname
  und Zeitstempel, keine Sitzungssperre: eine Sperre hängt an der Verbindung, dein Pool hat mehrere,
  und in einer Test-Engine mit einer Sitzung bekommen sie beide.
- **Puls schreiben, Alarm am Ausbleiben.** Ein Alarm auf einen Fehlerzähler meldet nichts, wenn der
  Prozess gar nicht mehr läuft.
- **Aufräumen gehört in die Datenbank**, nicht in den Dienst. Ein Dienst, der löschen darf, kann zu
  viel löschen.
- Ein gebautes Image ist nicht in Betrieb: wenn die Laufzeit-Definition die Version festschreibt,
  braucht es einen eigenen Schritt.

## 14. Die Kette schließen

Jede Prüfung, die du gebaut hast, gehört in **einen** Befehl. Reihenfolge vom Billigen zum Teuren:

```
format → lint → typecheck → toter Code → Schema-Drift →
Mappe → Diagramm → Fälle → build + Rauchprobe → Tests
```

Für jedes Glied gilt: **es muss mit Exit-Code ungleich 0 enden können.** Werkzeuge, die Fehler nur
protokollieren, brauchen ein Prüfskript, das den Fehler zu einem Abbruch macht.

## Die Fallen, die Zeit gekostet haben

| Falle | Wirkung | Gegenmittel |
|---|---|---|
| Tabellen-Engine meldet Fehler nur im Logger | kaputtes Blatt sieht gesund aus | eigenes Prüfskript mit Sollzahlen |
| Ein Marker gilt nur in einer Tabellenform | lautlos null Fälle erzeugt | Fallzahl gegen Sollwert prüfen |
| Doku des Werkzeugs widerspricht dem Code | falsche Annahme, kein Fehler | im Quellcode nachsehen, Befund festhalten |
| Mehrzeilig formatiertes Array | Änderungsskript ändert nichts, meldet Erfolg | Ergebnis am Parser messen, nicht am Skript |
| Erwartung angepasst statt Code | grüne Suite ohne Aussage | Regel: Tabelle zuerst, mit Begründung |
| Gegenprobe am falschen Ort | gute Sicherung sieht nutzlos aus | Probe dort ansetzen, wo der Test liest |
| Bundler ohne Typprüfung | Typfehler wandern ins Repo | `--noEmit`-Schritt in die Kette |
| Nicht eindeutige Sortierung | Zeile beim Blättern doppelt oder nie | zweites Kriterium mit eindeutigem Wert |
| Sammel-Grant über das Schema | neue Tabelle ohne Rechte | Rechte je Tabelle |

## Was sich nicht gelohnt hat

- **Eine Tabelle für jede Kleinigkeit.** Zwei reine Funktionen mit sechs Fällen hätten auch als
  gewöhnlicher Test gereicht. Die Tabelle lohnt, wo Kombinationen entstehen.
- **Sehr feine Klassen.** Mehr Klassen heißt mehr Kombinationen und mehr Pflichtfälle, ohne mehr
  Erkenntnis. Nimm die Klassen, an denen sich das Verhalten *ändert*.
- **Ein Fall mit „Multiply", wo ein Feld genügt.** Eine Vervielfältigung hat ein Blatt von 10 auf 157
  Fälle gebracht, ohne eine neue Aussage.

## Die drei Sätze, wenn du nur drei mitnimmst

1. **Eine Tabelle kann nicht schweigen.** Prosa ist an den unklaren Stellen still, eine Tabelle
   verlangt dort eine Zeile.
2. **Eine Erwartung ändert man nur über die Quelle, mit Begründung.** Sonst wird die Testsuite
   gefällig — bei einem Menschen unter Zeitdruck genauso wie bei einem KI-Agenten.
3. **Was lautlos scheitert, ist teurer als was abbricht.** Jede Prüfung braucht eine Zahl und einen
   Exit-Code.

Der Erfahrungsbericht zum konkreten Dienst liegt daneben:
[Blogartikel](2026-09-16_blog_dienst-mit-ki-und-tabellen.md).
