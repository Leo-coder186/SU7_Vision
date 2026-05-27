/**
 * @Description: main.js 应用入口文件
 *              负责创建 Vue 应用实例并挂载到 DOM
 *
 * @Author: your name
 * @version:
 * @Date: 2024-12-11 10:21:21
 * @LastEditors: your name
 * @LastEditTime: 2024-12-25 09:50:30
 */

/**
 * 使用步骤：
 * 1. 引入必要的模块
 * 2. 创建 Vue 应用实例
 * 3. 安装插件（TresJS、Vue Router）
 * 4. 挂载到 DOM
 */

import Tres from '@tresjs/core'
import './assets/styles/index.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

/**
 * createApp: Vue 3 提供的创建应用实例的工厂函数
 *
 * 参数：
 * - App: 根组件（App.vue）
 *
 * 返回值：
 * - app 实例，用于后续配置和挂载
 */
const app = createApp(App)

/**
 * app.use: 安装 Vue 插件
 *
 * 1. Tres (TresJS):
 *    - Vue 3 的 Three.js 封装库
 *    - 提供声明式的 3D 渲染组件
 *    - 需要在 Vue 应用中安装才能使用 <TresCanvas> 等组件
 *
 * 2. router (Vue Router):
 *    - Vue 官方路由管理库
 *    - 管理应用中的页面导航
 *    - 安装后可以在组件中使用 $router 和 <router-view>
 */
app.use(Tres)
app.use(router)

/**
 * app.mount: 将 Vue 应用挂载到 DOM
 *
 * 参数：
 * - '#app': CSS 选择器，表示挂载到 id="app" 的 DOM 元素
 *
 * 注意：
 * - 挂载前，Vue 应用处于"未挂载"状态
 * - 挂载后，Vue 应用进入"已挂载"状态，开始响应式更新
 * - 被挂载的 DOM 元素会被 Vue 应用的模板内容替换
 *
 * 执行顺序：
 * 1. Vue 根据 App.vue 的模板创建虚拟 DOM
 * 2. Vue 将虚拟 DOM 渲染为真实 DOM
 * 3. 真实 DOM 替换 #app 元素的内容
 */
app.mount('#app')
