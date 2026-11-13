#!/bin/sh
# Rebuild site/assets/app.js from its sources
cd "$(dirname "$0")/.." && cat tools/icons.js tools/main.js tools/members.js > site/assets/app.js
