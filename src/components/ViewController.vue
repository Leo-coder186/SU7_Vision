<!--
 * @Description: ViewController 视图控制面板组件
 *              提供车灯开关、尺寸显示、车辆启动等交互功能按钮
 *              固定显示在屏幕右侧中部区域
 * @Author: your name
 * @version:
 * @Date: 2024-12-23 09:51:17
 * @LastEditors: your name
 * @LastEditTime: 2025-01-09 09:03:08
-->
<template>
    <!--
        按钮容器 ul#toggleStatus:
        - position: fixed 相对于视口固定定位
        - right: 60px 距离右侧 60px
        - bottom: 23% 距离底部 23%
        - 整体样式：毛玻璃效果黑色半透明背景，圆角设计
    -->
    <ul id="toggleStatus">
        <!--
            第一个按钮：开启/关闭车灯
            style="--i:1" 用于 CSS 动画延迟计算
            @click="openCarLight" 点击触发开灯逻辑
        -->
        <li style="--i:1" @click="openCarLight">
            <!-- 车灯图标 -->
            <img src="/src/assets/images/车灯.png" width="40" height="40" alt="">
            <!-- 按钮文字标签 -->
            <div class="ruler">开启车灯</div>
        </li>

        <!-- 分隔线 -->
        <p id="line"></p>

        <!--
            第二个按钮：显示/隐藏车身尺寸标注
            style="--i:2" 用于 CSS 动画延迟计算
            @click="changeSizeDisplay" 点击触发尺寸显示切换
        -->
        <li style="--i:2" @click="changeSizeDisplay">
            <!-- 尺寸图标 -->
            <img src="/src/assets/images/尺寸.png" width="40" height="40" alt="">
            <div class="ruler">车身尺寸</div>
        </li>

        <!-- 分隔线 -->
        <p id="line"></p>

        <!--
            第三个按钮：一键启动/停止车辆
            style="--i:3" 用于 CSS 动画延迟计算
            @click="startEngine" 点击触发启动/停止逻辑

            按钮状态切换：
            - !isStart 时显示启动图标（start.png）
            - isStart 时显示停止图标（stop.png）
        -->
        <li style="--i:3" @click="startEngine">
            <img v-if="!isStart" src="/src/assets/images/start.png" width="40" height="40" alt="">
            <img v-if="isStart" src="/src/assets/images/stop.png" width="40" height="40" alt="">
            <div class="ruler">一键启动</div>
        </li>
    </ul>
</template>

<script setup>
/**
 * ref: Vue 3 组合式 API，用于创建响应式引用变量
 * eventBus: 事件总线实例，用于向其他组件发送事件通知
 */
import { ref } from 'vue'
import eventBus from '@/utils/eventBus';

/**
 * isStart: 车辆启动状态
 * - false: 车辆停止状态
 * - true: 车辆启动状态
 */
const isStart = ref(false)

/**
 * carLight: 车灯开关状态
 * - false: 车灯关闭
 * - true: 车灯开启
 */
const carLight = ref(false)

/**
 * carSize: 尺寸显示状态
 * - false: 尺寸标注隐藏
 * - true: 尺寸标注显示
 */
const carSize = ref(false)

/**
 * openCarLight: 开启/关闭车灯的处理函数
 *
 * 实现逻辑：
 * 1. 取反车灯状态 carLight.value
 * 2. 通过 eventBus.emit 发送 'changeCarLight' 事件
 * 3. 事件携带参数：新的车灯状态值（true/false）
 *
 * 监听方（CarModel 组件）收到事件后会：
 * - true: 创建车灯点光源并添加到场景
 * - false: 从场景移除车灯光源并释放内存
 */
const openCarLight = () => {
    carLight.value = !carLight.value
    eventBus.emit('changeCarLight', carLight.value)
}

/**
 * startEngine: 一键启动/停止车辆的处理函数
 *
 * 实现逻辑：
 * 1. 取反启动状态 isStart.value
 * 2. 通过 eventBus.emit 发送 'changeCarStart' 事件
 * 3. 事件携带参数：新的启动状态值（true/false）
 *
 * 监听方（CarModel 组件）收到事件后会：
 * - true: 切换到移动地板，开始轮胎旋转动画
 * - false: 切换到静态地板，停止轮胎旋转动画
 */
const startEngine = () => {
    isStart.value = !isStart.value
    eventBus.emit('changeCarStart', isStart.value)
}

