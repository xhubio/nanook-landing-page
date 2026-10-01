#!/bin/sh
# Booking link: sets or changes the URL of the "Book a 30-minute call" button
# on /support (support.html + twin); also removes a leftover `hidden`.
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
BOOKING_URL="$URL" perl -pi -e '
  s{<a class="btn btn-secondary" href="[^"]*" data-booking-link(?: hidden)?>}{<a class="btn btn-secondary" href="$ENV{BOOKING_URL}" data-booking-link>}g;
' support.html
cp support.html support/index.html
grep -o '<a class="btn btn-secondary" href="[^"]*" data-booking-link[^>]*>' support.html
