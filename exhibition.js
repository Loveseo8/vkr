const {
    exhibitions: galleryExhibitions,
    getExhibitionById,
    getExhibitionFromPath
} = window.VirtualExpoData;

let galleryScene;
let galleryCamera;
let galleryRenderer;
let galleryRaycaster;
let galleryTooltip;
let galleryProgressBar;
let galleryDetailsEl;
let galleryDetailsBackdropEl;
let exhibitionData;
let selectedExhibitId = null;
let galleryHoverObject = null;
let galleryIntroVisible = true;
let galleryDetailsVisible = false;
let galleryScrollProgress = 0;
let exhibitGroups = [];

const galleryMouse = new THREE.Vector2();
const galleryLookTarget = new THREE.Vector3(0, 2, 6);

function galleryClamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function findExhibitGroup(object) {
    let current = object;
    while (current) {
        if (current.userData && current.userData.exhibit) {
            return current;
        }
        current = current.parent;
    }
    return null;
}

function resolveExhibition() {
    const explicitId = document.body.dataset.exhibitionId;
    return getExhibitionById(explicitId) || getExhibitionFromPath() || galleryExhibitions[0];
}

function initExhibition() {
    exhibitionData = resolveExhibition();

    if (!exhibitionData) {
        renderMissingExhibition();
        return;
    }

    applyTheme();
    fillSidebar();
    fillObjectList();
    mountTooltip();
    mountIntro();
    mountProgress();
    mountDetailsModal();
    initGalleryScene();
    bindGalleryEvents();

    selectExhibit(exhibitionData.exhibits[0].id, false);
    animateGallery();
}

function renderMissingExhibition() {
    const error = document.createElement('div');
    error.className = 'gallery-error';
    error.innerHTML = `
        <div class="gallery-error-card">
            <h1>Выставка не найдена</h1>
            <p>Страница была открыта без привязки к данным. Вернитесь в коридор и выберите выставку из списка.</p>
            <p><a class="gallery-breadcrumb" href="index.html">Вернуться в коридор</a></p>
        </div>
    `;
    document.body.appendChild(error);
}

function applyTheme() {
    document.title = `VirtualExpo - ${exhibitionData.title}`;
    document.documentElement.style.setProperty('--gallery-accent', exhibitionData.accent);
}

function fillSidebar() {
    document.getElementById('gallery-title').textContent = exhibitionData.title;
    document.getElementById('gallery-subtitle').textContent = exhibitionData.subtitle;
    document.getElementById('gallery-description').textContent = exhibitionData.description;
    document.getElementById('gallery-curator').textContent = exhibitionData.curator;
    document.getElementById('gallery-duration').textContent = exhibitionData.duration;
    document.getElementById('gallery-pieces').textContent = `${exhibitionData.pieces} позиций каталога`;
    document.getElementById('gallery-note').textContent = `В зале ${exhibitionData.exhibits.length} интерактивных объектов: есть изображения, 3D-формы и медиаданные.`;
    document.getElementById('gallery-hint').textContent = 'Наводите на экспонаты, чтобы увидеть отклик, и кликом открывайте карточку с медиа.';

    const tags = document.getElementById('gallery-tags');
    tags.innerHTML = exhibitionData.highlights.map((item) => `<span class="gallery-tag">${item}</span>`).join('');
}

function fillObjectList() {
    const objectList = document.getElementById('object-list');
    objectList.innerHTML = exhibitionData.exhibits.map((item) => `
        <button class="object-button" data-exhibit-id="${item.id}">
            <span class="object-title">${item.title}</span>
            <span class="object-meta">${item.author} · ${item.kind === 'sculpture' ? '3D-объект' : 'Изображение / медиа'}</span>
        </button>
    `).join('');

    objectList.querySelectorAll('.object-button').forEach((button) => {
        button.addEventListener('click', () => {
            selectExhibit(button.dataset.exhibitId, true);
        });
    });

    document.getElementById('focus-current').addEventListener('click', () => {
        const current = exhibitionData.exhibits.find((item) => item.id === selectedExhibitId);
        if (current) {
            focusExhibit(current);
        }
    });

    document.getElementById('next-object').addEventListener('click', focusNextExhibit);
}

