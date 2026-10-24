#!/usr/bin/env bash
# Requires fonttools/pyftsubset and the upstream Noto SC variable TTFs in
# generated-artifacts/font-sources/{NotoSansSC,NotoSerifSC}.ttf.
# Prints the content-hashed filenames to use in server/i18n/render.ts.
set -euo pipefail
cd "$(dirname "$0")/.."
SOURCE_DIR="generated-artifacts/font-sources"
TEXT_FILE="$SOURCE_DIR/zh-current.txt"
# Nix wraps the FontTools CLI with its own Python path; expose the separately
# installed Brotli module to that interpreter rather than installing it again.
for brotli_dir in /nix/store/*-python3.11-brotli-*/lib/python3.11/site-packages; do
  if [ -f "$brotli_dir/brotli.py" ]; then
    export PYTHONPATH="$brotli_dir${PYTHONPATH:+:$PYTHONPATH}"
    break
  fi
done
python3 - "$TEXT_FILE" <<'PY'
import json, pathlib, sys
dictionary = json.loads(pathlib.Path("server/i18n/strings/zh.json").read_text())
pathlib.Path(sys.argv[1]).write_text("".join(sorted(set("".join(dictionary.values())))))
PY

for family in Sans Serif; do
  source="$SOURCE_DIR/Noto${family}SC.ttf"
  test -f "$source" || { echo "Missing upstream font: $source" >&2; exit 1; }
  if [ "$family" = Sans ]; then weights="400 500 600 700"; else weights="400 600 700 800"; fi
  for weight in $weights; do
    instance="$SOURCE_DIR/Noto${family}SC-${weight}.ttf"
    output="$SOURCE_DIR/Noto${family}SC-${weight}.woff2"
    fonttools varLib.instancer "$source" "wght=$weight" --output="$instance" --no-recalc-timestamp --quiet
    pyftsubset "$instance" --text-file="$TEXT_FILE" --output-file="$output" \
      --flavor=woff2 --layout-features='*' --no-recalc-timestamp
    hash="$(sha256sum "$output" | cut -c1-10)"
    lower="$(printf '%s' "$family" | tr '[:upper:]' '[:lower:]')"
    destination="assets/fonts/noto-${lower}-sc-${weight}-zh-subset-${hash}.woff2"
    cp "$output" "$destination"
    echo "$destination"
  done
done
