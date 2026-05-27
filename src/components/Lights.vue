<!--
 * @Description: Lights 光照系统组件
 *              为 3D 场景配置多种光源，营造真实的光照环境
 *              包含环境光、直射光、半球光、聚光灯四种光源
 * @Author: your name
 * @version:
 * @Date: 2024-12-16 10:15:22
 * @LastEditors: your name
 * @LastEditTime: 2024-12-16 15:09:13
-->
<template>
    <!--
        环境光：
        - TresAmbientLight: 环境光组件，照亮场景中所有物体
        - intensity: 0.4 光照强度（0-1 范围）
        - color: "white" 白色光源
        特点：没有方向，所有物体均匀照亮，不产生阴影
    -->
    <TresAmbientLight :intensity="0.4" color="white" />

    <!--
        平行光（主光源）：
        - TresDirectionalLight: 平行光组件，光线从一个方向照射
        - position: [0, 50, 0] 位于场景正上方
        - intensity: 0.9 高强度
        - cast-shadow: true 开启阴影投射
        特点：模拟太阳光，产生方向性照明和阴影
    -->
    <TresDirectionalLight :position="[0, 50, 0]" :intensity="0.9" :cast-shadow="true" />

    <!--
        半球光：
        - TresHemisphereLight: 半球光组件
        - position: [0, 300, 0] 高空位置
        - color: "white" 上方光线颜色（天空色）
        - intensity: 0.65 光照强度
        特点：模拟天空和地面的光照差异，天空色和地面色渐变
    -->
    <TresHemisphereLight :position="[0, 300, 0]" color="white" :intensity="0.65" />

    <!--
        聚光灯：
        - TresSpotLight: 聚光灯组件
        - intensity: 1 最大强度
        - angle: Math.PI / 7 光锥角度（约25.7度）
        - distance: 1600 照射距离
        - position: [15, 600, 1000] 位于右前方的较高位置
        - color: "white" 白色光源
        特点：从一点向特定方向照射的光源，可产生锥形照明区域
    -->
    <TresSpotLight :intensity="1" :angle="spotAngle" :distance="1600" :position="[15, 600, 1000]" color="white" />
</template>

<script setup>
/**
 * spotAngle: 聚光灯的光锥角度
 * Math.PI / 7 ≈ 0.448 弧度 ≈ 25.7 度
 * 这是一个较窄的光束，适合突出照亮特定区域
 */
const spotAngle = Math.PI / 7
</script>

<style scoped></style>