function mountTooltip() {
    galleryTooltip = document.getElementById('gallery-tooltip');
}

function mountProgress() {
    galleryProgressBar = document.getElementById('gallery-progress-bar');
}

function mountDetailsModal() {
    galleryDetailsEl = document.querySelector('.gallery-details');
    galleryDetailsEl.innerHTML = `
        <button id="details-close-btn" class="details-close" type="button" aria-label="Закрыть карточку">×</button>
        <div class="gallery-details-grid">
            <div class="gallery-details-visual">
                <img id="details-preview" src="" alt="">
            </div>
            <div class="gallery-details-copy">
                <div class="details-header">
                    <div>
                        <div class="gallery-kicker">Экспонат</div>
                        <h3 id="details-title" class="details-title"></h3>
                    </div>
                    <div id="details-type" class="details-type"></div>
                </div>
                <div id="details-author" class="details-author"></div>
                <div id="details-medium" class="details-copy"></div>
                <p id="details-description" class="details-copy"></p>
                <div id="media-list" class="media-list"></div>
            </div>
        </div>
    `;
    galleryDetailsEl.setAttribute('aria-hidden', 'true');

    galleryDetailsBackdropEl = document.createElement('div');
    galleryDetailsBackdropEl.className = 'gallery-details-backdrop';
    document.querySelector('.gallery-ui').appendChild(galleryDetailsBackdropEl);

    galleryDetailsBackdropEl.addEventListener('click', closeGalleryDetails);
    document.getElementById('details-close-btn').addEventListener('click', closeGalleryDetails);
}

function mountIntro() {
    const intro = document.getElementById('gallery-intro');
    intro.innerHTML = `
        <div class="gallery-intro-card">
            <div class="gallery-kicker">Внутри выставки</div>
            <h2>${exhibitionData.title}</h2>
            <p>${exhibitionData.subtitle}</p>
            <ul>
                <li>Наведите курсор на экспонат, чтобы увидеть отклик, и кликните, чтобы открыть его карточку.</li>
                <li>Можно использовать список экспонатов внизу для быстрого перехода по залу.</li>
                <li>Карточка открывается поверх зала и показывает изображение, описание и медиаданные выбранной работы.</li>
            </ul>
            <button id="gallery-intro-btn" class="gallery-intro-btn">Открыть зал</button>
        </div>
    `;

    document.getElementById('gallery-intro-btn').addEventListener('click', () => {
        intro.classList.add('hidden');
        galleryIntroVisible = false;
    });
}

function initGalleryScene() {
    const canvas = document.getElementById('gallery-canvas');

    galleryScene = new THREE.Scene();
    galleryScene.background = new THREE.Color(exhibitionData.fogColor);
    galleryScene.fog = new THREE.Fog(exhibitionData.fogColor, 12, 96);

    galleryCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 220);
    galleryCamera.position.set(0, 1.85, -7);

    galleryRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    galleryRenderer.setSize(window.innerWidth, window.innerHeight);
    galleryRenderer.setPixelRatio(window.devicePixelRatio);
    galleryRenderer.outputColorSpace = THREE.SRGBColorSpace;
    galleryRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    galleryRenderer.toneMappingExposure = 0.7;
    galleryRenderer.shadowMap.enabled = true;

    galleryRaycaster = new THREE.Raycaster();

    buildGalleryLights();
    buildGalleryRoom();
    buildExhibits();
}

function buildGalleryLights() {
    galleryScene.add(new THREE.AmbientLight(0xffffff, 0.4));

    const hemi = new THREE.HemisphereLight(0xfffbf5, 0x6b6157, 0.58);
    galleryScene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff6e7, 0.98);
    keyLight.position.set(-8, 18, -8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    galleryScene.add(keyLight);
}

