#!/bin/sh
# Booking link: sets or changes the URL of every element marked
# `data-booking-link`: the "Book a call" button in the bar (all pages) and the
# "Book a 30-minute call" button on /support. Also removes a leftover `hidden`.
# Idempotent. If the provider changes, update the "Booking a Call" section in
# privacyPolicy.html too.
#   tools/booking-link.sh https://cal.com/…
set -e
cd "$(dirname "$0")/.."
URL="$1"
case "$URL" in
  https://*) ;;
  *) echo "booking-link: expected an https:// URL" >&2; exit 1 ;;
esac
case "$URL" in
  *'"'* | *"'"* | *'<'* | *'>'* | *' '* | *'\\'*) echo "booking-link: URL contains forbidden characters" >&2; exit 1 ;;
esac
find . -name "*.html" -not -path "./.git/*" -not -path "./.claude/*" -not -path "./.agents/*" -print0 |
  BOOKING_URL="$URL" xargs -0 perl -pi -e '
    s{<a ([^>]*?)href="[^"]*"([^>]*?)data-booking-link(?: hidden)?>}{<a $1href="$ENV{BOOKING_URL}"$2data-booking-link>}g;
  '
echo "booking link -> $URL in $(grep -rl --include='*.html' 'data-booking-link' . | wc -l | tr -d ' ') file(s)"
