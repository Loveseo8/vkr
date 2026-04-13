const { exhibitions } = window.VirtualExpoData;

let scene;
let camera;
let renderer;
let raycaster;
let tooltipEl;
let progressBarEl;
let hoverTarget = null;
let currentIndex = 0;
let currentModalExhibition = null;
let scrollProgress = 0;
let introVisible = true;

const mouse = new THREE.Vector2();
const cameraLookTarget = new THREE.Vector3(0, 2, 10);
const corridorObjects = [];

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function findCorridorGroup(object) {
    let current = object;
    while (current) {
        if (current.userData && current.userData.exhibition) {
            return current;
        }
        current = current.parent;
    }
    return null;
}

function initThreeJS() {
    const canvas = document.getElementById('canvas');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8e1d7);
    scene.fog = new THREE.Fog(0xe8e1d7, 18, 170);

    camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 400);
    camera.position.set(0, 1.8, -14);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.74;
    renderer.shadowMap.enabled = true;

    raycaster = new THREE.Raycaster();

    buildLights();
    buildCorridor();
    renderNavigation();
    setupTooltip();
    setupIntroOverlay();
    updatePanel(exhibitions[0]);

    progressBarEl = document.getElementById('gallery-progress-bar');

    bindEvents();
    animate();
}

function buildLights() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.46));

    const hemisphere = new THREE.HemisphereLight(0xfffbf4, 0x8b7f6d, 0.68);
    scene.add(hemisphere);

    const keyLight = new THREE.DirectionalLight(0xfff7ea, 1.28);
    keyLight.position.set(-10, 22, -10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);
}

function buildCorridor() {
    const textureLoader = new THREE.TextureLoader();

    const floorColorMap = textureLoader.load('public/textures/polyhaven/herringbone_parquet_diff_2k.jpg');
    const floorRoughMap = textureLoader.load('public/textures/polyhaven/herringbone_parquet_rough_2k.jpg');
    const floorNormalMap = textureLoader.load('public/textures/polyhaven/herringbone_parquet_nor_gl_2k.jpg');

    [floorColorMap, floorRoughMap, floorNormalMap].forEach((texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2.4, 8.4);
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    });

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(82, 230),
        new THREE.MeshStandardMaterial({
            map: floorColorMap,
            roughnessMap: floorRoughMap,
            normalMap: floorNormalMap,
            normalScale: new THREE.Vector2(0.32, 0.32),
            roughness: 0.58,
            metalness: 0.02,
            color: 0xe9dcc7
        })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 12);
    floor.receiveShadow = true;
    scene.add(floor);

    const wallColorMap = textureLoader.load('public/textures/polyhaven/beige_wall_001_diff_2k.jpg');
    const wallNormalMap = textureLoader.load('public/textures/polyhaven/beige_wall_001_nor_gl_2k.jpg');
    const wallRoughMap = textureLoader.load('public/textures/polyhaven/beige_wall_001_rough_2k.jpg');

    [wallColorMap, wallNormalMap, wallRoughMap].forEach((texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2.4, 1.2);
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    });

    const wallMaterial = new THREE.MeshStandardMaterial({
        map: wallColorMap,
        normalMap: wallNormalMap,
        roughnessMap: wallRoughMap,
        normalScale: new THREE.Vector2(0.12, 0.12),
        roughness: 0.86,
        metalness: 0,
        color: 0xf2ebdf
    });

    const wallGeometry = new THREE.PlaneGeometry(144, 8.5);

    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.position.set(-6.8, 3.6, 12);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.position.set(6.8, 3.6, 12);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    const ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(82, 230),
        new THREE.MeshStandardMaterial({ color: 0xf6f0e6, roughness: 0.92 })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 7.2, 12);
    scene.add(ceiling);

    const backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(14, 8.5),
        new THREE.MeshStandardMaterial({ color: 0xe7e0d5, roughness: 0.9 })
    );
    backWall.position.set(0, 3.6, -8);
    scene.add(backWall);

    const spacing = 7;
    const startZ = -2;

    exhibitions.forEach((exhibition, index) => {
        const z = startZ + index * spacing + 10;
        const side = index % 2 === 0 ? 'right' : 'left';
        const group = createFrameGroup(exhibition, index, z, side, textureLoader);
        scene.add(group);
        corridorObjects.push(group);

        const spotLight = new THREE.SpotLight(exhibition.accent, index === currentIndex ? 1.2 : 0.92, 22, Math.PI / 7, 0.4, 1);
        spotLight.position.set(side === 'right' ? 3.25 : -3.25, 5.4, z);
        spotLight.target.position.set(side === 'right' ? 6.15 : -6.15, 2.6, z);
        spotLight.castShadow = index === 2;
        scene.add(spotLight);
        scene.add(spotLight.target);
    });
}