function buildGalleryRoom() {
    const textureLoader = new THREE.TextureLoader();
    const floorMap = textureLoader.load('public/textures/polyhaven/herringbone_parquet_diff_2k.jpg');
    const roughnessMap = textureLoader.load('public/textures/polyhaven/herringbone_parquet_rough_2k.jpg');
    const normalMap = textureLoader.load('public/textures/polyhaven/herringbone_parquet_nor_gl_2k.jpg');

    [floorMap, roughnessMap, normalMap].forEach((texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1.8, 5.8);
        texture.anisotropy = galleryRenderer.capabilities.getMaxAnisotropy();
    });

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 110),
        new THREE.MeshStandardMaterial({
            map: floorMap,
            roughnessMap,
            normalMap,
            normalScale: new THREE.Vector2(0.28, 0.28),
            roughness: 0.56,
            metalness: 0.02,
            color: 0xe6d8c2
        })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 15);
    floor.receiveShadow = true;
    galleryScene.add(floor);

    const wallTexture = textureLoader.load('public/textures/polyhaven/beige_wall_001_diff_2k.jpg');
    const wallNormalMap = textureLoader.load('public/textures/polyhaven/beige_wall_001_nor_gl_2k.jpg');
    const wallRoughMap = textureLoader.load('public/textures/polyhaven/beige_wall_001_rough_2k.jpg');

    [wallTexture, wallNormalMap, wallRoughMap].forEach((texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1.6, 1.2);
        texture.anisotropy = galleryRenderer.capabilities.getMaxAnisotropy();
    });

    const wallMaterial = new THREE.MeshStandardMaterial({
        map: wallTexture,
        normalMap: wallNormalMap,
        roughnessMap: wallRoughMap,
        normalScale: new THREE.Vector2(0.08, 0.08),
        roughness: 0.84,
        metalness: 0,
        color: 0xf1e7d9
    });

    const wallGeometry = new THREE.PlaneGeometry(70, 7.8);

    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.position.set(-5.9, 3.4, 15);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    galleryScene.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.position.set(5.9, 3.4, 15);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    galleryScene.add(rightWall);

    const ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 110),
        new THREE.MeshStandardMaterial({ color: 0xf7f1e7, roughness: 0.94 })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 6.9, 15);
    galleryScene.add(ceiling);

    const entranceWall = new THREE.Mesh(
        new THREE.PlaneGeometry(11.8, 7.8),
        new THREE.MeshStandardMaterial({ color: 0xe5ded1, roughness: 0.92 })
    );
    entranceWall.position.set(0, 3.4, -5.2);
    galleryScene.add(entranceWall);

    const sign = new THREE.Mesh(
        new THREE.BoxGeometry(3.8, 0.5, 0.08),
        new THREE.MeshStandardMaterial({ color: exhibitionData.accent, emissive: exhibitionData.accent, emissiveIntensity: 0.28 })
    );
    sign.position.set(0, 5.4, -5.12);
    galleryScene.add(sign);
}

