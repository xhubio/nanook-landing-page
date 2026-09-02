#!/bin/sh
# Cache-Busting: haengt einen Inhalts-Hash als ?v= an die Assets, die sich
# aendern (nanook.css, theme.js). Nach JEDER Aenderung an einer der beiden
# Dateien ausfuehren, sonst ueberdeckt der Browser-Cache (GitHub Pages,
# max-age 600) den Deploy bis zu 10 Minuten. Idempotent — ersetzt auch ein
# vorhandenes ?v=.
set -e
cd "$(dirname "$0")/.."
CSS_HASH=$(shasum css/nanook.css | cut -c1-8)
JS_HASH=$(shasum js/theme.js | cut -c1-8)
find . -name "*.html" -not -path "./.git/*" -print0 | xargs -0 perl -pi -e "
  s{/css/nanook\.css(\?v=[0-9a-f]+)?}{/css/nanook.css?v=$CSS_HASH}g;
  s{/js/theme\.js(\?v=[0-9a-f]+)?}{/js/theme.js?v=$JS_HASH}g;
"
echo "nanook.css -> ?v=$CSS_HASH; theme.js -> ?v=$JS_HASH"
