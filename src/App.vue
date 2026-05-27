<!--
 * @Description: App.vue 根组件
 *              整个 Vue 应用的根容器组件
 *              负责渲染路由视图和提供全局 Suspense 边界
 *
 * @Author: your name
 * @version:
 * @Date: 2024-12-16 09:05:26
 * @LastEditors: your name
 * @LastEditTime: 2024-12-25 10:05:33
-->
<template>
    <!--
        Suspense: Vue 3 内置的异步组件边界组件
        作用：
        1. 为异步组件（使用 await 的组件）提供加载状态管理
        2. 可以在异步组件加载时显示 fallback 内容
        3. 支持优雅地处理异步组件的挂起状态

        router-view: Vue Router 提供的路由视图组件
        根据当前 URL 路径，渲染对应路由配置的组件
    -->
    <Suspense>
        <router-view />
    </Suspense>
</template>

<script setup>
/**
 * RouterView: 从 vue-router 导入的路由视图组件
 * 用于渲染当前路由匹配的组件
 *
 * 注意：在 Vue 3 的 <script setup> 语法中，
 * 组件可以直接使用而不需要额外导入（自动注册）
 */
import { RouterView } from 'vue-router'
</script>

<style>
/*
 * 全局样式定义
 * 这些样式会应用到整个应用
 */

/*
 * App.vue 的样式为空，
 * 具体的样式定义在 src/assets/styles/index.css 中
 * 实际样式通过 main.js 中的 import './assets/styles/index.css' 引入
 */
</style>