function createFrameGroup(exhibition, index, z, side, textureLoader) {
    const group = new THREE.Group();
    const isRight = side === 'right';
    const x = isRight ? 6.15 : -6.15;
    const frameRotation = isRight ? -Math.PI / 2 : Math.PI / 2;

    const coverTexture = textureLoader.load(exhibition.coverImage);

    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(3.8, 2.55, 0.22),
        [
            new THREE.MeshPhongMaterial({ color: 0x1f2129 }),
            new THREE.MeshPhongMaterial({ color: 0x1f2129 }),
            new THREE.MeshPhongMaterial({ color: 0x1f2129 }),
            new THREE.MeshPhongMaterial({ color: 0x1f2129 }),
            new THREE.MeshPhongMaterial({ map: coverTexture }),
            new THREE.MeshPhongMaterial({ color: 0x060606 })
        ]
    );
    frame.castShadow = true;
    frame.receiveShadow = true;
    group.add(frame);

    group.position.set(x, 2.65, z);
    group.rotation.y = frameRotation;
    group.userData.exhibition = exhibition;
    group.userData.index = index;
    group.userData.frame = frame;
    group.userData.originalY = group.position.y;

    if (index === 2) {
        group.scale.set(1.17, 1.17, 1.05);
    }

    return group;
}

function bindEvents() {
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('wheel', onScroll, { passive: false });
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('keydown', onKeyDown);

    let touchStartY = null;

    window.addEventListener('touchstart', (event) => {
        if (event.touches.length === 1) {
            touchStartY = event.touches[0].clientY;
        }
    }, { passive: true });

    window.addEventListener('touchmove', (event) => {
        if (introVisible || touchStartY == null) {
            return;
        }
        const deltaY = event.touches[0].clientY - touchStartY;
        scrollProgress = clamp(scrollProgress - deltaY * 0.001, 0, 1);
        touchStartY = event.touches[0].clientY;
    }, { passive: true });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onScroll(event) {
    if (introVisible) {
        return;
    }
    event.preventDefault();
    scrollProgress = clamp(scrollProgress + event.deltaY * 0.00065, 0, 1);
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(corridorObjects, true);
    const hovered = hits.find((hit) => findCorridorGroup(hit.object));
    hoverTarget = hovered ? findCorridorGroup(hovered.object) : null;

    if (hoverTarget) {
        document.body.style.cursor = 'pointer';
        showTooltip(hoverTarget.userData.exhibition, event.clientX, event.clientY);
    } else {
        document.body.style.cursor = 'default';
        hideTooltip();
    }
}

function onDocumentClick(event) {
    if (event.target.closest('.modal-card')) {
        return;
    }

    if (event.target.closest('#intro-overlay') || event.target.id === 'intro-start-btn') {
        hideIntroOverlay();
        return;
    }

    if (hoverTarget) {
        showExhibitionModal(hoverTarget.userData.exhibition);
    }
}

function onKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        scrollProgress = clamp(scrollProgress + 0.08, 0, 1);
    }
    if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        scrollProgress = clamp(scrollProgress - 0.08, 0, 1);
    }
    if (event.key === 'Enter' && !document.getElementById('exhibition-modal').classList.contains('active')) {
        showExhibitionModal(exhibitions[currentIndex]);
    }
    if (event.key === 'Escape') {
        closeModal();
    }
}

function renderNavigation() {
    const nav = document.getElementById('nav-menu');
    nav.innerHTML = exhibitions.map((item, index) => `
        <button class="nav-item ${index === 0 ? 'active' : ''}" data-number="${String(index + 1).padStart(2, '0')}" data-index="${index}">
            ${item.title}
        </button>
    `).join('');

    nav.querySelectorAll('.nav-item').forEach((button) => {
        button.addEventListener('click', () => {
            selectExhibition(Number(button.dataset.index));
        });
    });
}

function selectExhibition(index) {
    const frame = corridorObjects[index];
    if (!frame) {
        return;
    }

    const spacing = 7;
    const minZ = -14;
    const maxZ = (-2 + (exhibitions.length - 1) * spacing) + 16;
    const desiredCamZ = frame.position.z - 7;

    scrollProgress = clamp((desiredCamZ - minZ) / (maxZ - minZ), 0, 1);
    setActiveExhibition(index);
}

function setActiveExhibition(index) {
    currentIndex = index;
    updatePanel(exhibitions[index]);

    document.querySelectorAll('.nav-item').forEach((button, buttonIndex) => {
        button.classList.toggle('active', buttonIndex === index);
    });
}

function updatePanel(exhibition) {
    document.getElementById('panel-title').textContent = exhibition.title;
    document.getElementById('panel-description').textContent = exhibition.description;
    document.getElementById('panel-subtitle').textContent = exhibition.subtitle;
    document.getElementById('panel-curator').textContent = exhibition.curator;
    document.getElementById('panel-duration').textContent = exhibition.duration;
    document.getElementById('panel-pieces').textContent = `${exhibition.pieces} работ`;

    const tags = document.getElementById('panel-tags');
    tags.innerHTML = exhibition.highlights.map((item) => `<span class="tag">${item}</span>`).join('');
}

