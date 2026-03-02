import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function cspPlugin(): Plugin {
  return {
    name: 'html-csp',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.server) {
          const cspMeta = [
            `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self' https://api-sandbox.co.uat.wompi.dev; img-src 'self' data: https:;" />`,
            `<meta http-equiv="X-Content-Type-Options" content="nosniff" />`,
            `<meta name="referrer" content="strict-origin-when-cross-origin" />`,
          ].join('\n    ')
          return html.replace('</head>', `    ${cspMeta}\n  </head>`)
        }
        return html
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cspPlugin()],
  server: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
  },
})
