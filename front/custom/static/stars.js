// Настройка сцены, камеры и рендера
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('starfield') });
renderer.setSize(window.innerWidth, window.innerHeight);

// Создание звезд
const stars = new THREE.Geometry();
for (let i = 0; i < 1000; i++) {
    const star = new THREE.Vector3(
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000
    );
    stars.vertices.push(star);
}

const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
const starField = new THREE.Points(stars, starMaterial);
scene.add(starField);

// Позиция камеры
camera.position.z = 5;

// Движение мыши
let mouseX = 0, mouseY = 0;

document.addEventListener("mousemove", (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = (event.clientY / window.innerHeight) * 2 - 1;
});

// Анимация
function animate() {
    requestAnimationFrame(animate);

    starField.rotation.x += 0.001;
    starField.rotation.y += 0.001;

    // Реакция на движение мыши
    starField.rotation.x += (mouseY - starField.rotation.x) * 0.05;
    starField.rotation.y += (mouseX - starField.rotation.y) * 0.05;

    renderer.render(scene, camera);
}

animate();

// Обновление размеров экрана
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