function showExhibitionModal(exhibition) {
    currentModalExhibition = exhibition;

    document.getElementById('modal-cover').src = exhibition.coverImage;
    document.getElementById('modal-cover').alt = exhibition.title;
    document.getElementById('modal-emoji').textContent = exhibition.emoji;
    document.getElementById('modal-title').textContent = exhibition.title;
    document.getElementById('modal-subtitle').textContent = exhibition.subtitle;
    document.getElementById('modal-description').textContent = exhibition.description;
    document.getElementById('modal-org').textContent = exhibition.organization;
    document.getElementById('modal-curator').textContent = exhibition.curator;
    document.getElementById('modal-duration').textContent = exhibition.duration;
    document.getElementById('modal-pieces').textContent = `${exhibition.exhibits.length} объектов в зале`;

    const tags = document.getElementById('modal-tags');
    tags.innerHTML = exhibition.highlights.map((item) => `<span class="tag tag-dark">${item}</span>`).join('');

    document.getElementById('exhibition-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('exhibition-modal').classList.remove('active');
    currentModalExhibition = null;
}

function goToExhibitionFromModal() {
    if (currentModalExhibition) {
        window.location.href = currentModalExhibition.url;
    }
}

function scrollScene() {
    if (introVisible) {
        hideIntroOverlay();
    }
    scrollProgress = clamp(scrollProgress + 0.12, 0, 1);
}

function setupTooltip() {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'floating-tooltip';
    document.body.appendChild(tooltipEl);
}

function showTooltip(exhibition, x, y) {
    tooltipEl.innerHTML = `<strong>${exhibition.title}</strong><span>${exhibition.organization}</span>`;
    tooltipEl.style.left = `${x + 18}px`;
    tooltipEl.style.top = `${y + 18}px`;
    tooltipEl.classList.add('visible');
}

function hideTooltip() {
    tooltipEl.classList.remove('visible');
}

function setupIntroOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'intro-overlay';
    overlay.className = 'intro-overlay';
    overlay.innerHTML = `
        <div class="intro-card">
            <div class="intro-badge">VirtualExpo</div>
            <h2>Вход в виртуальную галерею</h2>
            <p>
                Здесь пользователь сначала выбирает выставку прямо на картинах в коридоре,
                а затем переходит в отдельный 3D-зал, где можно изучать изображения, скульптуры
                и медиаданные каждого объекта.
            </p>
            <ul class="intro-list">
                <li>Колесо мыши или свайп двигают вас по коридору.</li>
                <li>Наведение подсвечивает выбранную выставку.</li>
                <li>Клик открывает карточку и ведет в зал.</li>
            </ul>
            <button id="intro-start-btn" class="primary-button">Войти в коридор</button>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('intro-start-btn').addEventListener('click', hideIntroOverlay);
}

function hideIntroOverlay() {
    const overlay = document.getElementById('intro-overlay');
    if (!overlay) {
        return;
    }
    overlay.classList.add('hidden');
    introVisible = false;
}

function animate() {
    requestAnimationFrame(animate);

    corridorObjects.forEach((group, index) => {
        const pulse = Math.sin(Date.now() * 0.001 + index) * 0.06;
        group.position.y = group.userData.originalY + pulse;

        const selected = index === currentIndex;
        group.userData.frame.scale.setScalar(selected ? 1.05 : 1);
    });

    const spacing = 7;
    const maxZ = (-2 + (exhibitions.length - 1) * spacing) + 16;
    const camStartZ = -14;
    const camZ = camStartZ + scrollProgress * (maxZ - camStartZ);

    const parallaxX = mouse.x * 0.85;
    const parallaxY = mouse.y * 0.22;
    const targetPosition = new THREE.Vector3(parallaxX, 1.85, camZ);
    camera.position.lerp(targetPosition, 0.1);

    const lookAhead = new THREE.Vector3(0, 2.15 + parallaxY, camZ + 8);
    cameraLookTarget.lerp(lookAhead, 0.12);
    camera.lookAt(cameraLookTarget);

    autoSelectNearestExhibition();
    updateProgress();
    renderer.render(scene, camera);
}

function autoSelectNearestExhibition() {
    const cameraZ = camera.position.z + 6;
    let closestIndex = 0;
    let closestDistance = Infinity;

    corridorObjects.forEach((item, index) => {
        const distance = Math.abs(item.position.z - cameraZ);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
        }
    });

    if (closestIndex !== currentIndex) {
        setActiveExhibition(closestIndex);
    }
}

function updateProgress() {
    if (progressBarEl) {
        progressBarEl.style.width = `${(scrollProgress * 100).toFixed(0)}%`;
    }
}

document.getElementById('exhibition-modal').addEventListener('click', (event) => {
    if (event.target.id === 'exhibition-modal') {
        closeModal();
    }
});

window.addEventListener('load', initThreeJS);
