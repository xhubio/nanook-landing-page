
Was sich geändert hat
- Teile 2 bis 9 und 5b sind ausgetragen: keine Sidebar-Einträge, keine Teaser, nicht in Feeds, Sitemap oder llms.txt. Die Dateien liegen an ihren finalen Pfaden als noindex-Entwürfe ohne Twin; die saubere URL antwortet erst, wenn der Teil erscheint. Sichtbar sind Teil 1, der Volltext-Artikel und der Leitfaden.
- Teil 1 zeigt die Serientabelle ohne Links, mit dem Satz, dass die Zeilen zu Links werden, sobald die Teile erscheinen. Im Volltext-Artikel sind nur die drei Hinweise auf Teil 1 verlinkt; die übrigen zwanzig sagen „on the blog from <Datum>“. Der Leitfaden nennt 5b mit Datum statt Link.
- Serien-Navigation in den Entwürfen: Vorgänger verlinkt nur, wenn veröffentlicht; Nachfolger als Klartext mit Datum.

Werkzeug für den Erscheinungstag
- blog/new/series-state.json hält je Teil den Status.
- python3 tools/publish-part.py <slug> registriert einen Teil an allen Stellen, setzt Twin und index, follow, verlinkt die Zeile in Teil 1, ergänzt „Next“ im Vorgänger, setzt bei 5b den Rückverweis in Teil 5, baut die Artikel neu und aktualisiert den Serienplan. Idempotent, erzwingt die Reihenfolge, meldet unbekannte Slugs. Danach Commit und Push.
- Im Probelauf in einer Repo-Kopie: Teil 2 zweimal (zweiter Lauf ohne Änderung), 5b vor 5 abgelehnt, dann 3, 4, 5, 5b in Folge; alle Reihenfolgen, Feeds, Sitemap, Artikel-Links und Twins stimmten.
- tools/unpublish-parts.py ist die Umkehrung; tools/series_lib.py der gemeinsame Code. AGENTS.md und der Serienplan (Statuszeilen, Übersichtstabelle, offener Punkt 7, Checkliste) beschreiben den Ablauf.

Lektor: keine Blocker; die fünf Warnungen (ein Satzfragment in Teil 1, doppeltes „on the blog“ im Leitfaden, der verlinkte Teil 5 im Kopf von 5b, ein Widerspruch im Serienplan, die Sidebar-Zahl in AGENTS.md) und die Hinweise (Tempus im letzten Teil, Skript-Kommentar, unbekannter Slug, __pycache__ in .gitignore) sind eingearbeitet und nachgeprüft.

Für morgen: LinkedIn zu Teil 1 kann raus, Teil 1 ist live. Am 29.09. dann:

python3 tools/publish-part.py agent-toolbox-and-instruction-file

danach Commit und Push, dann der LinkedIn-Post.

Git: 44 geänderte, 9 gelöschte (die Twin-Ordner der Entwürfe) und 4 neue Dateien, HEAD bei 49ae330. Der Auto-Commit nimmt das beim nächsten Lauf mit; bis dahin sind die Zukunftsteile online noch sichtbar.