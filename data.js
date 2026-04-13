(function () {
    const previewImages = [
        'public/textures/art-1.jpg',
        'public/textures/art-2.jpg',
        'public/textures/art-3.jpg',
        'public/textures/art-4.jpg',
        'public/textures/art-5.jpg'
    ];

    const exhibitions = [
        {
            id: 1,
            title: 'Возрождение архаизма',
            subtitle: 'Архаические ритмы, переведенные в цифровую экспозицию',
            emoji: '🎨',
            organization: 'Музей современного искусства',
            curator: 'Иван Петров',
            duration: '15 янв - 30 мар 2025',
            pieces: 48,
            url: 'expo-1.html',
            coverImage: previewImages[0],
            accent: '#d68642',
            fogColor: '#dcd2c8',
            description: 'Выставка исследует, как мотивы древних культур читаются в современной живописи, пластике и цифровых инсталляциях.',
            highlights: ['Настенные полотна', 'Скульптуры', 'Аудиогид'],
            exhibits: [
                {
                    id: '1-1',
                    title: 'Фрагмент времени',
                    author: 'Алиса Воронцова',
                    year: '2024',
                    kind: 'image',
                    medium: 'Пигментная печать на хлопковой бумаге',
                    description: 'Слоистое изображение, в котором орнамент древнего фриза собран в современную абстракцию.',
                    room: { side: 'right', z: 6, width: 2.7, height: 1.8 },
                    media: {
                        preview: previewImages[0],
                        items: [
                            { label: 'Медиаформат', value: 'Изображение JPG, 3840 x 2160' },
                            { label: 'Каталог', value: 'Кураторский текст и аннотация' },
                            { label: 'Аудиогид', value: '03:12, русский язык' }
                        ]
                    }
                },
                {
                    id: '1-2',
                    title: 'Страж ворот',
                    author: 'Марк Лебедев',
                    year: '2023',
                    kind: 'sculpture',
                    shape: 'torusKnot',
                    medium: 'Бронза, патина, 3D-сканирование',
                    description: 'Биоморфная форма, вдохновленная древними амулетами и обработанная как цифровой объект.',
                    room: { side: 'center', z: 12, pedestalHeight: 1.15 },
                    media: {
                        preview: previewImages[1],
                        items: [
                            { label: '3D-модель', value: 'Виртуальный объект, glTF' },
                            { label: 'Материал', value: 'Бронза с темной патиной' },
                            { label: 'Комментарий', value: 'Короткий рассказ автора о реконструкции формы' }
                        ]
                    }
                },
                {
                    id: '1-3',
                    title: 'Карта созвездий',
                    author: 'Софья Нестерова',
                    year: '2025',
                    kind: 'image',
                    medium: 'Световой отпечаток, цифровой коллаж',
                    description: 'Архаическая символика переведена в топографию света и линий.',
                    room: { side: 'left', z: 18, width: 2.9, height: 1.75 },
                    media: {
                        preview: previewImages[2],
                        items: [
                            { label: 'Медиаформат', value: 'Световой принт и цифровая копия' },
                            { label: 'Сопровождение', value: 'Текст о символике созвездий' },
                            { label: 'Статус', value: 'Основная работа экспозиции' }
                        ]
                    }
                },
                {
                    id: '1-4',
                    title: 'Порог',
                    author: 'Ирина Осипова',
                    year: '2022',
                    kind: 'sculpture',
                    shape: 'arch',
                    medium: 'Камень, металл, виртуальная реконструкция',
                    description: 'Скульптура-портал, которая собирает мотив храма и цифровой арки в одно пространство.',
                    room: { side: 'center', z: 24, pedestalHeight: 0.45 },
                    media: {
                        preview: previewImages[3],
                        items: [
                            { label: 'Медиаобъект', value: 'Пространственная арка, интерактивный просмотр' },
                            { label: 'Экспликация', value: 'Исторические отсылки и схема формы' },
                            { label: 'Навигация', value: 'Объект можно обойти в 3D-пространстве' }
                        ]
                    }
                }
            ]
        },
        {
            id: 2,
            title: 'Цифровая революция',
            subtitle: 'Интерактивные панели, алгоритмы и цифровые скульптуры',
            emoji: '💻',
            organization: 'Центр инноваций',
            curator: 'Мария Сидорова',
            duration: '1 фев - 15 апр 2025',
            pieces: 32,
            url: 'expo-2.html',
            coverImage: previewImages[1],
            accent: '#5fd3bc',
            fogColor: '#cedee2',
            description: 'Экспозиция показывает, как данные, код и машинные процессы становятся художественным материалом.',
            highlights: ['LED-панели', 'Генеративная графика', 'Видеоэлементы'],
            exhibits: [
                {
                    id: '2-1',
                    title: 'Сбой сигнала',
                    author: 'Даниил Котов',
                    year: '2025',
                    kind: 'lightbox',
                    medium: 'Генеративное видео на LED-панели',
                    description: 'Работа о шуме как художественном языке: изображение постоянно собирается и распадается.',
                    room: { side: 'right', z: 5, width: 3, height: 1.7 },
                    media: {
                        preview: previewImages[4],
                        items: [
                            { label: 'Медианоситель', value: 'Видеоцикл, 4K loop' },
                            { label: 'Звук', value: 'Синтетическая шумовая дорожка' },
                            { label: 'Продолжительность', value: '06:40' }
                        ]
                    }
                },
                {
                    id: '2-2',
                    title: 'Серверный сад',
                    author: 'Людмила Ракова',
                    year: '2024',
                    kind: 'sculpture',
                    shape: 'icosahedron',
                    medium: 'Полимер, алюминий, генеративная подсветка',
                    description: 'Геометрическая форма, в которой цифровая структура воспринимается как живой организм.',
                    room: { side: 'center', z: 11, pedestalHeight: 1.2 },
                    media: {
                        preview: previewImages[2],
                        items: [
                            { label: '3D-модель', value: 'Интерактивная геометрия' },
                            { label: 'Подсветка', value: 'Динамический градиент по поверхности' },
                            { label: 'Архив', value: 'Схема генеративного алгоритма' }
                        ]
                    }
                },
                {
                    id: '2-3',
                    title: 'Память облака',
                    author: 'Никита Юшин',
                    year: '2023',
                    kind: 'image',
                    medium: 'Цифровая печать, слои данных',
                    description: 'Визуализация следов пользовательской активности как живописного поля.',
                    room: { side: 'left', z: 17, width: 2.8, height: 1.85 },
                    media: {
                        preview: previewImages[1],
                        items: [
                            { label: 'Файл-источник', value: 'Набор анонимизированных данных' },
                            { label: 'Медиаформат', value: 'Изображение и текстовая расшифровка' },
                            { label: 'Аудиогид', value: '02:18, кураторский комментарий' }
                        ]
                    }
                },
                {
                    id: '2-4',
                    title: 'Лента событий',
                    author: 'Екатерина Филатова',
                    year: '2025',
                    kind: 'lightbox',
                    medium: 'Световая панель с типографикой',
                    description: 'Поток уведомлений превращен в замедленную, почти медитативную композицию.',
                    room: { side: 'right', z: 23, width: 2.5, height: 2.1 },
                    media: {
                        preview: previewImages[3],
                        items: [
                            { label: 'Медианоситель', value: 'Световая панель' },
                            { label: 'Текст', value: 'Набор коротких сообщений и логов' },
                            { label: 'Состояние', value: 'Интерактивная демонстрация в пространстве' }
                        ]
                    }
                }
            ]
        },
        {
            id: 3,
            title: 'Природа и форма',
            subtitle: 'Биоморфные объекты и изображения на стыке искусства и экологии',
            emoji: '🌿',
            organization: 'Биохудожественная галерея',
            curator: 'Александр Морозов',
            duration: '10 фев - 20 май 2025',
            pieces: 56,
            url: 'expo-3.html',
            coverImage: previewImages[2],
            accent: '#88ba62',
            fogColor: '#dfe7d7',
            description: 'Выставка соединяет органические структуры, природные циклы и пластические эксперименты в одном виртуальном пространстве.',
            highlights: ['Биоморфные скульптуры', 'Изображения', 'Медиаданные'],
            exhibits: [
                {
                    id: '3-1',
                    title: 'Гербарий движения',
                    author: 'Анна Рябова',
                    year: '2024',
                    kind: 'image',
                    medium: 'Фотография, цифровая печать',
                    description: 'Полевой материал собран в серию слоев, где лист становится картой ветра и роста.',
                    room: { side: 'right', z: 6, width: 2.8, height: 1.85 },
                    media: {
                        preview: previewImages[2],
                        items: [
                            { label: 'Медианоситель', value: 'Изображение JPG, 300 dpi' },
                            { label: 'Источник', value: 'Серия полевых наблюдений' },
                            { label: 'Аудиогид', value: '03:40, авторский текст' }
                        ]
                    }
                },
                {
                    id: '3-2',
                    title: 'Кокон света',
                    author: 'Павел Елагин',
                    year: '2025',
                    kind: 'sculpture',
                    shape: 'capsule',
                    medium: 'Смола, свет, параметрическое моделирование',
                    description: 'Объект напоминает семенную капсулу и реагирует на движение зрителя мягким свечением.',
                    room: { side: 'center', z: 12, pedestalHeight: 1.15 },
                    media: {
                        preview: previewImages[4],
                        items: [
                            { label: '3D-объект', value: 'Параметрическая форма, интерактивный просмотр' },
                            { label: 'Световой режим', value: 'Пульсирующее свечение поверхности' },
                            { label: 'Комментарий', value: 'Текст о росте и оболочке' }
                        ]
                    }
                },
                {
                    id: '3-3',
                    title: 'Пульсация листа',
                    author: 'Светлана Гранкина',
                    year: '2023',
                    kind: 'lightbox',
                    medium: 'Световая панель, видеопетля',
                    description: 'Лист превращается в экран, на котором видны ритмы испарения и движения воздуха.',
                    room: { side: 'left', z: 18, width: 3.1, height: 1.75 },
                    media: {
                        preview: previewImages[1],
                        items: [
                            { label: 'Видео', value: 'Loop 04:20, без звука' },
                            { label: 'Формат', value: 'Световая панель с текстовым сопровождением' },
                            { label: 'Тема', value: 'Циклы влаги и дыхания' }
                        ]
                    }
                },
                {
                    id: '3-4',
                    title: 'Семена ветра',
                    author: 'Максим Пахомов',
                    year: '2025',
                    kind: 'sculpture',
                    shape: 'cluster',
                    medium: 'Дерево, металл, 3D-сборка',
                    description: 'Кластер парящих элементов собирает образ рассеянного семени в пространстве галереи.',
                    room: { side: 'center', z: 24, pedestalHeight: 0.8 },
                    media: {
                        preview: previewImages[0],
                        items: [
                            { label: 'Медиаобъект', value: 'Пространственная сборка из модулей' },
                            { label: 'Материал', value: 'Дерево и матовый металл' },
                            { label: 'Дополнение', value: 'Кураторская заметка о природных структурах' }
                        ]
                    }
                }
            ]
        },
        {
            id: 4,
            title: 'Свет и тень',
            subtitle: 'Пространственные опыты с контрастом, прозрачностью и темнотой',
            emoji: '💡',
            organization: 'Галерея света',
            curator: 'Ольга Кравцова',
            duration: '1 мар - 30 июн 2025',
            pieces: 24,
            url: 'expo-4.html',
            coverImage: previewImages[3],
            accent: '#f4d17f',
            fogColor: '#dcd8d0',
            description: 'Экспозиция строится на взаимодействии источников света, отражений и затемненных объектов.',
            highlights: ['Световые объекты', 'Контрастные панели', 'Интерактивная навигация'],
            exhibits: [
                {
                    id: '4-1',
                    title: 'Перелом луча',
                    author: 'Елена Кравченко',
                    year: '2024',
                    kind: 'lightbox',
                    medium: 'Акрил, свет, отражающие пленки',
                    description: 'Световая работа, в которой луч не показывает форму, а дробит ее на слои.',
                    room: { side: 'right', z: 5, width: 2.9, height: 1.9 },
                    media: {
                        preview: previewImages[3],
                        items: [
                            { label: 'Медианоситель', value: 'Световая инсталляция' },
                            { label: 'Режим', value: 'Плавное изменение яркости' },
                            { label: 'Текст', value: 'Краткая экспликация о контрасте' }
                        ]
                    }
                },
                {
                    id: '4-2',
                    title: 'Темный объем',
                    author: 'Роман Лукьянов',
                    year: '2022',
                    kind: 'sculpture',
                    shape: 'monolith',
                    medium: 'Матовый композит, внутренняя подсветка',
                    description: 'Глухой монолит открывает свет только на ребрах, подчеркивая скрытую структуру.',
                    room: { side: 'center', z: 11, pedestalHeight: 1.25 },
                    media: {
                        preview: previewImages[0],
                        items: [
                            { label: '3D-объект', value: 'Объемная форма с внутренним источником света' },
                            { label: 'Материал', value: 'Матовый композит' },
                            { label: 'Сюжет', value: 'Скрытая структура и границы видимого' }
                        ]
                    }
                },
                {
                    id: '4-3',
                    title: 'Слепая комната',
                    author: 'Кира Данилова',
                    year: '2025',
                    kind: 'image',
                    medium: 'Фотография, черно-белый принт',
                    description: 'Серия снимков о пространстве, которое становится видимым лишь через перепады яркости.',
                    room: { side: 'left', z: 17, width: 3.05, height: 1.8 },
                    media: {
                        preview: previewImages[4],
                        items: [
                            { label: 'Медиаформат', value: 'Фотопринт и цифровая версия' },
                            { label: 'Серия', value: '12 кадров городских интерьеров' },
                            { label: 'Аудиогид', value: '02:52, кураторский голос' }
                        ]
                    }
                },
                {
                    id: '4-4',
                    title: 'Граница свечения',
                    author: 'Артем Поляков',
                    year: '2023',
                    kind: 'sculpture',
                    shape: 'ribbon',
                    medium: 'Гибкий неон, стальной каркас',
                    description: 'Линия света прорезает пространство и задает новую траекторию взгляда.',
                    room: { side: 'center', z: 23, pedestalHeight: 0.5 },
                    media: {
                        preview: previewImages[1],
                        items: [
                            { label: 'Медианоситель', value: 'Световая скульптура' },
                            { label: 'Физика', value: 'Гибкий неон на каркасе' },
                            { label: 'Рекомендация', value: 'Просмотр из нескольких точек зала' }
                        ]
                    }
                }
            ]
        },
        {
            id: 5,
            title: 'Город будущего',
            subtitle: 'Модели, карты и сценарии городской среды 2050 года',
            emoji: '🏙️',
            organization: 'Архитектурный музей',
            curator: 'Дмитрий Волков',
            duration: '15 мар - 10 июл 2025',
            pieces: 40,
            url: 'expo-5.html',
            coverImage: previewImages[4],
            accent: '#79a7ff',
            fogColor: '#d5deed',
            description: 'Зал объединяет архитектурные модели, панорамы и медиаобъекты, посвященные городскому сценарию будущего.',
            highlights: ['Городские модели', 'Панорамы', 'Поясняющие медиа'],
            exhibits: [
                {
                    id: '5-1',
                    title: 'Контур мегаполиса',
                    author: 'Дарья Фокина',
                    year: '2025',
                    kind: 'image',
                    medium: 'Архитектурная визуализация',
                    description: 'Широкая панорама города с многоуровневым общественным пространством и зелеными террасами.',
                    room: { side: 'right', z: 6, width: 3.2, height: 1.75 },
                    media: {
                        preview: previewImages[4],
                        items: [
                            { label: 'Медиаформат', value: 'Панорама PNG, 6K' },
                            { label: 'Материалы', value: 'Схема улиц и подписи функций' },
                            { label: 'Каталог', value: 'Описание сценария городской жизни' }
                        ]
                    }
                },
                {
                    id: '5-2',
                    title: 'Башня ветров',
                    author: 'Сергей Ивашин',
                    year: '2024',
                    kind: 'sculpture',
                    shape: 'cityStack',
                    medium: 'Макет, композит, цифровой двойник',
                    description: 'Вертикальная модель башни, где фасад работает как климатическая оболочка.',
                    room: { side: 'center', z: 12, pedestalHeight: 1.2 },
                    media: {
                        preview: previewImages[2],
                        items: [
                            { label: '3D-модель', value: 'Макет с виртуальным двойником' },
                            { label: 'Схема', value: 'Воздушные потоки и климатическая логика' },
                            { label: 'Комментарий', value: 'Архитектор о модульной структуре' }
                        ]
                    }
                },
                {
                    id: '5-3',
                    title: 'Транспортный нерв',
                    author: 'Михаил Дроздов',
                    year: '2023',
                    kind: 'lightbox',
                    medium: 'Световая карта маршрутов',
                    description: 'Сеть маршрутов визуализирована как живая система, в которой транспорт становится ритмом города.',
                    room: { side: 'left', z: 18, width: 2.9, height: 1.9 },
                    media: {
                        preview: previewImages[1],
                        items: [
                            { label: 'Медианоситель', value: 'Световая карта и текстовые легенды' },
                            { label: 'Слой данных', value: 'Маршруты, пересадки, плотность движения' },
                            { label: 'Статус', value: 'Интерактивный городской сценарий' }
                        ]
                    }
                },
                {
                    id: '5-4',
                    title: 'Сад на крыше',
                    author: 'Полина Савина',
                    year: '2025',
                    kind: 'sculpture',
                    shape: 'garden',
                    medium: 'Модульный макет, дерево, полимер',
                    description: 'Объект показывает, как природный слой становится не украшением, а структурой городской среды.',
                    room: { side: 'center', z: 24, pedestalHeight: 0.85 },
                    media: {
                        preview: previewImages[3],
                        items: [
                            { label: 'Медиаобъект', value: 'Архитектурный макет с растительным модулем' },
                            { label: 'Сценарий', value: 'Общественный сад на жилой платформе' },
                            { label: 'Пояснение', value: 'Материалы и принципы озеленения' }
                        ]
                    }
                }
            ]
        }
    ];

    function getExhibitionById(id) {
        return exhibitions.find((item) => String(item.id) === String(id)) || null;
    }

    function getExhibitionFromPath(pathname) {
        const sourcePath = pathname || window.location.pathname;
        const fileName = sourcePath.split('/').pop();
        return exhibitions.find((item) => item.url === fileName) || null;
    }

    window.VirtualExpoData = {
        exhibitions,
        getExhibitionById,
        getExhibitionFromPath
    };
})();
