#!/bin/zsh
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd "${0:A:h}" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "Install Node.js 24, then reopen this launcher."
else
  node scripts/local-ai-preview.mjs
fi
read -r "reply?AI server stopped. Press Return to close."
