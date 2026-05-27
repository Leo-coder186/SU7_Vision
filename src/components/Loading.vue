<!--
 * @Description: Loading 加载过渡组件
 *              在 3D 模型和资源加载过程中显示加载进度界面
 *              加载完成后通过 emit 触发关闭事件
 * @Author: your name
 * @version:
 * @Date: 2024-12-16 09:08:48
 * @LastEditors: your name
 * @LastEditTime: 2025-01-09 09:06:10
-->
<template>
    <!--
        加载界面根容器：
        - position: absolute 相对于父容器绝对定位
        - display: flex 弹性布局
        - justify-content: center 水平居中
        - align-items: center 垂直居中
        - 覆盖整个视口（100vw x 100vh）
        - z-index: 100 确保在最顶层
    -->
    <div class="loading" ref="loading">
        <!-- 背景 Logo 区域（进度条容器） -->
        <div class="bgLogo">
            <!-- 进度条元素，实际进度通过 CSS width 控制 -->
            <div class="progress" ref="progress"></div>
        </div>

        <!-- 加载信息容器：包含文字、进度条、百分比数字 -->
        <div class="loading-container">
            <!-- 当前加载项名称（如 "model assets"、"img assets"） -->
            <div class="loading-text">{{ loadingItem }}</div>

            <!-- 进度条外框 -->
            <div class="progress-bar">
                <!-- 进度条填充，根据 percentage 动态设置宽度 -->
                <div class="progress-fill" :style="{ width: percentage + '%' }"></div>
            </div>

            <!-- 百分比数字显示 -->
            <div class="percentage">{{ percentage }}%</div>
        </div>
    </div>
</template>

<script setup>
/**
 * ref: Vue 3 组合式 API，用于创建响应式引用
 * lodash: JavaScript 工具库，这里使用 _.endsWith 判断文件扩展名
 * DefaultLoadingManager: Three.js 的全局加载管理器
 *                       用于监听所有 THREE.TextureLoader、GLTFLoader 等的加载进度
 */
import { ref } from 'vue'
import _ from 'lodash'
import { DefaultLoadingManager } from 'three'

/**
 * defineEmits: Vue 3 宏函数，定义组件可以 emit 的事件
 * onComplete: 加载完成时触发的事件
 */
const emit = defineEmits(['onComplete'])

/**
 * loading: DOM 元素引用，用于访问加载界面容器
 */
const loading = ref(null)

/**
 * loadingItem: 当前正在加载的资源类型描述
 * 初始值 'model assets' 表示正在加载模型
 */
const loadingItem = ref('model assets')

/**
 * percentage: 加载进度百分比（0-100）
 */
const percentage = ref(0)

/**
 * saveLastTotalLoaded: 记录上一次的总加载量
 * 用于区分本次加载量和上次遗留的加载量
 */
let saveLastTotalLoaded = 0

/**
 * DefaultLoadingManager.onProgress: 加载进度回调
 * 每次单个资源加载完成时触发
 *
 * 参数：
 * - item: 当前加载的资源路径/名称
 * - loaded: 当前已加载的资源数量
 * - total: 当前加载队列中的总资源数量
 *
 * 逻辑：
 * 1. 根据文件扩展名判断资源类型（jpg/png 为图片，glb 为模型）
 * 2. 更新 loadingItem 显示当前加载类型
 * 3. 当 loaded === total 时，记录本次加载的总量
 * 4. 计算并更新 percentage（排除之前遗留的加载量）
 */
DefaultLoadingManager.onProgress = (item, loaded, total) => {
    // 判断是否为图片资源
    if (_.endsWith(item, 'jpg') || _.endsWith(item, 'png')) {
        loadingItem.value = 'img assets'
    }
    // 判断是否为模型资源
    else if (_.endsWith(item, 'glb')) {
        loadingItem.value = 'model assets'
    }

    // 记录本次加载周期的总量
    if (loaded === total) {
        saveLastTotalLoaded = total
    }

    /**
     * 计算百分比：
     * (loaded - saveLastTotalLoaded) / (total - saveLastTotalLoaded) * 100
     *
     * - loaded - saveLastTotalLoaded: 本次实际加载的数量
     * - total - saveLastTotalLoaded: 本次应该加载的总量
     * - Math.round() 四舍五入取整
     * - || 100 当结果为 0 时显示 100%
     */
    percentage.value = Math.round(((loaded - saveLastTotalLoaded) / (total - saveLastTotalLoaded)) * 100 || 100)
}

/**
 * DefaultLoadingManager.onLoad: 所有资源加载完成回调
 *
 * 逻辑：
 * 1. 设置 200ms 延迟，确保百分比已经显示到 100%
 * 2. 通过 emit('onComplete') 通知父组件加载完成
 * 3. 父组件收到事件后会隐藏 Loading 组件并显示 3D 场景
 */
