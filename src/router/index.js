/**
 * @Description: router/index.js 路由配置文件
 *              定义应用的路由规则，实现单页应用的页面导航
 *
 * 路由说明：
 * - / 路径重定向到 /car
 * - /car 路径显示 CarView.vue 组件（汽车展示页面）
 */

import { createRouter, createWebHistory } from 'vue-router'

/**
 * createRouter: 创建路由实例的工厂函数
 *
 * 配置选项：
 * - history: URL 路由模式
 *   - createWebHistory: history 模式，使用 HTML5 History API
 *     优点：URL 看起来像普通 URL（如 /car）
 *     缺点：需要服务器配置支持，否则刷新页面会 404
 *   - createWebHashHistory: hash 模式，使用 URL hash（如 /#/car）
 *     优点：不需要服务器配置，刷新不会 404
 *     缺点：URL 中带有 #，不够美观
 *
 * - import.meta.env.BASE_URL: 应用的基础路径
 *   Vite 构建时会替换为实际值
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  /**
   * routes: 路由规则数组
   * 每个路由规则包含：
   * - path: URL 路径
   * - name: 路由名称（可选，用于编程式导航）
   * - component: 路径匹配时渲染的组件
   * - redirect: 重定向目标（可选）
   */
  routes: [
    /**
     * 根路径重定向规则
     * 当访问 / 时，自动跳转到 /car
     */
    {
      path: '/',
      redirect: '/car',
    },

    /**
     * 汽车展示页面路由
     * 访问 /car 时，显示 CarView.vue 组件
     */
    {
      path: '/car',
      name: 'car',
      component: () => import('../views/CarView.vue'),
    }
  ],
})

/**
 * 默认导出路由实例
 * 供 main.js 中的 app.use(router) 安装
 */
export default router
