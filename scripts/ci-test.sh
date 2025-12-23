#!/usr/bin/env bash
set -euo pipefail

export CI=true

pnpm test
