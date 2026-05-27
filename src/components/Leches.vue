<!--
 * @Description: Leches 调试面板组件
 *              使用 @tresjs/leches 库创建交互式调试界面
 *              用于在开发时调整地面反射效果的各种参数
 * @Author: your name
 * @version:
 * @Date: 2024-12-25 11:32:24
 * @LastEditors: your name
 * @LastEditTime: 2024-12-25 11:39:58
-->
<template>
  <!-- TresLeches 是 @tresjs/leches 提供的核心组件，用于渲染调试控制面板 -->
  <TresLeches />
</template>

<script setup>
/**
 * 引入模块说明：
 * - TresLeches: leches 库的 Vue 组件，用于自动生成调试 GUI 面板
 * - useControls: leches 提供的组合式函数，用于注册可调参数
 * - reflectGroundConfig: 从配置文件中导入的地面反射参数配置对象
 * - @tresjs/leches/styles: leches 库所需的 CSS 样式
 */
import { TresLeches, useControls } from '@tresjs/leches'
import {reflectGroundConfig} from '@/config'
import '@tresjs/leches/styles'

/**
 * 'fpsgraph' - 开启 FPS 帧率监控图表，显示在屏幕角落
 * reflectGroundConfig - 将配置对象中的所有参数绑定到控制面板，
 *                      这样就可以通过 GUI 实时调节地面反射的各种效果参数
 */
useControls('fpsgraph')
useControls(reflectGroundConfig)
</script>

<style scoped>
/* 组件作用域样式，当前为空，样式由 leches 库内置提供 */
</style>
