#!/bin/sh
# Badges: holt die Verzeichnis-Badges fuer den Hero der Startseite und legt
# sie unter img/badges/ ab. Absichtlich eingebacken wie die GitHub-Sterne
# (tools/github-stars.sh): kein Request vom Besucher an skills.sh oder
# shields.io. Gelegentlich ausfuehren (die skills.sh-Zahl waechst).
#   skills.sh  offizielles Badge mit Installationszahl
#   Context7   kein offizielles Badge; statisches shields.io-Badge im selben Schwarz
# Idempotent; aendert css/js nicht, also kein cache-bust noetig.
set -e
cd "$(dirname "$0")/.."
mkdir -p img/badges
curl -fsSL "https://skills.sh/b/xhubio/nanook-table" -o img/badges/skills-sh.svg.tmp
curl -fsSL "https://img.shields.io/badge/Context7-indexed-0a0a0a?labelColor=000000" -o img/badges/context7.svg.tmp
for f in skills-sh context7; do
  grep -q "<svg" "img/badges/$f.svg.tmp" || { echo "badges: $f ist kein SVG" >&2; rm -f img/badges/*.tmp; exit 1; }
  mv "img/badges/$f.svg.tmp" "img/badges/$f.svg"
done
echo "badges: $(sed -n 's/.*aria-label="\([^"]*\)".*/\1/p' img/badges/skills-sh.svg | head -n1); $(sed -n 's/.*aria-label="\([^"]*\)".*/\1/p' img/badges/context7.svg | head -n1)"
