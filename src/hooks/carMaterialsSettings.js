/**
 * @Description: carMaterialsSettings 车型材质参数配置文件
 *              定义汽车各部件的默认材质参数
 *
 * 材质类型说明：
 * - 车身材质（Car_body）: 金属漆面，高金属度、低粗糙度
 * - 车窗材质（Car_window）: 玻璃材质，低金属度、极低粗糙度、半透明
 * - 轮胎材质（M_Wheel_ALL）: 橡胶材质，无金属度、高粗糙度
 * - 车灯材质（Car_frontlight）: 发光灯罩，中等金属度、低粗糙度
 *
 * 每个材质对象包含：
 * - folderName: 在 GUI 面板中显示的文件夹名称
 * - typeName: 匹配模型中网格的名称（用于定位目标材质）
 * - color: 基础颜色（十六进制格式）
 * - metalness: 金属度（0-1），表示材质的金属特性
 * - roughness: 粗糙度（0-1），0 表示完全光滑有反射，1 表示完全粗糙无反射
 * - opacity: 透明度（0-1），1 表示完全不透明
 */

/**
 * carPaint: 车身材质配置
 * 海湾蓝车漆效果，带有金属光泽
 */
export const carPaint = {
    folderName: '车身材质',     // GUI 文件夹名称
    typeName: 'Car_body',      // 匹配模型中名称包含 'Car_body' 的网格
    color: '#46b6d2',          // 海湾蓝颜色
    metalness: 0.4,            // 高金属度，模拟金属漆面
    roughness: 0.1,             // 低粗糙度，表面光滑有反射
    opacity: 1.0               // 完全不透明
}

/**
 * carGlass: 车窗玻璃材质配置
 * 半透明的蓝色玻璃效果
 */
export const carGlass = {
    folderName: '车窗材质',     // GUI 文件夹名称
    typeName: 'Car_window',    // 匹配模型中名称包含 'Car_window' 的网格
    color: '#88ccff',          // 淡蓝色玻璃
    metalness: 0.1,            // 低金属度
    roughness: 0.05,           // 极低粗糙度，非常光滑
    opacity: 0.3               // 30% 透明度，半透明玻璃效果
}

/**
 * carTire: 轮胎橡胶材质配置
 * 黑色的橡胶材质，无金属光泽
 */
export const carTire = {
    folderName: '轮胎材质',     // GUI 文件夹名称
    typeName: 'M_Wheel_ALL',   // 匹配模型中名称包含 'M_Wheel_ALL' 的网格
    color: '#333333',          // 深灰色/黑色
    metalness: 0.0,            // 无金属度，纯橡胶
    roughness: 0.9,            // 高粗糙度，橡胶表面纹理感
    opacity: 1.0               // 完全不透明
}

/**
 * carLight: 车灯发光材质配置
 * 白色发光效果，用于前大灯
 */
export const carLight = {
    folderName: '车灯材质',     // GUI 文件夹名称
    typeName: 'Car_frontlight', // 匹配模型中名称包含 'Car_frontlight' 的网格
    color: '#ffffff',          // 白色
    metalness: 0.5,            // 中等金属度
    roughness: 0.1,             // 低粗糙度，光滑表面
    opacity: 1.0               // 完全不透明（发光材质通常不需要透明）
}
