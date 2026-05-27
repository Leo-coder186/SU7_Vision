<!--
 * @Description: Env 环境光照组件
 *              使用 HDR 全景图创建真实的环境光照效果
 *              为 3D 场景提供基于图像的光照（Image-Based Lighting）
 * @Author: your name
 * @version:
 * @Date: 2024-12-25 13:49:37
 * @LastEditors: your name
 * @LastEditTime: 2024-12-25 14:29:06
-->
<template>
    <!--
        Environment: @tresjs/cientos 提供的高动态范围环境光照组件
        功能：加载 HDR 贴图作为场景的环境光来源

        属性说明：
        - resolution="512": 环境贴图分辨率，值越高越清晰但性能消耗越大
        - files: HDR 全景图路径（.hdr 格式支持高动态范围）
        - background: 将 HDR 图作为场景背景显示

        ref="environmentRef": 获取组件实例引用，用于访问加载后的纹理对象
    -->
   <Environment
        resolution="512"
        ref="environmentRef"
        files="/src/assets/env/影棚全景贴图.hdr"
        background
    />
</template>

<script setup>
/**
 * Environment: @tresjs/cientos 提供的环境光照组件
 *              封装了 Three.js 的 HDR 环境贴图加载和 PMREMGenerator
 *
 * shallowRef: Vue 3 组合式 API，创建浅层响应式引用
 *             用于存储非深度响应的对象（如 THREE.Texture）
 *
 * watch: Vue 3 组合式 API，用于监听响应式数据变化
 */
import { Environment } from '@tresjs/cientos'
import { shallowRef, watch } from 'vue'

/**
 * environmentRef: 环境组件的引用
 * 使用 shallowRef 创建，避免对 THREE.Texture 内部属性进行深度追踪
 */
const environmentRef = shallowRef()

/**
 * watch: 监听 environmentRef 的变化
 * 当 HDR 纹理加载完成后，打印纹理对象信息到控制台
 * 这对于调试和了解纹理结构很有帮助
 */
watch(environmentRef, texture => {
  console.log(texture)
})
</script>

<style scoped></style>
