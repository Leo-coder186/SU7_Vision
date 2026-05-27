/**
 * @Description: eventBus 事件总线模块
 *              使用 mitt 库实现的一个简单事件发布/订阅系统
 *              用于在 Vue 组件之间进行跨组件通信
 *
 * 为什么需要事件总线：
 * - Vue 3 推荐使用 props 和 emit 进行父子组件通信
 * - 但对于非父子关系的组件（如 ViewController 和 CarModel）之间的通信
 * - 使用事件总线更加方便，不需要层层传递
 *
 * 使用方式：
 *   // 发送事件
 *   eventBus.emit('事件名称', 数据)
 *
 *   // 监听事件
 *   eventBus.on('事件名称', (数据) => { ... })
 *
 *   // 取消监听
 *   eventBus.off('事件名称', 回调函数)
 */

import mitt from "mitt";

/**
 * 创建 mitt 实例
 *
 * mitt 是一个轻量级的事件总线库（不到 200 行代码）
 * 支持以下方法：
 * - on: 注册事件监听器
 * - off: 移除事件监听器
 * - emit: 触发事件
 * - all: 获取所有已注册的事件
 */
const eventBus = mitt();

/**
 * 默认导出事件总线实例
 * 组件中使用方式：
 *   import eventBus from '@/utils/eventBus'
 *   eventBus.on('changeCarLight', (value) => { ... })
 */
export default eventBus;
