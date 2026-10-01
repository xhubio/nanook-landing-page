#!/bin/sh
# GitHub-Stars: holt die aktuelle Star-Zahl von xhubio/nanook-table und
# schreibt sie in den GitHub-Link der Kopfleiste aller HTML-Seiten
# (data-gh-stars + aria-label). Die Zahl ist absichtlich eingebacken: kein
# Request vom Besucher an GitHub, kein Springen beim Laden. Gelegentlich
# und vor Releases ausfuehren. Idempotent; aendert css/js nicht, also ist
# kein cache-bust noetig.
set -e
cd "$(dirname "$0")/.."
REPO=xhubio/nanook-table

if command -v gh >/dev/null 2>&1 && STARS=$(gh api "repos/$REPO" --jq .stargazers_count 2>/dev/null); then
  :
else
  STARS=$(curl -fsS "https://api.github.com/repos/$REPO" |
    sed -n 's/^ *"stargazers_count": *\([0-9][0-9]*\),*$/\1/p')
fi

case "$STARS" in
  '' | *[!0-9]*) echo "github-stars: keine gueltige Zahl erhalten ('$STARS')" >&2; exit 1 ;;
esac

OLD=$(sed -n 's/.*data-gh-stars>\([0-9][0-9]*\)<.*/\1/p' index.html | head -n 1)
find . -name "*.html" -not -path "./.git/*" -not -path "./.claude/*" -print0 | xargs -0 perl -pi -e "
  s{data-gh-stars>[0-9]+<}{data-gh-stars>$STARS<}g;
  s{on GitHub, [0-9]+ stars\"}{on GitHub, $STARS stars\"}g;
"
echo "github stars: ${OLD:-?} -> $STARS"
