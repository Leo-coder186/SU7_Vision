/**
 * @Description: config.js 全局配置文件
 *              定义地面反射效果的各项参数配置
 *              用于 @tresjs/leches 调试面板的动态参数绑定
 *
 * @Author: your name
 * @version:
 * @Date: 2024-12-25 11:39:08
 * @LastEditors: your name
 * @LastEditTime: 2024-12-25 11:39:08
 */

/**
 * reflectGroundConfig: 反射地面材质参数配置对象
 *
 * 该对象被 @tresjs/leches 的 useControls 函数使用
 * useControls 会自动根据对象的结构创建对应的 GUI 控件
 *
 * 参数结构说明：
 * - value: 当前参数值
 * - min/max: 参数的最小/最大范围
 * - step: 滑块调节的步进值
 * - label: 可选的 GUI 显示标签
 *
 * 【清晰反射参数（Sharp Reflection）】
 * 清晰反射是指高质量的镜面反射，适合近距离观察
 *
 * 【模糊反射参数（Blur Reflection）】
 * 模糊反射是经过采样平均的柔和反射，适合远距离或粗糙表面
 */

/**
 * mix: 反射与原始地面的混合比例
 * 1.0 = 完全反射，0.0 = 无反射
 */
export const reflectGroundConfig = {
  mix: { value: 1, min: 0, max: 1, step: 0.01 },

  // ==================== 清晰反射参数 ====================

  /**
   * sharpMix: 清晰反射的混合强度
   * 控制清晰反射与模糊反射之间的混合
   */
  sharpMix: { value: 1, min: 0, max: 1, step: 0.01 },

  /**
   * sharpDepthScale: 清晰反射深度缩放
   * 影响反射中深度感知的效果
   */
  sharpDepthScale: { value: 1.0, min: 0, max: 10, step: 0.1 },

  /**
   * sharpDepthBias: 清晰反射深度偏移
   * 用于微调反射与地面的贴合程度
   */
  sharpDepthBias: {
    label: "shrp-bias",  // GUI 面板显示的标签
    value: 0.0,
    min: 0.0,
    max: 1,
    step: 0.01,
  },

  /**
   * sharpDepthEdgeMin: 清晰反射深度边缘最小值
   * 控制反射在近距离时的边缘过渡
   */
  sharpDepthEdgeMin: {
    label: "shrp-min",
    value: 0.0,
    min: 0.0,
    max: 1,
    step: 0.01,
  },

  /**
   * sharpDepthEdgeMax: 清晰反射深度边缘最大值
   * 控制反射在远距离时的边缘过渡
   */
  sharpDepthEdgeMax: {
    label: "shrp-max",
    value: 0.2,
    min: 0.01,
    max: 1,
    step: 0.01,
  },

  // ==================== 模糊反射参数 ====================

  /**
   * blurMixSmooth: 模糊反射平滑混合系数
   */
  blurMixSmooth: { value: 1.0, min: 0, max: 1, step: 0.01 },

  /**
   * blurMixRough: 模糊反射粗糙混合系数
   */
  blurMixRough: { value: 0.0, min: 0, max: 1, step: 0.01 },

  /**
   * blurDepthScale: 模糊反射深度缩放
   */
  blurDepthScale: { value: 1, min: 0, max: 10, step: 0.1 },

  /**
   * blurDepthBias: 模糊反射深度偏移
   */
  blurDepthBias: {
    label: "blur-bias",
    value: 0.0,
    min: 0.0,
    max: 1,
    step: 0.01,
  },

  /**
   * blurDepthEdgeMin: 模糊反射深度边缘最小值
   */
  blurDepthEdgeMin: {
    label: "blur-min",
    value: 0.0,
    min: 0.0,
    max: 1,
    step: 0.01,
  },

  /**
   * blurDepthEdgeMax: 模糊反射深度边缘最大值
   */
  blurDepthEdgeMax: {
    label: "blur-max",
    value: 0.2,
    min: 0.01,
    max: 1,
    step: 0.01,
  },

  /**
   * blurWidth: 模糊反射采样宽度
   * 影响模糊反射的采样范围和质量
   */
  blurWidth: { value: 300, min: 0, max: 500, step: 1 },

  /**
   * blurHeight: 模糊反射采样高度
   */
  blurHeight: { value: 100, min: 0, max: 500, step: 1 },

  // ==================== 基础材质参数 ====================

  /**
   * distortion: 反射扭曲程度
   * 值越大，反射看起来越扭曲
   */
  distortion: { value: 0.2, min: 0.01, max: 1, step: 0.01 },

  /**
   * reflectorOffset: 反射器偏移量
   * 微调反射平面与地面的相对位置
   */
  reflectorOffset: { value: 0.0, min: -5, max: 5, step: 0.01 },

  /**
   * roughness: 地面粗糙度
   * 0 = 完全光滑（完美镜面反射）
   * 1 = 完全粗糙（完全漫反射）
   */
  roughness: { value: 1.0, min: 0, max: 1, step: 0.01 },

  /**
   * metalness: 地面金属度
   * 0 = 非金属，1 = 纯金属
   */
  metalness: { value: 0.0, min: 0.0, max: 1, step: 0.01 },

  // ==================== 贴图开关 ====================

  /**
   * useDiffuseMap: 是否使用漫反射贴图
   * true = 使用 floorDiffuse.jpg 作为地面纹理
   */
  useDiffuseMap: true,

  /**
   * useRoughnessMap: 是否使用粗糙度贴图
   * true = 使用 floorRoughness.jpg 控制表面粗糙度
   */
  useRoughnessMap: true,

  /**
   * useNormalMap: 是否使用法线贴图
   * true = 使用 floorNormal.jpg 增加表面凹凸细节
   */
  useNormalMap: true,

  /**
   * useDistortionMap: 是否使用扭曲贴图
   * true = 使用 floorDisplacement.png 产生地面起伏效果
   */
  useDistortionMap: true,
};

/**
 * envConfig: 环境光照配置对象
 *
 * 用于 @tresjs/leches 调试面板控制环境贴图参数
 */
export const envConfig = {
  /**
   * blur: 环境贴图模糊程度
   * 影响环境光照的柔和度
   */
  blur: { value: 0, min: 0, max: 1, step: 0.01 },

  /**
   * preset: 环境贴图预设
   * 不同场景适合不同的环境光照
   * 可选值：city（城市）、dawn（黎明）、forest（森林）、lobby（大堂）、
   *        night（夜晚）、park（公园）、studio（工作室）、sunset（日落）、warehouse（仓库）
   */
  preset: {
    value: 'city',
    options: ['city', 'dawn', 'forest', 'lobby', 'night', 'park', 'studio', 'sunset', 'warehouse']
  },
};