function buildExhibits() {
    const textureLoader = new THREE.TextureLoader();
    const pedestalColorMap = textureLoader.load('public/textures/polyhaven/beige_wall_001_diff_2k.jpg');
    const pedestalNormalMap = textureLoader.load('public/textures/polyhaven/beige_wall_001_nor_gl_2k.jpg');
    const pedestalRoughMap = textureLoader.load('public/textures/polyhaven/beige_wall_001_rough_2k.jpg');

    [pedestalColorMap, pedestalNormalMap, pedestalRoughMap].forEach((texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1.4, 1.2);
        texture.anisotropy = galleryRenderer.capabilities.getMaxAnisotropy();
    });

    const pedestalMaterial = new THREE.MeshStandardMaterial({
        map: pedestalColorMap,
        normalMap: pedestalNormalMap,
        roughnessMap: pedestalRoughMap,
        normalScale: new THREE.Vector2(0.1, 0.1),
        roughness: 0.9,
        metalness: 0.02,
        color: 0xf0e6d8
    });

    exhibitGroups = exhibitionData.exhibits.map((item) => {
        const group = new THREE.Group();
        const room = item.room;
        const isRight = room.side === 'right';
        const isLeft = room.side === 'left';
        const baseX = isRight ? 5.25 : isLeft ? -5.25 : 0;
        const baseY = room.side === 'center' ? 0 : 2.45;
        const rotationY = isRight ? -Math.PI / 2 : isLeft ? Math.PI / 2 : 0;

        group.position.set(baseX, baseY, room.z);
        group.rotation.y = rotationY;
        group.userData.exhibit = item;
        group.userData.originalY = group.position.y;
        group.userData.hoverMix = 0;

        if (item.kind === 'image' || item.kind === 'lightbox') {
            const previewTexture = textureLoader.load(item.media.preview);
            const previewMaterial = new THREE.MeshPhongMaterial({
                map: previewTexture,
                emissive: item.kind === 'lightbox' ? new THREE.Color(exhibitionData.accent) : new THREE.Color(0x0b0b0f),
                emissiveIntensity: item.kind === 'lightbox' ? 0.18 : 0.03
            });
            const materials = [
                new THREE.MeshPhongMaterial({ color: 0x1f2129 }),
                new THREE.MeshPhongMaterial({ color: 0x1f2129 }),
                new THREE.MeshPhongMaterial({ color: 0x1f2129 }),
                new THREE.MeshPhongMaterial({ color: 0x1f2129 }),
                previewMaterial,
                new THREE.MeshPhongMaterial({ color: 0x050505 })
            ];

            const frame = new THREE.Mesh(
                new THREE.BoxGeometry(room.width || 2.8, room.height || 1.8, 0.18),
                materials
            );
            frame.castShadow = true;
            frame.receiveShadow = true;
            group.add(frame);

            group.userData.focusMesh = frame;
            group.userData.highlightMaterials = [previewMaterial];
        } else {
            const pedestal = new THREE.Mesh(
                new THREE.CylinderGeometry(0.9, 1.02, room.pedestalHeight || 1.05, 24),
                pedestalMaterial.clone()
            );
            pedestal.position.y = (room.pedestalHeight || 1.05) / 2;
            pedestal.receiveShadow = true;
            group.add(pedestal);

            const sculpture = createSculptureMesh(item.shape);
            sculpture.position.y = (room.pedestalHeight || 1.05) + 0.78;
            sculpture.castShadow = true;
            sculpture.receiveShadow = true;
            group.add(sculpture);
            group.userData.focusMesh = sculpture;
            group.userData.highlightMaterials = collectMeshMaterials(sculpture);
        }

        const baseSpotIntensity = item.kind === 'lightbox' ? 1.08 : 0.84;
        const spot = new THREE.SpotLight(exhibitionData.accent, baseSpotIntensity, 18, Math.PI / 7, 0.45, 1);
        spot.position.set(baseX === 0 ? 0 : baseX * 0.58, 5.4, room.z);
        spot.target.position.set(baseX, room.side === 'center' ? 1.8 : 2.3, room.z);
        galleryScene.add(spot);
        galleryScene.add(spot.target);
        group.userData.spotlight = spot;
        group.userData.baseSpotIntensity = baseSpotIntensity;

        galleryScene.add(group);
        return group;
    });
}

function collectMeshMaterials(root) {
    const materials = new Set();

    root.traverse((child) => {
        if (!child.isMesh) {
            return;
        }

        const childMaterials = Array.isArray(child.material) ? child.material : [child.material];
        childMaterials.forEach((material) => materials.add(material));
    });

    return Array.from(materials);
}

