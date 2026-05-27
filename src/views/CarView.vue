<template>
    <Loading @onComplete="onComplete" v-if="isLoading"/>

    <ViewController/>

    <TresCanvas clear-color="#0077be" window-size>
        <TresPerspectiveCamera
            :position="[0, 2, 10]"
            :fov="60"
            :far="100000"
            ref="camera"
        />

        <OrbitControls 
            ref="controls" 
            :enabled="controlsEnabled"
            :target="lookAtTarget" 
        />

        <TresAxesHelper :size="1000"></TresAxesHelper>
        <Lights/>

        <Suspense>
            <Env/>
        </Suspense>

        <TweenUpdater />

        <Suspense>
            <CarModel @camera-ready="handleCameraReady" />
        </Suspense>

        <SpeedTunnle />
    </TresCanvas>
</template>

<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { useLoop } from '@tresjs/core'

import Lights from '../components/Lights.vue';
import Env from '../components/Env.vue';
import CarModel from '../components/CarModel.vue';
import ViewController from '../components/ViewController.vue';
import Loading from '../components/Loading.vue';
import SpeedTunnle from '../components/speedTunnle.vue';
import { h, defineComponent, ref } from 'vue'

import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'

const camera = ref(null)
const isLoading = ref(true)
const controls = ref(null)
const isIntroComplete = ref(false)

// 控制控制器启用的状态开关
const controlsEnabled = ref(false)
const lookAtTarget = new THREE.Vector3(0, 0, 0)

/**
 * 【关键修复 3 的实现】：
 * 在动画未完成时，我们在同一个渲染循环里，等 TWEEN 更新完位置后，
 * 手动强制让相机 lookAt 目标点，这样能确保绝对的同步，不会有任何抖动。
 */
const TweenUpdater = defineComponent({
    setup() {
        const { onBeforeRender } = useLoop()
        onBeforeRender(() => {
            // 1. 先更新 TWEEN 动画（飞入坐标）
            TWEEN.update()
            
            // 2. 如果动画还没结束，手动维持相机的视线盯着汽车，确保丝滑
            if (!isIntroComplete.value && camera.value) {
                const actualCamera = camera.value.camera || camera.value.instance || camera.value
                if (actualCamera && typeof actualCamera.lookAt === 'function') {
                    actualCamera.lookAt(lookAtTarget)
                }
            }
        })
        return () => null
    }
})

const handleCameraReady = () => {
    setTimeout(() => {
        startIntroAnimation()
    }, 100)
}

const startIntroAnimation = async () => {
    const actualCamera = camera.value?.camera || camera.value?.instance || camera.value

    if (!actualCamera) {
        console.warn('Camera not ready')
        return
    }

    // 动画开始，彻底禁用控制器
    controlsEnabled.value = false
    isIntroComplete.value = false

    // 动画前，先让相机看一眼目标，防止初始帧瞬移闪烁
    actualCamera.lookAt(lookAtTarget)

    const { flyTo } = await import('../utils/index.js')

    // 执行飞入
    flyTo(actualCamera, new THREE.Vector3(3, 3, 3), 4000, () => {
        // 动画安全结束
        isIntroComplete.value = true
        // 激活控制器，无缝接管
        controlsEnabled.value = true
    })
}

const onComplete = () => {
    isLoading.value = false
}
</script>