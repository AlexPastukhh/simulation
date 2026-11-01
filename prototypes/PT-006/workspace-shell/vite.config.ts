import react from '@vitejs/plugin-react'
import { workspaceBridgePlugin } from './dev/workspaceBridgePlugin.ts'
import { defineConfig } from 'vite'
import { mechanicsSourcePlugin } from './dev/mechanicsSourcePlugin.ts'

export default defineConfig({
  plugins: [mechanicsSourcePlugin(), react(), workspaceBridgePlugin()],
})
