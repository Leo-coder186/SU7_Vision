<!--
 * @Description: CarView.vue 汽车展示页面主组件
 *              整合所有 3D 场景组件，构建完整的汽车展示应用
 *
 * 包含功能：
 * - 加载过渡动画
 * - 3D 渲染画布
 * - 相机和控制器
 * - 光照和环境
 * - 汽车模型和交互
 *
 * @Author: your name
 * @version:
 * @Date: 2024-12-16 09:08:44
 * @LastEditors: your name
 * @LastEditTime: 2024-12-25 10:07:02
-->
<template>
    <!--
        加载组件：isLoading 为 true 时显示
        @onComplete 是加载完成事件，加载完成时触发 onComplete 函数
    -->
    <Loading @onComplete="onComplete" v-if="isLoading"/>

    <!--
        视图控制面板：
        提供车灯开关、尺寸显示、启动车辆等交互按钮
        固定显示在屏幕右侧
    -->
    <ViewController/>

    <!--
        TresCanvas: TresJS 的 3D 渲染画布组件
        - clear-color: 画布背景色（#050505 深黑色）
        - window-size: 使画布自动适配窗口大小变化
    -->
    <!-- preset 就是 toneMapping 的实现，用于色调映射 -->
    <TresCanvas clear-color="#050505" window-size>
        <!--
            TresPerspectiveCamera: 透视相机组件
            - position: 相机位置 [x, y, z]
            - fov: 视场角度 60 度
            - far: 远裁切面距离
            - look-at: 相机注视的目标点
            - ref="camera": 获取相机组件实例
        -->
        <TresPerspectiveCamera
            :position="[0, 2, 10]"
            :fov="60"
            :far="100000"
            :look-at="lookAtTarget"
            ref="camera"
        />

        <!--
            OrbitControls: 轨道控制器组件（来自 @tresjs/cientos）
            允许用户通过鼠标拖拽旋转、滚轮缩放、右键平移 3D 场景
            - ref="controls": 获取控制器实例
            - target: 旋转/缩放的中心点
        -->
        <OrbitControls ref="controls" :target="lookAtTarget" />

        <!--
            TresAxesHelper: 坐标轴辅助线组件
            在场景中显示 XYZ 三轴，帮助开发者调试
            - size: 坐标轴长度
        -->
        <TresAxesHelper :size="1000"></TresAxesHelper>

        <!--
            Lights: 光照系统组件
            包含环境光、直射光、半球光、聚光灯
        -->
        <Lights/>

        <!--
            Env: 环境光照组件
            使用 HDR 全景图提供基于图像的光照
        -->
        <Env/>

        <!--
            渲染循环组件：负责每帧更新 TWEEN 动画
            必须放在 TresCanvas 内部才能使用 useLoop
        -->
        <TweenUpdater />

        <!--
            Suspense: 异步组件边界
            CarModel 是异步加载的组件，需要 Suspense 包裹
            这样可以在加载过程中显示加载状态
        -->
        <Suspense>
            <CarModel @camera-ready="handleCameraReady" />
        </Suspense>
    </TresCanvas>
</template>

<script setup>
/**
 * 引入的组件和模块说明：
 *
 * TresCanvas: @tresjs/core 的核心组件，创建 3D 渲染画布
 * OrbitControls: @tresjs/cientos 的相机控制器，支持旋转缩放
 * ViewController: 视图控制面板组件
 * Lights: 光照组件
 * Env: 环境光照组件
 * CarModel: 汽车模型组件
 * Loading: 加载过渡组件
 * ref: Vue 3 响应式引用
 * flyTo: 相机平滑移动工具函数
 * Vector3: Three.js 三维向量类
 * TWEEN: 补间动画库
 */

/**
 * 从 @tresjs/core 导入画布和渲染循环相关的组件和函数
 */
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { useLoop } from '@tresjs/core'

/**
 * 导入应用内部组件
 */
import Lights from '../components/Lights.vue';
import Env from '../components/Env.vue';
import CarModel from '../components/CarModel.vue';
import ViewController from '../components/ViewController.vue';
import Loading from '../components/Loading.vue';
import { h, defineComponent, ref } from 'vue'
import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'

/**
 * TweenUpdater: 渲染循环更新组件
 * 负责在每帧渲染前更新 TWEEN 动画
 * 必须放在 TresCanvas 内部才能使用 useLoop
 */
const TweenUpdater = defineComponent({
    setup() {
        const { onBeforeRender } = useLoop()
        onBeforeRender(() => {
            TWEEN.update()
        })
        return () => null
    }
})

/**
 * camera: 相机的响应式引用
 * 用于获取相机实例并执行相机动画
 */
const camera = ref(null)

/**
 * isLoading: 控制加载组件的显示状态
 * true = 显示加载界面，false = 隐藏加载界面
 */
const isLoading = ref(true)

/**
 * controls: 轨道控制器的响应式引用
 * 用于动态启用/禁用控制器
 */
const controls = ref(null)

/**
 * lookAtTarget: 相机注视的目标点
 * Vector3(0, 0, 0) 表示原点
 */
const lookAtTarget = new THREE.Vector3(0, 0, 0)

/**
 * handleCameraReady: 相机准备就绪的回调
 * 当 CarModel 组件通知相机准备好后，触发开场动画
 */
const handleCameraReady = () => {
    // 延迟一下确保相机已经完全准备好
    setTimeout(() => {
        startIntroAnimation()
    }, 100)
}

/**
 * startIntroAnimation: 开始开场动画
 * 相机从远处飞入到最佳观赏位置
 */
const startIntroAnimation = async () => {
    // 禁用控制器
    if (controls.value) {
        controls.value.enabled = false
        controls.value.autoRotate = false
    }

    /**
     * 获取相机的实际 THREE.Camera 实例
     */
    const actualCamera = camera.value?.camera || camera.value?.instance || camera.value

    if (!actualCamera) {
        console.warn('Camera not ready')
        return
    }

    /**
     * 动态导入 flyTo 函数
     */
    const { flyTo } = await import('../utils/index.js')

    /**
     * flyTo: 相机平滑移动动画
     * 参数：
     * - actualCamera: 要移动的相机
     * - new Vector3(3, 3, 3): 目标位置（汽车斜上方 45 度角）
     * - 4000: 动画时长 4 秒
     * - onComplete 回调: 动画完成后启用控制器
     */
    flyTo(actualCamera, new THREE.Vector3(3, 3, 3), 4000, () => {
        if (controls.value) {
            controls.value.enabled = true
        }
    })
}

/**
 * onComplete: 加载完成回调函数
 *
 * 功能：
 * 1. 隐藏加载界面
 * 2. 不再在这里做开场动画，交给 handleCameraReady
 */
const onComplete = () => {
    // 隐藏加载界面
    isLoading.value = false
}
</script>

<style></style>
