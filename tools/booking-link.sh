#!/bin/sh
# Booking link: sets the URL of the "Book a 30-minute call" button on /support
# (support.html + twin) and makes the button visible. Until this runs, the
# button ships with `hidden`. Idempotent; run again to change the URL.
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
