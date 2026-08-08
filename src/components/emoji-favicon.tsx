import * as React from "react"

const favicon =
  `data:image/svg+xml,` +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🌌</text></svg>`)

const EmojiFavicon = () => <link rel="icon" href={favicon} />

export default EmojiFavicon
