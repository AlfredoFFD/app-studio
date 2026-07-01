#!/usr/bin/env node
/**
 * PreToolUse guard for the app factory.
 * Requires HUMAN confirmation before any Edit/Write/MultiEdit to a secrets,
 * signing, or credentials path. A hook cannot be bypassed (CLAUDE.md is obeyed
 * ~80% of the time); this is a wall, not a request.
 * Fail-open: any error → allow (never block the loop on a guard bug).
 */
const fs = require('fs');

let input = '';
try {
  input = fs.readFileSync(0, 'utf8');
} catch {
  process.exit(0); // no stdin → allow
}

try {
  const data = JSON.parse(input || '{}');
  const ti = data.tool_input || {};
  const p = String(ti.file_path || ti.path || ti.notebook_path || '').replace(/\\/g, '/');

  const PROTECTED = /(\.env(\.|$)|\/\.env$|secrets?|credentials?|signing|eas\.json|app-?store-?connect|\.p8$|\.p12$|\.pem$|\.keystore$|\.jks$|AuthKey|id_rsa|serviceAccount|\.composio)/i;

  if (p && PROTECTED.test(p)) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'ask',
          permissionDecisionReason: `Protected path (${p}): secrets/signing/credentials require human confirmation before edit.`,
        },
      }),
    );
  }
  process.exit(0);
} catch {
  process.exit(0); // malformed input → allow
}
