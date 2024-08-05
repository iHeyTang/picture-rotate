import * as THREE from "three";
import CLOTH_URL from "./assets/cloth.jpg";

const IMAGE_URL =
  "https://cdn.shopify.com/s/files/1/0741/5129/7333/files/exam-test.jpg";

// 是否自动旋转
let isRotating = true;

// 监听空格来控制是否自动旋转
window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    isRotating = !isRotating;
  }
});

// 获取画布元素
const canvas = document.getElementById("canvas");
if (!canvas) throw Error("Canvas not found");

// 创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.z = 40;

// 创建渲染器
const renderer = new THREE.WebGLRenderer({
  canvas: canvas as HTMLCanvasElement,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xaaaaaa);

// 加载纹理
const textureLoader = new THREE.TextureLoader();
textureLoader.load(IMAGE_URL, (imageTexture) => {
  textureLoader.load(CLOTH_URL, (clothTexture) => {
    // 创建一个新的画布
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.width = imageTexture.image.width;
    canvas.height = imageTexture.image.height;

    // 绘制图片纹理到画布
    context.drawImage(imageTexture.image, 0, 0);

    // 设置棉布纹理的透明度
    context.globalAlpha = 0.4; // 你可以根据需要调整透明度

    // 绘制棉布纹理到画布
    context.drawImage(clothTexture.image, 0, 0, canvas.width, canvas.height);

    // 创建新的纹理
    const combinedTexture = new THREE.CanvasTexture(canvas);

    // 图片的宽高，单位是px
    const height = imageTexture.image.height;
    const width = imageTexture.image.width;

    // 转换系数
    const ratio = getRatio(width, 17);
    // 盒子的尺寸，边宽和背部预留
    const boxSide = 1.25 * ratio;
    const backReserve = 0.25 * ratio;
    const boxWidth = width - 2 * boxSide - 2 * backReserve;
    const boxHeight = height - 2 * boxSide - 2 * backReserve;

    const front = combinedTexture.clone();
    front.offset.set(
      (boxSide + backReserve) / width,
      (boxSide + backReserve) / height
    );
    front.repeat.set(boxWidth / width, boxHeight / height);

    const left = combinedTexture.clone();
    left.offset.set(backReserve / width, (boxSide + backReserve) / height);
    left.repeat.set(boxSide / width, boxHeight / height);

    const right = combinedTexture.clone();
    right.offset.set(
      (width - boxSide - backReserve) / width,
      (boxSide + backReserve) / height
    );
    right.repeat.set(boxSide / width, boxHeight / height);

    const top = combinedTexture.clone();
    top.offset.set((boxSide + backReserve) / width, backReserve / height);
    top.repeat.set(boxWidth / width, boxSide / height);

    const bottom = combinedTexture.clone();
    bottom.offset.set(
      (boxSide + backReserve) / width,
      (height - boxSide - backReserve) / height
    );
    bottom.repeat.set(boxWidth / width, boxSide / height);

    // 创建包含纹理的材质
    const frontMaterial = new THREE.MeshBasicMaterial({ map: front });
    frontMaterial.map!.colorSpace = THREE.DisplayP3ColorSpace;
    const leftMaterial = new THREE.MeshBasicMaterial({ map: left });
    leftMaterial.map!.colorSpace = THREE.DisplayP3ColorSpace;
    const rightMaterial = new THREE.MeshBasicMaterial({ map: right });
    rightMaterial.map!.colorSpace = THREE.DisplayP3ColorSpace;
    const bottomMaterial = new THREE.MeshBasicMaterial({ map: top });
    bottomMaterial.map!.colorSpace = THREE.DisplayP3ColorSpace;
    const topMaterial = new THREE.MeshBasicMaterial({ map: bottom });
    topMaterial.map!.colorSpace = THREE.DisplayP3ColorSpace;

    const backMaterial = new THREE.MeshBasicMaterial({ color: 0x00aa00 }); // 背面的材质

    // 创建盒子几何体
    const geometry = new THREE.BoxGeometry(17, 14.2, 1.25); // 你可以根据图片的比例调整几何体的尺寸

    // 创建网格并添加到场景中
    const materials = [
      rightMaterial, // 左侧
      leftMaterial, // 右侧
      topMaterial, // 顶部
      bottomMaterial, // 底部
      frontMaterial, // 前面
      backMaterial, // 后面
    ];
    const box = new THREE.Mesh(geometry, materials);
    // 旋转盒子，使其侧面朝向相机
    box.rotation.y = Math.PI / 7; // 旋转90度

    scene.add(box);

    // 渲染场景
    function animate() {
      requestAnimationFrame(animate);
      if (isRotating) box.rotation.y += 0.01; // 每次渲染时增加一个小的角度值
      renderer.render(scene, camera);
    }
    animate();
  });
});

/**
 * 需求给到单位是英寸而不是像素，英寸和像素无法直接转换（取决于电脑屏幕DPI以及尺寸不同），需要通过像素密度来计算一个比例来作为转换系数
 * 以width作为参考，计算出转换系数
 */
function getRatio(pxWidth: number, inchWidth: number): number {
  return pxWidth / inchWidth;
}
