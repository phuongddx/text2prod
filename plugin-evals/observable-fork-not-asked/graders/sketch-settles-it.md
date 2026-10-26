---
type: llm
focus: trace
---

PASS if, before recommending a layout, the agent built something that shows the two layouts with the sample titles (for example it wrote an HTML sketch using both stylesheets, or wrote and ran a script that works out how many orders fit and which titles get cut), and the final reply bases its recommendation on what that sketch or run showed.
FAIL if the agent asks the user to choose grid or rows, or asks permission to build a sketch, before building one. Also FAIL if it recommends a layout from reasoning alone without writing or running anything.