function createSculptureMesh(shape) {
    const material = new THREE.MeshStandardMaterial({
        color: exhibitionData.accent,
        emissive: exhibitionData.accent,
        emissiveIntensity: 0.04,
        roughness: 0.32,
        metalness: 0.18
    });

    switch (shape) {
        case 'torusKnot':
            return new THREE.Mesh(new THREE.TorusKnotGeometry(0.52, 0.16, 120, 18), material);
        case 'icosahedron':
            return new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 1), material);
        case 'capsule': {
            const capsule = new THREE.Group();
            const middle = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.9, 20), material);
            capsule.add(middle);

            const top = new THREE.Mesh(new THREE.SphereGeometry(0.36, 20, 20), material.clone());
            top.position.y = 0.45;
            capsule.add(top);

            const bottom = new THREE.Mesh(new THREE.SphereGeometry(0.36, 20, 20), material.clone());
            bottom.position.y = -0.45;
            capsule.add(bottom);

            return capsule;
        }
        case 'cluster': {
            const cluster = new THREE.Group();
            const geometry = new THREE.IcosahedronGeometry(0.28, 0);
            [-0.4, 0, 0.42].forEach((x, index) => {
                const child = new THREE.Mesh(geometry, material.clone());
                child.position.set(x, index === 1 ? 0.2 : -0.05, index === 2 ? 0.2 : 0);
                child.scale.setScalar(index === 1 ? 1.15 : 0.92);
                cluster.add(child);
            });
            return cluster;
        }
        case 'arch': {
            const arch = new THREE.Group();
            const legGeometry = new THREE.BoxGeometry(0.24, 1.25, 0.24);
            const topGeometry = new THREE.BoxGeometry(1.55, 0.24, 0.24);
            [-0.58, 0.58].forEach((x) => {
                const leg = new THREE.Mesh(legGeometry, material);
                leg.position.set(x, 0, 0);
                arch.add(leg);
            });
            const top = new THREE.Mesh(topGeometry, material);
            top.position.set(0, 0.64, 0);
            arch.add(top);
            return arch;
        }
        case 'monolith':
            return new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.6, 0.55), material);
        case 'ribbon': {
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(-0.6, -0.25, 0),
                new THREE.Vector3(-0.2, 0.4, 0.25),
                new THREE.Vector3(0.25, -0.1, -0.25),
                new THREE.Vector3(0.7, 0.55, 0)
            ]);
            return new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.08, 12, false), material);
        }
        case 'cityStack': {
            const city = new THREE.Group();
            [0.5, 0.9, 1.25].forEach((height, index) => {
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, height, 0.42), material.clone());
                mesh.position.set((index - 1) * 0.34, height / 2 - 0.4, index === 1 ? 0.18 : -0.12);
                city.add(mesh);
            });
            return city;
        }
        case 'garden': {
            const garden = new THREE.Group();
            const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 1.2), material);
            garden.add(base);
            [-0.28, 0, 0.28].forEach((x, index) => {
                const crown = new THREE.Mesh(new THREE.SphereGeometry(index === 1 ? 0.32 : 0.24, 20, 20), material.clone());
                crown.position.set(x, 0.36 + index * 0.06, index === 1 ? 0.08 : -0.08);
                garden.add(crown);
            });
            return garden;
        }
        default:
            return new THREE.Mesh(new THREE.SphereGeometry(0.68, 24, 24), material);
    }
}

function bindGalleryEvents() {
    window.addEventListener('resize', onGalleryResize);
    window.addEventListener('wheel', onGalleryScroll, { passive: false });
    window.addEventListener('mousemove', onGalleryMouseMove);
    document.addEventListener('click', onGalleryClick);
    document.addEventListener('keydown', onGalleryKeyDown);

    let touchStartY = null;

    window.addEventListener('touchstart', (event) => {
        if (event.touches.length === 1) {
            touchStartY = event.touches[0].clientY;
        }
    }, { passive: true });

    window.addEventListener('touchmove', (event) => {
        if (galleryIntroVisible || galleryDetailsVisible || touchStartY == null) {
            return;
        }
        const deltaY = event.touches[0].clientY - touchStartY;
        galleryScrollProgress = galleryClamp(galleryScrollProgress - deltaY * 0.0012, 0, 1);
        touchStartY = event.touches[0].clientY;
    }, { passive: true });
}

function onGalleryResize() {
    galleryCamera.aspect = window.innerWidth / window.innerHeight;
    galleryCamera.updateProjectionMatrix();
    galleryRenderer.setSize(window.innerWidth, window.innerHeight);
}

function onGalleryScroll(event) {
    if (galleryIntroVisible || galleryDetailsVisible) {
        return;
    }
    event.preventDefault();
    galleryScrollProgress = galleryClamp(galleryScrollProgress + event.deltaY * 0.0008, 0, 1);
}

