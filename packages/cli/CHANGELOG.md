# @pimlico/cli

## 0.0.3

### Patch Changes

- 9ca6993: Redact the API key in CLI output instead of printing it in plaintext. When the CLI is run under a coding agent (e.g. Claude Code), stdout is captured into the chat context, so logging the raw key leaked the credential. The received key is now masked (short prefix + suffix) — enough to confirm the right key was received without exposing the usable secret.

## 0.0.2

### Patch Changes

- ec2c7a8: Replace yargs with commander

## 0.0.1

### Patch Changes

- 3598930: Added basic implementation