DefaultLoadingManager.onLoad = () => {
    const timer = setTimeout(() => {
        emit('onComplete')
        window.clearTimeout(timer)
    }, 200)
}
</script>

<style scoped>
/**
 * .loading: 加载界面根容器样式
 *
 * 布局：
 * - position: absolute - 绝对定位
 * - display: flex - 弹性布局
 * - flex-direction: column - 垂直排列
 * - justify-content: center - 水平居中
 * - align-items: center - 垂直居中
 *
 * 尺寸与颜色：
 * - width: 100vw, height: 100vh - 全屏显示
 * - z-index: 100 - 最顶层
 * - background-color: #0a0a0a - 深黑色背景
 * - color: #fff - 白色文字
 */
.loading {
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    z-index: 100;
    background-color: #0a0a0a;
    color: #fff;
}

/**
 * .bgImg: 背景图片样式（已定义但可能未使用）
 * - position: fixed - 固定定位
 * - top: 50%, left: 50% - 居中
 * - transform: translate(-50%, -50%) - 精确居中偏移
 * - animation: rotation 20s linear infinite - 20秒旋转一圈
 * - z-index: -1 - 在其他内容下方
 * - opacity: 0.6 - 60%透明度
 * - filter - 色调旋转和亮度调整
 */
.bgImg {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: 20s linear 0s rotation infinite;
    z-index: -1;
    opacity: 0.6;
    filter: hue-rotate(45deg) brightness(0.8);
}

/**
 * .bgLogo: Logo/进度条容器样式
 * - overflow: hidden - 溢出隐藏
 * - width: 220px, height: 50px - 固定尺寸
 * - background-image - 使用 logo 图片作为背景
 * - background-size: cover - 图片填充
 * - margin-bottom: 40px - 下方间距
 * - filter - 亮度和对比度调整
 */
.bgLogo {
    overflow: hidden;
    width: 220px;
    height: 50px;
    background-image: url('../assets/images/logo.png');
    background-size: cover;
    margin-bottom: 40px;
    filter: brightness(0.9) contrast(1.2);
}

/**
 * .loading-container: 加载信息容器
 * - display: flex - 弹性布局
 * - flex-direction: column - 垂直排列
 * - align-items: center - 水平居中
 * - gap: 15px - 子元素间距
 */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

/**
 * .loading-text: 加载类型文字样式
 * - font-size: 18px - 字号
 * - color: #7ee787 - 绿色文字
 * - text-transform: uppercase - 全大写
 * - letter-spacing: 2px - 字符间距
 * - font-weight: 500 - 中等粗细
 * - text-shadow - 文字发光效果
 */
.loading-text {
    font-size: 18px;
    color: #7ee787;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: 500;
    text-shadow: 0 0 10px rgba(126, 231, 135, 0.5);
}

/**
 * .progress-bar: 进度条外框
 * - width: 300px - 宽度
 * - height: 4px - 高度
 * - background: 白色10%透明度 - 灰色底
 * - border-radius: 2px - 圆角
 * - overflow: hidden - 溢出隐藏
 * - position: relative - 相对定位（子元素绝对定位需要）
 */
.progress-bar {
    width: 300px;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    position: relative;
}

/**
 * .progress-fill: 进度条填充
 * - height: 100% - 填充整个高度
 * - background - 渐变绿色背景
 * - transition: width 0.3s ease - 宽度变化动画
 * - position: relative - 相对定位
 * - box-shadow - 发光效果
 */
.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #7ee787, #4CAF50);
    transition: width 0.3s ease;
    position: relative;
    box-shadow: 0 0 10px rgba(126, 231, 135, 0.5);
}

/**
 * .percentage: 百分比数字样式
 * - font-size: 24px - 字号
 * - color: #fff - 白色
 * - font-weight: 600 - 加粗
 * - text-shadow - 发光效果
 */
.percentage {
    font-size: 24px;
    color: #fff;
    font-weight: 600;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

/**
 * rotation: 背景旋转动画关键帧
 * - from: 0度
 * - to: 360度
 */
@keyframes rotation {
    from {
        transform: translate(-50%, -50%) rotate(0deg);
    }

    to {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}

/**
 * glow: 发光呼吸动画关键帧
 * - 0%: 微弱发光
 * - 50%: 强烈发光
 * - 100%: 微弱发光
 */
@keyframes glow {
    0% {
        box-shadow: 0 0 5px rgba(126, 231, 135, 0.5);
    }

    50% {
        box-shadow: 0 0 20px rgba(126, 231, 135, 0.8);
    }

    100% {
        box-shadow: 0 0 5px rgba(126, 231, 135, 0.5);
    }
}
</style>