/**
 * changeSizeDisplay: 显示/隐藏车身尺寸标注的处理函数
 *
 * 实现逻辑：
 * 1. 取反尺寸显示状态 carSize.value
 * 2. 通过 eventBus.emit 发送 'changeCarSize' 事件
 * 3. 事件携带参数：新的显示状态值（true/false）
 *
 * 监听方（CarModel 组件）收到事件后会：
 * - true: 显示车身尺寸标注（通过透明度渐变动画）
 * - false: 隐藏车身尺寸标注
 */
const changeSizeDisplay = () => {
    carSize.value = !carSize.value
    eventBus.emit('changeCarSize', carSize.value)
}
</script>

<style scoped>
/**
 * #toggleStatus: 控制面板容器样式
 *
 * 布局与定位：
 * - position: fixed - 相对于浏览器窗口固定定位
 * - right: 60px - 距右侧 60px
 * - bottom: 23% - 距底部 23% 视口高度
 * - width: 120px - 面板宽度 120px
 * - padding: 15px 0 - 上下内边距 15px
 * - border-radius: 16px - 圆角 16px
 *
 * 视觉效果：
 * - background: rgba(0, 0, 0, 0.75) - 75%不透明度的黑色背景
 * - backdrop-filter: blur(10px) - 背景模糊毛玻璃效果
 * - box-shadow - 多层阴影增加立体感
 * - border: 1px solid rgba(...) - 细微白色边框
 * - z-index: 10 - 确保在 Canvas 上方显示
 */
#toggleStatus {
    position: fixed;
    list-style: none;
    right: 60px;
    width: 120px;
    bottom: 23%;
    padding: 15px 0;
    border-radius: 16px;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 10;
}

/**
 * #line: 分隔线样式
 * - width: 80% - 分隔线宽度为容器的 80%
 * - height: 1px - 分隔线高度 1 像素
 * - margin: 5px auto - 上下 5px 水平居中
 * - background - 渐变背景，从透明到白色再到透明
 */
#line {
    width: 80%;
    height: 1px;
    margin: 5px auto;
    background: linear-gradient(90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.5) 50%,
            rgba(255, 255, 255, 0) 100%);
}

/**
 * .ruler: 按钮下方文字标签样式
 * - margin-top: 8px - 与图标间距
 * - color: #fff - 白色文字
 * - font-size: 14px - 字号 14px
 * - font-weight: 500 - 中等粗细
 * - font-family - 字体系列
 * - text-shadow - 文字发光效果
 * - transition - 过渡动画
 */
.ruler {
    margin-top: 8px;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    font-family: 'PingFang SC', sans-serif;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
}

/**
 * #toggleStatus li: 列表项（按钮）样式
 * - padding: 12px 8px - 内边距
 * - text-align: center - 文字居中
 * - margin: 5px 0 - 上下间距
 * - cursor: pointer - 鼠标指针样式
 * - transition - 过渡动画
 * - position: relative - 相对定位
 * - overflow: hidden - 溢出隐藏
 */
#toggleStatus li {
    padding: 12px 8px;
    text-align: center;
    margin: 5px 0;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

/**
 * #toggleStatus li:hover: 按钮悬停状态
 * - transform: translateY(-2px) - 向上移动 2px
 * - background: rgba(255, 255, 255, 0.1) - 背景变亮
 */
#toggleStatus li:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.1);
}

/**
 * #toggleStatus li:hover .ruler: 悬停时文字变青色
 */
#toggleStatus li:hover .ruler {
    color: #00ffff;
}

/**
 * #toggleStatus li img: 图标样式
 * - transition - 过渡动画
 * - filter: drop-shadow - 发光效果
 */
#toggleStatus li img {
    transition: all 0.3s ease;
    filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.5));
}

/**
 * #toggleStatus li:hover img: 悬停时图标放大 1.1 倍
 */
#toggleStatus li:hover img {
    transform: scale(1.1);
}

/**
 * fadeIn: 淡入动画关键帧
 * - from: 初始状态（透明度0，右侧偏移20px）
 * - to: 结束状态（透明度1，正常位置）
 */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateX(20px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/**
 * #toggleStatus li: 应用淡入动画
 * - animation: fadeIn 0.5s ease forwards - 0.5秒动画
 * - animation-delay: calc(var(--i) * 0.1s) - 每个按钮延迟递增
 */
#toggleStatus li {
    animation: fadeIn 0.5s ease forwards;
    animation-delay: calc(var(--i) * 0.1s);
}
</style>
