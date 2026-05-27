/*
 * @Description: 
 * @Author: your name
 * @version: 
 * @Date: 2024-12-16 09:05:26
 * @LastEditors: your name
 * @LastEditTime: 2024-12-25 09:44:42
 */
import { fileURLToPath, URL } from 'node:url'
import { templateCompilerOptions } from '@tresjs/core'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue({...templateCompilerOptions})],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			assets: fileURLToPath(new URL('./src/assets', import.meta.url)),
			images: fileURLToPath(new URL('./src/assets/images', import.meta.url)),
			models: fileURLToPath(new URL('./src/assets/models', import.meta.url)),
			textures: fileURLToPath(new URL('./src/assets/textures', import.meta.url)),
		},
	},
})
