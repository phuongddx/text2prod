---
type: tool_order
before: { tool: Write, input_match: '"file_path"\s*:\s*"[^"]*test[^"]*"' }
after: { tool: Write, input_match: '"file_path"\s*:\s*"[^"]*/slugify\.js"' }
weight: 2
---
