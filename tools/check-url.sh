#!/usr/bin/env bash
# Fetch a URL and show whether each needle appears in its text, with context.
# usage: tools/check-url.sh URL "needle1" ["needle2" ...]
u="$1"; shift
f=$(mktemp)
code=$(curl -sL -m 30 -A 'Mozilla/5.0' -o "$f" -w '%{http_code}' "$u")
python3 -I - "$f" "$code" "$u" "$@" <<'PY'
import sys, re, html
f, code, u, *needles = sys.argv[1:]
t = open(f, errors='replace').read()
t = re.sub(r'<script.*?</script>|<style.*?</style>', '', t, flags=re.S)
t = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', t)))
print(code, u[:90])
for x in needles:
    i = t.find(x)
    print('   ', ('OK ' if i >= 0 else 'MISSING ') + x[:60], ('…' + t[max(0, i-80):i+160] + '…') if i >= 0 else '')
PY
rm -f "$f"
