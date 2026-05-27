/**
 * @Description: catSettings 车型材质调试配置
 *              定义用于调试的材质参数预设值
 *              包含车漆、车窗、座椅等部位的默认材质配置
 *
 * 注意：这是旧版的配置，目前主要使用 carMaterialsSettings.js 中的配置
 * 此文件可能是早期调试用的配置文件，保留作为参考
 */

// 调试车漆参数
// 车身材质的默认配置，包含颜色、金属度、粗糙度等
export const paintObj = {
    color: 0x4fc1f1,         // 浅蓝色（十六进制颜色值）
    metalness: 0.33,         // 33% 金属度
    roughness: 0.7,           // 70% 粗糙度（较粗糙的表面）
    reflectivity: 0.7,        // 反射率 70%（非标准 PBR 参数，可能是预留）
    typeName: "Car_body.004", // 匹配模型中的材质名称
    folderName: '车漆参数'     // GUI 文件夹显示名称
};

// 调试车窗参数
// 车窗玻璃的默认配置
export const windowObj = {
    color: 0x5A5A60FF,       // 蓝灰色玻璃
    metalness: 0.15,         // 15% 金属度
    roughness: 0.15,         // 15% 粗糙度（光滑表面）
    typeName: "Car_window.004", // 匹配模型中的材质名称
    folderName: '车窗参数'      // GUI 文件夹显示名称
};

// 调试座椅参数
// 内饰座椅的默认配置
export const chairObj = {
    color: 0x5A5A60FF,       // 蓝灰色（与车窗相似）
    metalness: 0.15,         // 15% 金属度
    roughness: 0.15,         // 15% 粗糙度
    typeName: "interior4.005", // 匹配模型中的材质名称
    folderName: '座椅参数'      // GUI 文件夹显示名称
};
