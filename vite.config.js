import fs from 'node:fs/promises'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function ssrRegisterRoutePlugin() {
  return {
    name: 'ssr-register-route',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'GET') {
          next()
          return
        }

        const requestUrl = req.originalUrl || req.url || ''
        const pathname = new URL(requestUrl, 'http://localhost').pathname

        if (pathname !== '/register') {
          next()
          return
        }

        try {
          const template = await fs.readFile(path.resolve('index.html'), 'utf-8')
          const transformedTemplate = await server.transformIndexHtml(requestUrl, template)
          const { renderApp } = await server.ssrLoadModule('/src/ssr/renderApp.jsx')
          const appHtml = renderApp('/register')

          res.statusCode = 200
          res.setHeader('Content-Type', 'text/html')
          res.end(
            transformedTemplate.replace(
              '<div id="root"></div>',
              `<div id="root" data-page="register">${appHtml}</div>`
            )
          )
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ssrRegisterRoutePlugin(),
  ],
})