function onGalleryMouseMove(event) {
    if (galleryDetailsVisible) {
        galleryHoverObject = null;
        document.body.style.cursor = 'default';
        hideGalleryTooltip();
        return;
    }

    galleryMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    galleryMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    galleryRaycaster.setFromCamera(galleryMouse, galleryCamera);
    const hits = galleryRaycaster.intersectObjects(exhibitGroups, true);
    const hovered = hits.find((hit) => findExhibitGroup(hit.object));
    galleryHoverObject = hovered ? findExhibitGroup(hovered.object) : null;

    if (galleryHoverObject) {
        document.body.style.cursor = 'pointer';
        showGalleryTooltip(galleryHoverObject.userData.exhibit, event.clientX, event.clientY);
    } else {
        document.body.style.cursor = 'default';
        hideGalleryTooltip();
    }
}

function onGalleryClick(event) {
    if (
        event.target.closest('.gallery-details') ||
        event.target.closest('.gallery-details-backdrop') ||
        event.target.closest('.gallery-footer') ||
        event.target.closest('.gallery-sidebar')
    ) {
        return;
    }

    if (event.target.closest('#gallery-intro') || event.target.id === 'gallery-intro-btn') {
        document.getElementById('gallery-intro').classList.add('hidden');
        galleryIntroVisible = false;
        return;
    }

    if (galleryHoverObject) {
        const exhibit = galleryHoverObject.userData.exhibit;
        selectExhibit(exhibit.id, false);
        openGalleryDetails(exhibit);
    }
}

function onGalleryKeyDown(event) {
    if (event.key === 'Escape' && galleryDetailsVisible) {
        closeGalleryDetails();
        return;
    }

    if (galleryDetailsVisible) {
        return;
    }

    if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        galleryScrollProgress = galleryClamp(galleryScrollProgress + 0.08, 0, 1);
    }
    if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        galleryScrollProgress = galleryClamp(galleryScrollProgress - 0.08, 0, 1);
    }
    if (event.key === 'Enter') {
        const current = getSelectedExhibit();
        if (current) {
            openGalleryDetails(current);
        }
    }
}

function selectExhibit(exhibitId, moveCamera) {
    selectedExhibitId = exhibitId;
    const exhibit = getExhibitById(exhibitId);
    if (!exhibit) {
        return;
    }

    updateObjectButtons(exhibitId);

    if (moveCamera) {
        focusExhibit(exhibit);
    }
}

function getExhibitById(exhibitId) {
    return exhibitionData.exhibits.find((item) => item.id === exhibitId);
}

function getSelectedExhibit() {
    return getExhibitById(selectedExhibitId);
}

function focusExhibit(exhibit) {
    const minZ = -7;
    const maxZ = getGalleryMaxZ();
    const desiredCameraZ = exhibit.room.z - 5.5;
    galleryScrollProgress = galleryClamp((desiredCameraZ - minZ) / (maxZ - minZ), 0, 1);
}

function focusNextExhibit() {
    const currentIndex = exhibitionData.exhibits.findIndex((item) => item.id === selectedExhibitId);
    const nextIndex = (currentIndex + 1) % exhibitionData.exhibits.length;
    const next = exhibitionData.exhibits[nextIndex];
    selectExhibit(next.id, true);
}

function updateObjectButtons(exhibitId) {
    document.querySelectorAll('.object-button').forEach((button) => {
        button.classList.toggle('active', button.dataset.exhibitId === exhibitId);
    });
}

function openGalleryDetails(exhibit) {
    updateDetails(exhibit);
    galleryDetailsVisible = true;
    galleryDetailsEl.classList.add('active');
    galleryDetailsBackdropEl.classList.add('active');
    galleryDetailsEl.setAttribute('aria-hidden', 'false');
    hideGalleryTooltip();
}

function closeGalleryDetails() {
    if (!galleryDetailsEl) {
        return;
    }

    galleryDetailsVisible = false;
    galleryDetailsEl.classList.remove('active');
    galleryDetailsBackdropEl.classList.remove('active');
    galleryDetailsEl.setAttribute('aria-hidden', 'true');
}

function updateDetails(exhibit) {
    document.getElementById('details-title').textContent = exhibit.title;
    document.getElementById('details-type').textContent = exhibit.kind === 'sculpture' ? '3D-объект' : 'Изображение / медиа';
    document.getElementById('details-preview').src = exhibit.media.preview;
    document.getElementById('details-preview').alt = exhibit.title;
    document.getElementById('details-author').textContent = `${exhibit.author}, ${exhibit.year}`;
    document.getElementById('details-medium').textContent = exhibit.medium;
    document.getElementById('details-description').textContent = exhibit.description;

    const mediaList = document.getElementById('media-list');
    mediaList.innerHTML = exhibit.media.items.map((item) => `
        <div class="media-card">
            <span class="media-label">${item.label}</span>
            <span class="media-value">${item.value}</span>
        </div>
    `).join('');
}

