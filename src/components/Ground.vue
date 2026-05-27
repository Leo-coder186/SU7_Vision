<!--
 * @Description: Ground 反射地面组件
 *              使用 @tresjs/cientos 的 MeshReflectionMaterial 创建具有真实反射效果的地面
 * @Author: your name
 * @version:
 * @Date: 2024-12-16 10:19:18
 * @LastEditors: your name
 * @LastEditTime: 2024-12-23 11:14:34
-->
<template>
    <!--
        TresMesh: TresJS 的 3D 网格组件
        rotation: 将平面旋转 -90 度（-Math.PI / 2），使其从垂直变为水平覆盖地面
    -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]">
        <!--
            TresPlaneGeometry: 平面几何体组件
            args: [1000, 1000] 表示平面尺寸为 1000x1000 单位
        -->
        <TresPlaneGeometry :args="[1000, 1000]" />

        <!--
            MeshReflectionMaterial: 来自 @tresjs/cientos 的反射材质
            该材质能够模拟真实的地板反射效果，包含以下参数：

            【分辨率与混合比例】
            - resolution: 反射贴图分辨率，值越高反射越清晰
            - mix: 反射与原始地面的混合比例，1 表示完全反射
            - blur-mix-smooth / blur-mix-rough: 模糊反射的平滑/粗糙混合

            【清晰反射参数（sharp reflection）】
            - sharpMix: 清晰反射的混合强度
            - sharpDepthEdgeMin/Max: 清晰反射深度边缘范围
            - sharpDepthScale: 清晰反射深度缩放
            - sharpDepthBias: 清晰反射深度偏移

            【模糊反射参数（blur reflection）】
            - blurSize: 模糊反射的宽度和高度
            - blurDepthEdgeMin/Max: 模糊反射深度边缘范围
            - blurDepthScale: 模糊反射深度缩放
            - blurDepthBias: 模糊反射深度偏移

            【其他效果参数】
            - distortion: 反射扭曲强度
            - reflectorOffset: 反射器偏移量
            - roughness: 地面粗糙度
            - metalness: 地面金属度

            【贴图参数】
            - map / normalMap / distortionMap / roughnessMap:
              分别为漫反射贴图、法线贴图、扭曲贴图、粗糙度贴图
            - useDiffuseMap / useNormalMap / useDistortionMap / useRoughnessMap:
              控制是否启用对应贴图的布尔开关
        -->
        <MeshReflectionMaterial
            :resolution="1024"
            :mix="mix.value"
            :blur-mix-smooth="blurMixSmooth.value"
            :blur-mix-rough="blurMixRough.value"
            :blur-depth-edge-min="blurDepthEdgeMin.value"
            :blur-depth-edge-max="blurDepthEdgeMax.value"
            :blur-depth-bias="blurDepthBias.value"
            :blur-depth-scale="blurDepthScale.value"
            :blur-size="[blurWidth.value, blurHeight.value]"
            :sharp-mix="sharpMix.value"
            :sharp-depth-edge-min="sharpDepthEdgeMin.value"
            :sharp-depth-edge-max="sharpDepthEdgeMax.value"
            :sharp-depth-scale="sharpDepthScale.value"
            :sharp-depth-bias="sharpDepthBias.value"
            :distortion="distortion.value"
            :reflector-offset="reflectorOffset.value"
            :roughness="roughness.value"
            :metalness="metalness.value"
            :map="useDiffuseMap.value ? diffuseMap : undefined"
            :normal-map="useNormalMap.value ? normalMap : undefined"
            :distortion-map="useDistortionMap.value ? distortionMap : undefined"
            :roughness-map="useRoughnessMap.value ? roughnessMap : undefined"
        />
    </TresMesh>
</template>

<script setup>
/**
 * useTexture: @tresjs/core 提供的组合式函数
 *             用于异步加载纹理贴图，返回 Promise 解析后的 THREE.Texture 对象
 *
 * MeshReflectionMaterial: @tresjs/cientos 提供的高性能反射材质组件
 *
 * useControls: @tresjs/leches 提供的组合式函数
 *              用于注册可调节的参数到调试面板
 *
 * reflectGroundConfig: 从配置文件导入的地面反射参数定义对象
 *                      包含所有可用于调节的参数及其范围
 */
import { useTexture } from '@tresjs/core'
import { MeshReflectionMaterial } from '@tresjs/cientos'
import { useControls } from '@tresjs/leches'
import {reflectGroundConfig} from '@/config.js'
import '@tresjs/leches/styles'

/**
 * 'fpsgraph': 开启 FPS 帧率监控图表
 */
useControls('fpsgraph')

/**
 * useControls(reflectGroundConfig):
 * 将 reflectGroundConfig 对象中的所有参数注册到调试面板
 * 返回值解构：每个参数都变成响应式的 .value 访问形式
 */
const {
  mix,                          // 反射混合比例
  sharpMix,                     // 清晰反射混合
  sharpDepthScale,              // 清晰反射深度缩放
  sharpDepthBias,               // 清晰反射深度偏移
  sharpDepthEdgeMin,            // 清晰反射深度边缘最小值
  sharpDepthEdgeMax,            // 清晰反射深度边缘最大值
  blurMixSmooth,                // 模糊反射平滑混合
  blurMixRough,                 // 模糊反射粗糙混合
  blurDepthScale,               // 模糊反射深度缩放
  blurDepthBias,                // 模糊反射深度偏移
  blurDepthEdgeMin,             // 模糊反射深度边缘最小值
  blurDepthEdgeMax,             // 模糊反射深度边缘最大值
  blurWidth,                    // 模糊反射宽度
  blurHeight,                   // 模糊反射高度
  distortion,                   // 反射扭曲程度
  reflectorOffset,              // 反射器偏移量
  roughness,                    // 地面粗糙度
  metalness,                    // 地面金属度
  useDiffuseMap,                // 是否使用漫反射贴图
  useRoughnessMap,              // 是否使用粗糙度贴图
  useNormalMap,                 // 是否使用法线贴图
  useDistortionMap,             // 是否使用扭曲贴图
} = useControls(reflectGroundConfig)

/**
 * PATH: 纹理贴图的基础路径
 */
const PATH = '/src/assets/images/'

/**
 * useTexture: 异步加载多个纹理贴图
 * 参数：纹理文件路径数组
 * 返回值：对应顺序的 THREE.Texture 对象数组
 *
 * 加载的贴图：
 * - floorRoughness.jpg: 粗糙度贴图，控制地面的粗糙程度
 * - floorNormal.jpg: 法线贴图，增加地面凹凸细节
 * - floorDisplacement.png: 置换贴图，用于地形起伏
 * - floorDiffuse.jpg: 漫反射贴图，地面基础颜色纹理
 */
const [roughnessMap, normalMap, distortionMap, diffuseMap]
  = await useTexture(['floorRoughness.jpg', 'floorNormal.jpg', 'floorDisplacement.png', 'floorDiffuse.jpg'].map(p => PATH + p))
</script>

<style scoped></style>
