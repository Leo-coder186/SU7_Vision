/**
 * @Description: TweenAni 补间动画工具模块
 *              封装 @tweenjs/tween.js 库，提供常用的动画函数
 *
 * 支持的动画类型：
 * - TweenColorChange: 颜色渐变动画
 * - TweenBiling: 物体闪烁/缩放动画
 * - TweenScale: 物体缩放动画
 * - TweenMove: 物体位置移动动画
 * - TweenFadeInOut: 物体透明度淡入淡出动画
 */

import * as TWEEN from '@tweenjs/tween.js'
import * as THREE from 'three'

/**
 * TweenColorChange: 颜色过渡动画
 *
 * @param {THREE.Color} primColor - 初始颜色对象（会被动画修改）
 * @param {THREE.Color} color - 目标颜色对象
 * @returns {TWEEN.Tween} - 创建的补间动画对象
 *
 * 使用示例：
 *   const colorObj = new THREE.Color('#ff0000');
 *   TweenColorChange(colorObj, new THREE.Color('#00ff00'));
 *   // colorObj 会从红色渐变到绿色
 *
 * 参数说明：
 * - to(color, 600): 在 600 毫秒内过渡到目标颜色
 * - easing(TWEEN.Easing.Linear.None): 使用线性缓动（匀速变化）
 */
export function TweenColorChange(primColor, color) {
    return new TWEEN.Tween(primColor)
        .to(color, 600)  // 600ms 过渡时间
        .easing(TWEEN.Easing.Linear.None)  // 线性缓动
        .start()
}

/**
 * TweenBiling: 物体闪烁/缩放动画
 *
 * @param {THREE.Object3D} obj - 要添加动画的 3D 对象（需要支持 scale 属性）
 * @param {Number} value - 目标缩放值
 * @returns {TWEEN.Tween} - 创建的补间动画对象
 *
 * 使用示例：
 *   TweenBiling(sprite, 0.4);
 *   // sprite 的 scale 会在 0.4 和当前值之间不断往返变化
 *
 * 参数说明：
 * - to({ x: value, y: value, z: value }, 600): 600ms 内缩放到目标值
 * - yoyo(true): 启用往复模式（动画到达目标后会反向播放回来）
 * - repeat(Infinity): 无限重复
 * - start(): 开始动画
 */
export function TweenBiling(obj, value) {
    return new TWEEN.Tween(obj.scale)
        .to({ x: value, y: value, z: value }, 600)  // 缩放到目标值
        .yoyo(true)  // 启用往复模式
        .repeat(Infinity)  // 无限循环
        .start()
}

/**
 * TweenScale: 物体缩放动画
 *
 * @param {THREE.Object3D} obj - 要添加动画的 3D 对象
 * @param {boolean} isRervese - 是否反向（恢复到原始大小）
 * @returns {TWEEN.Tween} - 创建的补间动画对象
 *
 * 使用示例：
 *   // 放大到 1.4 倍
 *   TweenScale(mesh, false);
 *   // 缩小回原始大小
 *   TweenScale(mesh, true);
 *
 * 参数说明：
 * - isRerverse === true: 缩放到 (1, 1, 1) 原始大小
 * - isRerverse === false: 缩放到 (1.4, 1.4, 1.4) 放大状态
 * - easing(TWEEN.Easing.Quadratic.InOut): 二次方缓动（开始和结束慢，中间快）
 * - repeat(false): 不重复，动画只播放一次
 */
export function TweenScale(obj, isRervese) {
    // 根据 isRervese 决定目标缩放值
    const to = isRervese ? { x: 1, y: 1, z: 1 } : { x: 1.4, y: 1.4, z: 1.4 }
    return new TWEEN.Tween(obj.scale)
        .easing(TWEEN.Easing.Quadratic.InOut)  // 二次方缓动
        .to(to, 200)  // 200ms 动画时长
        .repeat(0)  // 不重复
        .start()
}

/**
 * TweenMove: 物体位置移动动画
 *
 * @param {THREE.Object3D} obj - 要添加动画的 3D 对象
 * @param {THREE.Vector3} value - 目标位置坐标
 * @returns {TWEEN.Tween} - 创建的补间动画对象
 *
 * 使用示例：
 *   const targetPos = new THREE.Vector3(10, 0, 5);
 *   TweenMove(sprite, targetPos);
 *   // sprite 会在 2800ms 内平滑移动到目标位置
 *
 * 参数说明：
 * - to({ x: value.x, y: value.y, z: value.z }, 2800): 2800ms 内移动到目标位置
 */
export function TweenMove(obj, value) {
    return new TWEEN.Tween(obj.position)
        .to({ x: value.x, y: value.y, z: value.z }, 2800)  // 2.8s 移动时间
        .start()
}

/**
 * TweenFadeInOut: 物体透明度淡入淡出动画
 *
 * @param {THREE.Mesh} mesh - 要添加动画的网格对象（需要支持 material.opacity）
 * @param {Number} value - 目标透明度值（0-1）
 * @returns {TWEEN.Tween} - 创建的补间动画对象
 *
 * 使用示例：
 *   // 淡入（显示）
 *   TweenFadeInOut(mesh, 1);
 *   // 淡出（隐藏）
 *   TweenFadeInOut(mesh, 0);
 *
 * 参数说明：
 * - to({ opacity: value }, 600): 600ms 内过渡到目标透明度
 * - easing(TWEEN.Easing.Linear.None): 线性缓动（匀速变化）
 *
 * 注意：
 * - 要求 mesh.material.transparent = true
 * - 要求 mesh.material.opacity 可读写
 */
export function TweenFadeInOut(mesh, value) {
    return new TWEEN.Tween(mesh.material)
        .to({ opacity: value }, 600)  // 600ms 过渡时间
        .easing(TWEEN.Easing.Linear.None)  // 线性缓动
        .start()
}