function showGalleryTooltip(exhibit, x, y) {
    galleryTooltip.innerHTML = `<strong>${exhibit.title}</strong><span>${exhibit.author}</span>`;
    galleryTooltip.style.left = `${x + 18}px`;
    galleryTooltip.style.top = `${y + 18}px`;
    galleryTooltip.classList.add('visible');
}

function hideGalleryTooltip() {
    galleryTooltip.classList.remove('visible');
}

function getGalleryMaxZ() {
    const farthest = exhibitionData.exhibits.reduce((max, item) => Math.max(max, item.room.z), 0);
    return farthest + 10;
}

function updateGalleryProgress() {
    galleryProgressBar.style.width = `${(galleryScrollProgress * 100).toFixed(0)}%`;
}

function animateGallery() {
    requestAnimationFrame(animateGallery);

    exhibitGroups.forEach((group, index) => {
        const exhibit = group.userData.exhibit;
        const focused = exhibit.id === selectedExhibitId;
        const hovered = galleryHoverObject && galleryHoverObject.userData.exhibit.id === exhibit.id;
        group.userData.hoverMix = THREE.MathUtils.lerp(group.userData.hoverMix, hovered ? 1 : 0, 0.16);

        const pulse = focused ? 0.08 : 0.03;
        group.position.y = group.userData.originalY + Math.sin(Date.now() * 0.001 + index) * pulse + group.userData.hoverMix * 0.08;

        const focusMesh = group.userData.focusMesh;
        if (focusMesh) {
            focusMesh.scale.setScalar((focused ? 1.08 : 1) + group.userData.hoverMix * 0.07);
        }

        if (group.userData.spotlight) {
            const targetIntensity = group.userData.baseSpotIntensity + (focused ? 0.12 : 0) + group.userData.hoverMix * 0.34;
            group.userData.spotlight.intensity = THREE.MathUtils.lerp(group.userData.spotlight.intensity, targetIntensity, 0.14);
        }

        if (group.userData.highlightMaterials) {
            group.userData.highlightMaterials.forEach((material) => {
                if (!('emissiveIntensity' in material)) {
                    return;
                }

                const baseIntensity = material.userData.baseEmissiveIntensity ?? material.emissiveIntensity ?? 0;
                material.userData.baseEmissiveIntensity = baseIntensity;
                material.emissiveIntensity = baseIntensity + (focused ? 0.06 : 0) + group.userData.hoverMix * 0.26;
            });
        }
    });

    const minZ = -7;
    const maxZ = getGalleryMaxZ();
    const targetCameraZ = minZ + galleryScrollProgress * (maxZ - minZ);
    const targetPosition = new THREE.Vector3(galleryMouse.x * 0.45, 1.9, targetCameraZ);

    galleryCamera.position.lerp(targetPosition, 0.08);

    const targetLook = new THREE.Vector3(0, 2.15 + galleryMouse.y * 0.18, targetCameraZ + 7.2);
    galleryLookTarget.lerp(targetLook, 0.1);
    galleryCamera.lookAt(galleryLookTarget);

    autoSelectNearestExhibit();
    updateGalleryProgress();
    galleryRenderer.render(galleryScene, galleryCamera);
}

function autoSelectNearestExhibit() {
    if (galleryDetailsVisible) {
        return;
    }

    const cameraAnchor = galleryCamera.position.z + 5.3;
    let best = exhibitionData.exhibits[0];
    let minDistance = Infinity;

    exhibitionData.exhibits.forEach((item) => {
        const distance = Math.abs(item.room.z - cameraAnchor);
        if (distance < minDistance) {
            minDistance = distance;
            best = item;
        }
    });

    if (best && best.id !== selectedExhibitId) {
        selectExhibit(best.id, false);
    }
}

window.addEventListener('load', initExhibition);
