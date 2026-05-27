<!--
 * @Description: ViewController 视图控制面板组件
 *              提供车灯开关、尺寸显示、高速穿梭、车辆启动等交互功能按钮
 *              固定显示在屏幕右侧中部区域
-->
<template>
    <!--
        按钮容器 ul#toggleStatus:
        - 保持毛玻璃效果，去除了硬编码的 bottom 限制，使用 translateY 居中，容纳 4 个按钮更完美
    -->
    <ul id="toggleStatus">
        <!-- 第一个按钮：开启/关闭车灯 -->
        <li style="--i:1" @click="openCarLight">
            <img src="/src/assets/images/车灯.png" width="40" height="40" alt="车灯">
            <div class="ruler">开启车灯</div>
        </li>

        <!-- 分隔线 1 -->
        <p class="panel-line"></p>

        <!-- 第二个按钮：显示/隐藏车身尺寸标注 -->
        <li style="--i:2" @click="changeSizeDisplay">
            <img src="/src/assets/images/尺寸.png" width="40" height="40" alt="尺寸">
            <div class="ruler">车身尺寸</div>
        </li>

        <!-- 分隔线 2 -->
        <p class="panel-line"></p>

        <!-- 
            【新增功能】第三个按钮：开启/关闭高速穿梭效果
            - style="--i:3" 顺延序列延迟
        -->
        <li style="--i:3" @click="toggleSpeedTunnel">
            <!-- 
                【关键修复 1】：为切换的图标添加唯一的 :key 属性。
                强制让 Vue 把它当作全新元素渲染，解决切换状态时不生效、不刷新、动画卡死的问题！
            -->
            <img 
                :key="isTunnelMoving ? 'tunnel-active' : 'tunnel-inactive'"
                :src="isTunnelMoving ? '/src/assets/images/stop.png' : '/src/assets/images/start.png'" 
                width="40" 
                height="40" 
                alt="时空穿梭"
                :class="{ 'neon-pulse': isTunnelMoving }"
            >
            <div class="ruler" :class="{ 'text-active': isTunnelMoving }">
                {{ isTunnelMoving ? '停止穿梭' : '时空穿梭' }}
            </div>
        </li>

        <!-- 分隔线 3 -->
        <p class="panel-line"></p>

        <!-- 
            第四个按钮：一键启动/停止车辆
            - 修复后递增到 --i:4 确保进场淡入动画完美衔接
        -->
        <li style="--i:4" @click="startEngine">
            <!-- 【关键修复 2】：同样为一键启动图片和文字加上唯一的 key -->
            <img 
                :key="isStart ? 'engine-active' : 'engine-inactive'"
                :src="isStart ? '/src/assets/images/stop.png' : '/src/assets/images/start.png'" 
                width="40" 
                height="40" 
                alt="一键启动"
            >
            <div class="ruler">{{ isStart ? '停止车辆' : '一键启动' }}</div>
        </li>
    </ul>
</template>

<script setup>
import { ref } from 'vue'
import eventBus from '@/utils/eventBus';

const isStart = ref(false)
const carLight = ref(false)
const carSize = ref(false)

// 【新增状态】：高速穿梭控制状态
const isTunnelMoving = ref(false)

const openCarLight = () => {
    carLight.value = !carLight.value
    eventBus.emit('changeCarLight', carLight.value)
}

const changeSizeDisplay = () => {
    carSize.value = !carSize.value
    eventBus.emit('changeCarSize', carSize.value)
}

// 【新增方法】：一键触发时空穿梭，并通过总线传给场景
const toggleSpeedTunnel = () => {
    isTunnelMoving.value = !isTunnelMoving.value
    console.log('[ViewController] 发送 changeTunnelMotion 事件, value:', isTunnelMoving.value)
    eventBus.emit('changeTunnelMotion', isTunnelMoving.value)
}

const startEngine = () => {
    isStart.value = !isStart.value
    eventBus.emit('changeCarStart', isStart.value)
}
</script>

<style scoped>
#toggleStatus {
    position: fixed;
    list-style: none;
    right: 60px;
    width: 120px;
    /* 【关键修复 3】：从固定 23% 改为 top 50% 并配合负平移，保证按钮变多后依然在右侧居中，不会沉到底部以外 */
    top: 75%;
    transform: translateY(-50%);
    padding: 20px 0;
    border-radius: 16px;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 10;
}

/* 将 id 选择器改为更通用的类选择器，确保多条分隔线统一渲染 */
.panel-line {
    width: 80%;
    height: 1px;
    margin: 8px auto;
    background: linear-gradient(90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.5) 50%,
            rgba(255, 255, 255, 0) 100%);
}

.ruler {
    margin-top: 8px;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    font-family: 'PingFang SC', sans-serif;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
}

#toggleStatus li {
    padding: 12px 8px;
    text-align: center;
    margin: 5px 0;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    /* 暂时可以关闭 overflow: hidden，防止子元素动画缩放时边缘被硬生生切断 */
    /* overflow: hidden; */
    
    /* 进场动画 */
    animation: fadeIn 0.5s ease forwards;
    animation-delay: calc(var(--i) * 0.1s);
    opacity: 0; /* 配合淡入，防止闪烁 */
}

#toggleStatus li:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.1);
}

#toggleStatus li:hover .ruler,
.text-active {
    color: #00ffff !important;
}

#toggleStatus li img {
    transition: all 0.3s ease;
    filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.5));
}

#toggleStatus li:hover img {
    transform: scale(1.1);
}

/* 高速穿梭激活时的荧光绿呼吸灯特效 */
.neon-pulse {
    filter: drop-shadow(0 0 12px #00E5FF) !important;
    animation: pulseGlow 1.5s infinite alternate;
}

@keyframes pulseGlow {
    from { transform: scale(1); filter: drop-shadow(0 0 8px #00E5FF); }
    to { transform: scale(1.08); filter: drop-shadow(0 0 18px #00FFFF); }
}

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
</style>