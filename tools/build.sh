#!/bin/sh
# Rebuild site/assets/app.js from its sources
cd "$(dirname "$0")/.." && cat tools/icons.js tools/main.js > site/assets/app.js
