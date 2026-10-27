#!/usr/bin/env bash
# Builds one Lambda zip per function into backend/dist/<function-name>.zip,
# where cmd/<group>/<name> becomes fife-<group>-<name> with hyphens.
#
# Reproducible: -trimpath and -buildvcs=false keep the checkout out of the
# binary, and every file's mtime is fixed before zipping with -X so no
# extra fields leak the build time. Without this, source_code_hash changes
# on every build and Terraform sees drift.
set -euo pipefail

cd "$(dirname "$0")/.."

dist="$PWD/dist"
rm -rf "$dist"
mkdir -p "$dist"

find cmd -name main.go | sort | while IFS= read -r main_go; do
  dir="$(dirname "$main_go")"
  name="fife-$(echo "${dir#cmd/}" | tr '/_' '--')"
  stage="$(mktemp -d)"

  GOOS=linux GOARCH=arm64 CGO_ENABLED=0 \
    go build -trimpath -buildvcs=false -ldflags="-s -w" -tags lambda.norpc \
    -o "$stage/bootstrap" "./$dir"
  touch -t 202001010000.00 "$stage/bootstrap"
  (cd "$stage" && zip -Xq "$dist/$name.zip" bootstrap)

  rm -rf "$stage"
done
