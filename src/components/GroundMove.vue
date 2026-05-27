<!--
 * @Description: GroundMove 移动旋转地面组件
 *              当车辆启动时显示，地面会缓慢旋转移动产生动态效果
 * @Author: your name
 * @version:
 * @Date: 2024-12-23 11:14:34
 * @LastEditors: your name
 * @LastEditTime: 2024-12-23 11:14:34
-->
<template>
  <!--
    外层 TresGroup: 整个地面组的容器
    设置位置为 [0,0,0]，即场景原点
  -->
  <TresGroup :position="[0,0,0]">
    <!--
      primitive 组件: 用于渲染原生 Three.js 对象
      planeBackGround: 外层大半径圆形地面，纹理为整体场景图
      特性：透明、静止不动
    -->
    <primitive :object="planeBackGround"/>

    <!--
      planeMove: 内层小半径圆形地面，纹理为移动的车道图
      特性：半透明、持续向右偏移产生移动感
      位置略微抬升 0.03 单位避免与外层地面穿插
    -->
    <primitive :object="planeMove"/>
  </TresGroup>
</template>

<script setup lang="ts">
/**
 * useTexture: @tresjs/core 提供的组合式函数，用于异步加载纹理贴图
 *
 * THREE: three.js 主模块，包含所有 3D 相关的类
 *
 * useLoop: @tresjs/core 提供的组合式函数，用于注册渲染循环回调
 *          - onBeforeRender: 在每帧渲染之前调用
 *          - onAfterRender: 在每帧渲染之后调用
 */
import { useTexture } from '@tresjs/core';
import * as THREE from 'three'
import {useLoop} from '@tresjs/core'

/**
 * 获取渲染循环控制函数
 * onBeforeRender: 可以在这个回调中进行每帧更新逻辑
 */
const {onBeforeRender}=useLoop()

/**
 * BasePath: 纹理图片的基础路径
 */
const BasePath='/src/assets/images/'

/**
 * useTexture: 异步加载两张地面纹理贴图
 *
 * - changjing2.jpg: 整体场景背景图，用于外层大半径地面
 * - ground2.jpg: 移动的车道地面图，用于内层小半径地面
 *
 * 返回值：对应顺序的 THREE.Texture 对象数组
 */
const [wholeTexture,movedTexture]=await useTexture(['changjing2.jpg','ground2.jpg'].map(item=>BasePath+item))

/**
 * 设置纹理包裹模式：
 * - wrapS: 水平方向包裹模式
 * - wrapT: 垂直方向包裹模式
 * - RepeatWrapping: 纹理重复包裹，当 UV 超出 0-1 范围时重复贴图
 *
 * 这样当地面纹理坐标偏移时，会产生无缝的重复效果
 */
wholeTexture.wrapS=wholeTexture.wrapT=THREE.RepeatWrapping
movedTexture.wrapS=movedTexture.wrapT=THREE.RepeatWrapping

/**
 * 创建外层静止地面：
 * - CircleGeometry(80, 36): 半径 80 单位，分段数 36 的圆形几何体
 * - MeshStandardMaterial: 基础 PBR 材质
 *   - map: 漫反射贴图
 *   - transparent: true 启用透明
 *   - opacity: 0.6 设置60%透明度
 */
const planeBackGround=new THREE.Mesh(
    new THREE.CircleGeometry(80,36),  // 圆形几何体：半径80，36个分段
    new THREE.MeshStandardMaterial({
        map:wholeTexture,              // 使用整体场景纹理
        transparent:true,              // 开启透明效果
        opacity:0.6                    // 60%不透明度
    })
)
console.log(planeBackGround);

/**
 * 创建内层移动地面：
 * - CircleGeometry(8, 36): 半径 8 单位，分段数 36 的圆形几何体
 * - MeshStandardMaterial: 基础 PBR 材质
 *   - map: 移动的车道纹理
 *   - transparent: true 启用透明
 *   - opacity: 0.8 设置80%透明度
 *
 * 特点：半径小、纹理会持续偏移产生运动感
 */
const planeMove=new THREE.Mesh(
    new THREE.CircleGeometry(8,36),  // 圆形几何体：半径8，36个分段
    new THREE.MeshStandardMaterial({
        map:movedTexture,              // 使用移动车道纹理
        transparent:true,              // 开启透明效果
        opacity:0.8                    // 80%不透明度
    })
)

/**
 * 旋转几何体：
 * - 默认 CircleGeometry 创建在 XZ 平面上（竖直）
 * - 需要绕 X 轴旋转 -90 度（-Math.PI/2）使其变成水平地面
 */
planeBackGround.rotation.x-=Math.PI/2
planeMove.rotation.x-=Math.PI/2

/**
 * 抬升内层地面位置：
 * - y += 0.03 将内层地面略微抬高
 * - 避免和外层地面产生 Z-Fighting（深度冲突闪烁）
 */
planeMove.position.y+=0.03

/**
 * onBeforeRender 渲染循环回调：
 * 功能：每帧将内层地面的纹理进行偏移，产生持续移动的效果
 *
 * 实现原理：
 * - THREE.js 的纹理对象有 offset 属性（THREE.Vector2 类型）
 * - 每帧将 offset.x 增加 0.01，纹理就会持续向右平移
 * - 当增加到超过 1 时会自动回绕，所以视觉效果是无限循环的道路
 */
onBeforeRender(()=>{
    /**
     * 获取内层地面的材质
     * 断言为 MeshStandardMaterial 类型以便访问 map 属性
     */
    const mat = planeMove.material as THREE.MeshStandardMaterial
    if (mat.map) {
        /**
         * 关键：每帧让纹理在水平方向偏移 0.01
         * 这样配合透明度的视觉效果，就像是车辆在向前行驶
         */
        mat.map.offset.x += 0.01
    }
})
</script>

<style scoped>
/* 组件作用域样式，当前为空 */
</style>
