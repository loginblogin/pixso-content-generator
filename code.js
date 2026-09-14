const TOOL_ID = "af0398dd-709d-4944-86ed-4a2b25a8847c";
const DISPLAY_NAME = "Content filler";
const DEFAULTS = {
    fireEmoji: false, randomizeChange: false,
    fillNews: true, fillDescription: true, fillTime: true,
    fillDatetime: true, fillAuthor: true, fillCategory: true,
    fillRandom: true, fillText: true, fillQuote: true, fillPhotoDesc: true, fillImg: false,
};
let latestParams = DEFAULTS;
let isExecuting = false;
function normalizeParams(input) {
    if (input == null)
        return DEFAULTS;
    const b = (key) => typeof input[key] === 'boolean' ? input[key] : DEFAULTS[key];
    return {
        fireEmoji: b('fireEmoji'), randomizeChange: b('randomizeChange'),
        fillNews: b('fillNews'), fillDescription: b('fillDescription'),
        fillTime: b('fillTime'), fillDatetime: b('fillDatetime'),
        fillAuthor: b('fillAuthor'), fillCategory: b('fillCategory'),
        fillRandom: b('fillRandom'), fillText: b('fillText'), fillQuote: b('fillQuote'), fillPhotoDesc: b('fillPhotoDesc'), fillImg: b('fillImg'),
    };
}
function uniqueSceneNodes(nodes) {
    return [...new Set(nodes)].filter((node) => !node.removed);
}
function attachRelaunch(nodes) {
    const unique = uniqueSceneNodes(nodes);
    if (unique.length > 0) {
        for (const node of unique)
            node.setRelaunchData({ [TOOL_ID]: DISPLAY_NAME });
    }
    else {
        pixso.root.setRelaunchData({ [TOOL_ID]: DISPLAY_NAME });
    }
}
function status_fill(_selection, enabled) {
    return enabled ? "Ready to fill" : "Select a frame";
}
function evaluateEnabled_fill(selection) {
    return (selection.length >= 1);
}
function actionTarget_fill() {
    const selection = pixso.currentPage.selection;
    if (!evaluateEnabled_fill(selection))
        return null;
    return selection.length >= 1 ? (selection[0] ?? null) : null;
}
async function action_fill(params, target, _previousState, aiHeadlines, aiDescriptions) {
    const affectedNodes = target != null ? [target] : [];
    const selection = pixso.currentPage.selection;
    await (async () => {
        if (target == null)
            return;
        const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
        // AI-generated content pools (filled from UI if API key is set)
        const aiNewsPool = aiHeadlines && aiHeadlines.length > 0 ? [...aiHeadlines] : [];
        const aiDescPool = aiDescriptions && aiDescriptions.length > 0 ? [...aiDescriptions] : [];
        let aiNewsIndex = 0;
        let aiDescIndex = 0;
        function pickAiNews() {
            if (aiNewsPool.length === 0)
                return null;
            const item = aiNewsPool[aiNewsIndex % aiNewsPool.length];
            aiNewsIndex++;
            return item ?? null;
        }
        function pickAiDesc() {
            if (aiDescPool.length === 0)
                return null;
            const item = aiDescPool[aiDescIndex % aiDescPool.length];
            aiDescIndex++;
            return item ?? null;
        }
        const SUBJECTS = [
            'Ученые', 'Исследователи', 'Инженеры', 'Археологи', 'Астрономы', 'Экологи',
            'Биологи', 'Программисты', 'Врачи', 'Конструкторы', 'Физики', 'Химики',
            'Геологи', 'Разработчики', 'Архитекторы', 'Дизайнеры', 'Математики',
            'Специалисты', 'Аналитики', 'Эксперты',
        ];
        const VERBS = [
            'обнаружили', 'разработали', 'создали', 'представили', 'запустили',
            'испытали', 'открыли', 'построили', 'завершили', 'подтвердили',
            'продемонстрировали', 'внедрили', 'протестировали', 'анонсировали',
            'опубликовали', 'установили', 'зафиксировали', 'синтезировали',
        ];
        const OBJECTS = [
            'новый метод очистки воды с помощью солнечной энергии',
            'уникальный материал, способный поглощать углекислый газ из атмосферы',
            'прототип квантового процессора нового поколения с рекордной скоростью',
            'систему раннего предупреждения землетрясений на основе нейросетей',
            'технологию беспроводной передачи энергии на расстояние до пяти километров',
            'биоразлагаемый пластик из водорослей для замены упаковочных материалов',
            'робота-спасателя для работы в труднодоступных горных районах',
            'способ переработки текстильных отходов в строительные панели',
            'метод ускоренного выращивания деревьев для восстановления лесов',
            'датчик для мгновенного определения качества питьевой воды',
            'компактный реактор для получения водорода из морской воды',
            'алгоритм прогнозирования наводнений с точностью до нескольких часов',
            'имплант для восстановления слуха без хирургического вмешательства',
            'покрытие для зданий, вырабатывающее электричество из дождевых капель',
            'систему навигации для автономных кораблей в арктических водах',
            'вакцину от аллергии, эффективную для большинства типов аллергенов',
            'способ хранения данных в молекулах ДНК на срок до тысячи лет',
            'лёгкий бетон из вулканического пепла для сейсмостойких зданий',
            'подводный дрон для мониторинга коралловых рифов в реальном времени',
            'ткань, меняющую цвет в зависимости от температуры окружающей среды',
            'портативный анализатор почвы для фермеров с подключением к облаку',
            'гибкую солнечную панель толщиной менее одного миллиметра',
            'нейроинтерфейс для управления протезами силой мысли с высокой точностью',
            'антибиотик нового класса, действующий против устойчивых бактерий',
            'систему очистки океана от микропластика с помощью магнитных частиц',
            'устройство для опреснения воды, работающее от энергии волн',
            'метод восстановления зрения с помощью генной терапии сетчатки',
            'краску для крыш, снижающую температуру в помещении на десять градусов',
            'аккумулятор на основе натрия с ёмкостью вдвое больше литиевого',
            'спутниковую систему для отслеживания незаконной вырубки лесов',
        ];
        const PLACES = [
            'в Японии', 'в Германии', 'в Швейцарии', 'в Канаде', 'в Австралии',
            'в Сингапуре', 'в Норвегии', 'в Южной Корее', 'в Финляндии', 'в Бразилии',
            'в Новой Зеландии', 'в Нидерландах', 'в Израиле', 'в Чили', 'в Дании',
            'на Тайване', 'в Исландии', 'в Эстонии', 'в Португалии', 'в Кении',
        ];
        function generateNews() {
            const targetLen = 40 + Math.floor(Math.random() * 51); // 40..90
            let best = '';
            for (let attempt = 0; attempt < 60; attempt++) {
                const usePlace = Math.random() > 0.5;
                const parts = [pick(SUBJECTS), pick(PLACES), pick(VERBS), pick(OBJECTS)];
                if (!usePlace)
                    parts.splice(1, 1);
                const candidate = parts.join(' ');
                if (candidate.length >= 40 && candidate.length <= 90) {
                    if (best === '' || Math.abs(candidate.length - targetLen) < Math.abs(best.length - targetLen)) {
                        best = candidate;
                    }
                }
            }
            if (best !== '')
                return best;
            // Fallback: trim or extend
            const fallback = pick(SUBJECTS) + ' ' + pick(PLACES) + ' ' + pick(VERBS) + ' ' + pick(OBJECTS);
            if (fallback.length > 90)
                return fallback.slice(0, 90).replace(/\s+\S*$/, '');
            return fallback;
        }
        const ARTICLE_STARTS = [
            'Глобальное потепление продолжает оказывать значительное влияние на экосистемы планеты.',
            'Искусственный интеллект стремительно меняет подходы к решению научных задач.',
            'Цифровизация здравоохранения открывает новые горизонты для пациентов по всему миру.',
            'Мировой рынок возобновляемой энергии демонстрирует устойчивый рост.',
            'Современная архитектура всё чаще обращается к принципам устойчивого развития.',
            'Космические исследования вступили в новую фазу международного сотрудничества.',
            'Биотехнологии меняют представление о возможностях современной медицины.',
            'Городская инфраструктура переживает масштабную цифровую трансформацию.',
            'Океанология переживает период крупных открытий благодаря новым технологиям.',
            'Сельское хозяйство адаптируется к изменениям климата с помощью инноваций.',
        ];
        const ARTICLE_MIDDLES = [
            ' По данным последних исследований, эффективность новых методов выросла на сорок процентов за последний год.',
            ' Эксперты прогнозируют, что в ближайшие десять лет эта область изменится кардинально.',
            ' Крупнейшие компании инвестируют миллиарды в развитие этого направления.',
            ' Международные организации поддерживают масштабные проекты в данной сфере.',
            ' Новые стандарты безопасности позволяют ускорить внедрение передовых решений.',
            ' Результаты пилотных проектов превзошли все ожидания аналитиков.',
            ' Правительства многих стран разрабатывают программы поддержки инноваций.',
            ' Учёные считают, что потенциал этих технологий ещё далеко не исчерпан.',
        ];
        const ARTICLE_ENDS = [
            ' Это привело к ускоренному развитию смежных отраслей экономики.',
            ' Компании по всему миру инвестируют в переобучение сотрудников.',
            ' Электронные системы мониторинга улучшают качество контроля процессов.',
            ' Инфраструктура для поддержки новых технологий расширяется рекордными темпами.',
            ' Зелёные инициативы становятся неотъемлемой частью корпоративных стратегий.',
            ' Специалисты ожидают дальнейшего снижения стоимости внедрения.',
            ' Общественный интерес к теме растёт вместе с доступностью информации.',
            ' Результаты первых испытаний будут опубликованы в ведущих научных журналах.',
        ];
        function generateArticle() {
            return pick(ARTICLE_STARTS) + pick(ARTICLE_MIDDLES) + pick(ARTICLE_ENDS);
        }
        function randomDate() {
            const d = Math.floor(Math.random() * 28) + 1;
            const m = Math.floor(Math.random() * 12) + 1;
            const y = 2020 + Math.floor(Math.random() * 6);
            return String(d).padStart(2, '0') + '.' + String(m).padStart(2, '0') + '.' + y;
        }
        function randomTime() {
            const h = Math.floor(Math.random() * 24);
            const min = Math.floor(Math.random() * 60);
            return String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0');
        }
        const LAST_NAMES = [
            'Иванов', 'Петров', 'Сидоров', 'Кузнецов', 'Смирнов', 'Попов', 'Васильев',
            'Соколов', 'Михайлов', 'Новиков', 'Фёдоров', 'Морозов', 'Волков', 'Алексеев',
            'Лебедев', 'Семёнов', 'Егоров', 'Павлов', 'Козлов', 'Степанов', 'Николаев',
            'Орлов', 'Андреев', 'Макаров', 'Никитин', 'Захаров', 'Зайцев', 'Соловьёв',
            'Борисов', 'Яковлев',
        ];
        const FIRST_NAMES = [
            'Александр', 'Дмитрий', 'Максим', 'Сергей', 'Андрей', 'Алексей', 'Артём',
            'Илья', 'Кирилл', 'Михаил', 'Никита', 'Матвей', 'Роман', 'Егор', 'Арсений',
            'Иван', 'Денис', 'Евгений', 'Тимофей', 'Владислав', 'Игорь', 'Владимир',
            'Павел', 'Руслан', 'Марк', 'Константин', 'Тимур', 'Олег', 'Ярослав', 'Антон',
            'Анна', 'Мария', 'Елена', 'Дарья', 'Алина', 'Ирина', 'Екатерина', 'Арина',
            'Полина', 'Ольга', 'Татьяна', 'Наталья', 'Юлия', 'Виктория', 'Елизавета',
            'Ксения', 'Милана', 'Вероника', 'Алиса', 'Валерия',
        ];
        function generateAuthor() {
            return pick(LAST_NAMES) + ' ' + pick(FIRST_NAMES);
        }
        const DESCRIPTIONS = [
            'Новые технологии позволяют значительно сократить затраты на производство и повысить качество конечной продукции',
            'Эксперты отмечают рост интереса к экологически чистым решениям среди крупных промышленных предприятий региона',
            'Результаты исследования подтверждают эффективность предложенного подхода в условиях реальной эксплуатации',
            'Международная команда специалистов завершила первый этап масштабного проекта по модернизации инфраструктуры',
            'Аналитики прогнозируют устойчивый рост рынка в ближайшие годы на фоне увеличения государственных инвестиций',
            'Разработка прошла все необходимые испытания и получила одобрение регулирующих органов для массового внедрения',
            'Компания представила обновлённую версию платформы с улучшенной производительностью и расширенным функционалом',
            'Проект объединяет усилия ведущих научных центров и промышленных партнёров из нескольких стран мира',
            'Внедрение системы позволило сократить время обработки запросов в три раза и снизить количество ошибок',
            'Участники конференции обсудили перспективы развития отрасли и обменялись опытом реализации пилотных проектов',
            'Пилотный запуск показал стабильные результаты в течение полугода непрерывной работы без сбоев и простоев',
            'Специалисты рекомендуют обратить внимание на новые стандарты безопасности при планировании модернизации',
            'Инициатива получила поддержку региональных властей и крупнейших отраслевых ассоциаций в нескольких странах',
            'Технология уже применяется в пяти странах и демонстрирует устойчивые показатели эффективности и надёжности',
            'Исследователи выявили ключевые факторы, влияющие на успешность внедрения инновационных решений в компаниях',
            'Обновлённая методика позволяет проводить диагностику в полевых условиях без использования дорогостоящего оборудования',
            'Первые результаты превзошли ожидания разработчиков и привлекли внимание международного научного сообщества',
            'Программа подготовки кадров охватит более двадцати регионов и позволит обучить несколько тысяч специалистов',
            'Совместный проект двух университетов направлен на создание доступных решений для малого и среднего бизнеса',
            'Отчёт за первый квартал показал положительную динамику по всем ключевым показателям эффективности проекта',
        ];
        function generateDescription() {
            return pick(DESCRIPTIONS);
        }
        const CATEGORIES_GAZETA = [
            'Спорт', 'Технологии', 'Политика', 'Авто', 'Бизнес', 'Стиль', 'Общество',
            'Фото', 'Армия', 'Культура', 'Наука',
            'Спецпроекты', 'Семья и дети',
        ];
        const CATEGORIES_LENTA = [
            'Россия', 'Мир', 'Бывший СССР', 'Экономика', 'Силовые структуры',
            'Наука и техника', 'Авто', 'Культура', 'Спорт', 'Интернет и СМИ',
            'Ценности', 'Путешествия', 'Из жизни', 'Среда обитания',
            'Забота о себе', 'Моя страна', '69-я параллель',
        ];
        const LOREM_WORDS = [
            'однако', 'следует', 'отметить', 'что', 'современная', 'методология', 'разработки',
            'позволяет', 'оценить', 'значение', 'новых', 'предложений', 'равным', 'образом',
            'постоянный', 'количественный', 'рост', 'и', 'сфера', 'нашей', 'активности',
            'обеспечивает', 'широкому', 'кругу', 'специалистов', 'участие', 'в', 'формировании',
            'позиций', 'занимаемых', 'повседневная', 'практика', 'показывает', 'рамки',
            'структуры', 'управления', 'влечёт', 'за', 'собой', 'процесс', 'внедрения',
            'модернизации', 'системы', 'массового', 'участия', 'представляет', 'интересный',
            'эксперимент', 'проверки', 'модели', 'развития', 'разнообразный', 'богатый',
            'опыт', 'консультация', 'различными', 'специалистами', 'существенно', 'определяет',
            'создание', 'направлений', 'прогрессивного', 'идейные', 'соображения', 'высшего',
            'порядка', 'также', 'как', 'начало', 'работы', 'по', 'выработке', 'общей',
            'стратегии', 'требуют', 'определения', 'уточнения', 'дальнейших', 'направлений',
            'таким', 'задача', 'реализация', 'намеченных', 'плановых', 'заданий', 'играет',
            'важную', 'роль', 'подготовки', 'реализации', 'перспективного', 'планирования',
            'не', 'вызывает', 'сомнений', 'укрепление', 'демократической', 'с', 'другой',
            'стороны', 'рамках', 'повышения', 'стандартов', 'каждый', 'должен', 'точно',
            'для', 'себя', 'решить', 'при', 'этом', 'было', 'бы', 'разумно', 'предположить',
        ];
        function generateRandomText(targetLen) {
            const words = [];
            let len = 0;
            while (len < targetLen) {
                const w = pick(LOREM_WORDS);
                words.push(w);
                len += w.length + 1;
            }
            let result = words.join(' ');
            if (result.length > targetLen + 20) {
                result = result.slice(0, targetLen).replace(/\s+\S*$/, '');
            }
            // Capitalize first letter
            result = result.charAt(0).toUpperCase() + result.slice(1);
            return result;
        }
        const QUOTES = [
            'Будущее принадлежит тем, кто верит в красоту своей мечты и не боится идти навстречу неизвестному',
            'Единственный способ делать великие дела — это любить то, чем ты занимаешься каждый день',
            'Успех — это не конечная точка, а постоянное движение вперёд несмотря на все трудности и сомнения',
            'Самое важное — не прекращать задавать вопросы, ведь любопытство существует не без причины',
            'Жизнь — это то, что происходит с тобой, пока ты строишь совсем другие планы на будущее',
            'Воображение важнее знания, потому что знание ограничено, а воображение охватывает весь мир',
            'Трудности закаляют характер подобно тому, как огонь закаляет сталь и делает её прочнее',
            'Никогда не поздно стать тем, кем ты мог бы быть, если бы решился попробовать',
            'Ошибки — это доказательство того, что вы стараетесь и движетесь вперёд по своему пути',
            'Настоящее мужество — это когда ты боишься, но всё равно действуешь и не останавливаешься',
            'Каждый день приносит новые возможности для тех, кто умеет их замечать и использовать',
            'Мудрость приходит не с возрастом, а с готовностью учиться на собственных ошибках и опыте других',
            'Лучший способ предсказать будущее — это создать его своими руками прямо здесь и сейчас',
            'Путь в тысячу миль начинается с одного шага, и самое сложное — решиться его сделать',
            'Великие дела начинаются с маленьких решений, принятых в нужный момент с верой в себя',
            'Не бойся идти медленно — бойся стоять на месте и упускать свои возможности день за днём',
            'Секрет успеха в том, чтобы начать действовать раньше, чем будешь к этому полностью готов',
            'Счастье — это не пункт назначения, а способ путешествовать по жизни с открытым сердцем',
            'Сила человека измеряется не мышцами, а решениями, которые он принимает в трудные моменты',
            'Истинное знание — в осознании масштаба собственного незнания и готовности это исправить',
        ];
        function generateQuote() {
            // Pick a quote that fits 90-200 chars, or trim/combine
            const candidates = QUOTES.filter((q) => q.length >= 90 && q.length <= 200);
            if (candidates.length > 0)
                return pick(candidates);
            return pick(QUOTES);
        }
        const PHOTO_SUBJECTS = [
            'Утренний туман над горным озером',
            'Закат солнца над морским побережьем',
            'Панорама ночного города с высоты птичьего полёта',
            'Старинный маяк на скалистом берегу',
            'Заснеженные вершины гор в лучах рассвета',
            'Осенний лес с золотой листвой',
            'Архитектура современного делового центра',
            'Рыбацкая деревня на берегу фьорда',
            'Цветущие поля лаванды на юге Франции',
            'Величественный водопад в тропическом лесу',
            'Узкие улочки средневекового европейского города',
            'Отражение гор в кристально чистом озере',
            'Бескрайние степи под облачным небом',
            'Заброшенная железнодорожная станция в тумане',
            'Ледяные торосы на берегу арктического моря',
            'Террасные рисовые поля в горах Юго-Восточной Азии',
            'Дикий пляж с белым песком и бирюзовой водой',
            'Промышленный порт с контейнерными кранами',
            'Сельская дорога через подсолнечное поле',
            'Древний храм среди джунглей',
        ];
        const PHOTO_DETAILS = [
            ', снятый в золотой час при мягком естественном освещении',
            ', запечатлённый с использованием длинной выдержки и штатива',
            ' в окружении нетронутой природы и полного безмолвия',
            ', отражающий контраст между природой и современной архитектурой',
            ' с драматичным небом и насыщенными цветами заката',
            ', передающий атмосферу уединения и спокойствия',
            ' в момент смены сезонов, когда природа особенно красива',
            ', создающий ощущение масштаба и бесконечного пространства',
            ' с характерной игрой света и тени на переднем плане',
            ', снятый на рассвете в абсолютной тишине раннего утра',
            ' с использованием минималистичной композиции и чёткой геометрии',
            ', подчёркивающий текстуру и фактуру природных материалов',
            ' в условиях пасмурной погоды с мягким рассеянным светом',
            ', демонстрирующий гармоничное сочетание цвета и формы',
            ' с перспективой, уходящей далеко за линию горизонта',
        ];
        const PHOTO_CONTEXT = [
            '. Фотография сделана во время экспедиции по малоизученным районам',
            '. Кадр стал частью серии работ о красоте дикой природы',
            '. Снимок вошёл в подборку лучших пейзажных фотографий года',
            '. Автор работы провёл несколько дней в ожидании идеальных условий',
            '. Изображение передаёт уникальную атмосферу этого места',
            '. Работа выполнена в рамках проекта документальной фотографии',
            '. Этот вид открывается всего несколько раз в году при определённых условиях',
            '. Фотография была отмечена жюри международного конкурса',
            '',
            '',
            '',
        ];
        function generatePhotoDescription() {
            const targetLen = 90 + Math.floor(Math.random() * 211); // 90..300
            let best = '';
            for (let attempt = 0; attempt < 40; attempt++) {
                const useContext = Math.random() > 0.4;
                let candidate = pick(PHOTO_SUBJECTS) + pick(PHOTO_DETAILS);
                if (useContext)
                    candidate += pick(PHOTO_CONTEXT);
                if (candidate.length >= 90 && candidate.length <= 300) {
                    if (best === '' || Math.abs(candidate.length - targetLen) < Math.abs(best.length - targetLen)) {
                        best = candidate;
                    }
                }
            }
            if (best !== '')
                return best;
            // Fallback
            const fallback = pick(PHOTO_SUBJECTS) + pick(PHOTO_DETAILS) + pick(PHOTO_CONTEXT);
            if (fallback.length > 300)
                return fallback.slice(0, 300).replace(/\s+\S*$/, '');
            return fallback;
        }
        function generateRandomNumber(layerName) {
            const match = layerName.match(/\*rnd-(\d+)-(\d+)/i);
            if (!match)
                return null;
            const min = parseInt(match[1], 10);
            const max = parseInt(match[2], 10);
            if (isNaN(min) || isNaN(max) || min > max)
                return null;
            return String(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        function getContent(layerName, existingLen) {
            const n = layerName.toLowerCase();
            if (n.includes('news-time'))
                return null; // handled separately
            if (n.includes('news') && params.fillNews)
                return pickAiNews() ?? generateNews();
            if (n.includes('category-lenta') && params.fillCategory)
                return pick(CATEGORIES_LENTA);
            if (n.includes('category-gazeta') && params.fillCategory)
                return pick(CATEGORIES_GAZETA);
            if (n.includes('*photo-description') && params.fillPhotoDesc)
                return generatePhotoDescription();
            if (n.includes('description') && params.fillDescription)
                return pickAiDesc() ?? generateDescription();
            if (n.includes('author') && params.fillAuthor)
                return generateAuthor();
            if (n.includes('article') && params.fillNews)
                return generateArticle();
            if (n.includes('datetime-num') && params.fillDatetime)
                return randomDate() + ' ' + randomTime();
            if (n.includes('date') && params.fillDatetime)
                return randomDate();
            if (n.includes('time') && params.fillTime)
                return randomTime();
            if (n.includes('*quote') && params.fillQuote)
                return generateQuote();
            if (n.includes('*text') && params.fillText)
                return generateRandomText(Math.max(10, existingLen));
            if (params.fillRandom) {
                const rndVal = generateRandomNumber(layerName);
                if (rndVal != null)
                    return rndVal;
            }
            return null;
        }
        const targets = ['news-time', 'news', 'category-lenta', 'category-gazeta', '*photo-description', 'description', 'author', 'article', 'date', 'time', 'datetime-num', 'rnd', '*text', '*quote'];
        function isFontName(value) {
            return typeof value === 'object' && value !== null &&
                typeof value.family === 'string' &&
                typeof value.style === 'string';
        }
        async function loadAllFontsForNode(node) {
            const len = node.characters.length;
            if (len === 0)
                return;
            // Pixso exposes getRangeAllFontNames specifically for mixed-style text.
            // Do not pass getRangeFontName() blindly to loadFontAsync(): when the
            // range is mixed Pixso may return pixso.mixed (a Symbol at runtime).
            const rangeFonts = node.getRangeAllFontNames(0, len);
            const fonts = new Map();
            for (const fn of rangeFonts) {
                if (!isFontName(fn))
                    continue;
                fonts.set(fn.family + '|' + fn.style, fn);
            }
            // Defensive fallback for files imported from Figma / unusual Pixso text.
            // Some documents can report an empty list although fontName is concrete.
            if (fonts.size === 0) {
                const fn = node.fontName;
                if (isFontName(fn))
                    fonts.set(fn.family + '|' + fn.style, fn);
            }
            for (const fn of fonts.values()) {
                await pixso.loadFontAsync(fn);
            }
        }
        function concreteFontForRange(node, start, end) {
            const direct = node.getRangeFontName(start, end);
            if (isFontName(direct))
                return direct;
            const fonts = node.getRangeAllFontNames(start, end);
            const first = fonts.find(isFontName);
            return first ?? null;
        }
        function captureRangeStyle(node, start, end) {
            const fontSize = node.getRangeFontSize(start, end);
            const fills = node.getRangeFills(start, end);
            const letterSpacing = node.getRangeLetterSpacing(start, end);
            const lineHeight = node.getRangeLineHeight(start, end);
            return {
                fontName: concreteFontForRange(node, start, end),
                fontSize: typeof fontSize === 'number' ? fontSize : null,
                fills: Array.isArray(fills) ? fills : null,
                letterSpacing: typeof letterSpacing === 'object' && letterSpacing !== null ? letterSpacing : null,
                lineHeight: typeof lineHeight === 'object' && lineHeight !== null ? lineHeight : null,
            };
        }
        function applyRangeStyle(node, start, end, style) {
            if (style.fontName != null)
                node.setRangeFontName(start, end, style.fontName);
            if (style.fontSize != null)
                node.setRangeFontSize(start, end, style.fontSize);
            if (style.fills != null)
                node.setRangeFills(start, end, style.fills);
            if (style.letterSpacing != null)
                node.setRangeLetterSpacing(start, end, style.letterSpacing);
            if (style.lineHeight != null)
                node.setRangeLineHeight(start, end, style.lineHeight);
        }
        async function processNewsTime(node) {
            const len = node.characters.length;
            if (len === 0)
                return;
            await loadAllFontsForNode(node);
            // Find the separator (three spaces) to detect the two parts
            const text = node.characters;
            const sepIndex = text.indexOf('   ');
            let headlineStyle;
            let timeStyle;
            if (sepIndex >= 0 && sepIndex + 3 < len) {
                headlineStyle = captureRangeStyle(node, 0, 1);
                timeStyle = captureRangeStyle(node, sepIndex + 3, sepIndex + 4);
            }
            else {
                // Fallback: use first char style for both
                headlineStyle = captureRangeStyle(node, 0, 1);
                timeStyle = captureRangeStyle(node, 0, 1);
            }
            const useFireEmoji = params.fireEmoji && Math.random() < 0.2;
            const firePrefix = useFireEmoji ? '🔥 ' : '';
            const newHeadline = firePrefix + (pickAiNews() ?? generateNews());
            const newTime = randomTime();
            const newText = newHeadline + '   ' + newTime;
            node.characters = newText;
            // Load only concrete fonts. Mixed values must never reach loadFontAsync.
            if (headlineStyle.fontName != null)
                await pixso.loadFontAsync(headlineStyle.fontName);
            if (timeStyle.fontName != null)
                await pixso.loadFontAsync(timeStyle.fontName);
            // Apply headline style to headline part
            applyRangeStyle(node, 0, newHeadline.length, headlineStyle);
            // Apply time style to time part
            const timeStart = newHeadline.length + 3;
            applyRangeStyle(node, timeStart, newText.length, timeStyle);
            // Separator inherits headline style
            applyRangeStyle(node, newHeadline.length, timeStart, headlineStyle);
            affectedNodes.push(node);
        }
        async function randomizeChangeProps(instance) {
            const marker = '***';
            const cleanName = (name) => {
                const hash = name.indexOf('#');
                return (hash >= 0 ? name.slice(0, hash) : name).trim();
            };
            const isMarked = (name) => cleanName(name).endsWith(marker);
            const props = instance.componentProperties || {};
            const mainComponent = instance.mainComponent;
            if (mainComponent == null) {
                console.log('[Rambler-Content][Pixso] mainComponent is null', instance.name);
                return;
            }
            const componentSet = mainComponent.parent && mainComponent.parent.type === 'COMPONENT_SET'
                ? mainComponent.parent
                : null;
            // IMPORTANT: Pixso throws "Node can't be a variant!" when
            // componentPropertyDefinitions is read from a ComponentNode that itself is
            // a variant inside a ComponentSet. Therefore definitions are read ONLY from
            // the ComponentSet. Never touch mainComponent.componentPropertyDefinitions
            // for variant components.
            let setDefs = {};
            if (componentSet) {
                try {
                    setDefs = componentSet.componentPropertyDefinitions || {};
                }
                catch (error) {
                    console.log('[Rambler-Content][Pixso] component set definitions unavailable', {
                        instance: instance.name,
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
            }
            const getVariantOptionsFromSet = (apiKey) => {
                const visibleKey = cleanName(apiKey);
                const found = new Set();
                // Preferred: official ComponentSetNode definitions.
                for (const key of Object.keys(setDefs || {})) {
                    if (cleanName(key) !== visibleKey)
                        continue;
                    const def = setDefs[key];
                    if (def && def.type === 'VARIANT' && Array.isArray(def.variantOptions)) {
                        for (const value of def.variantOptions) {
                            if (typeof value === 'string')
                                found.add(value);
                        }
                    }
                }
                // Robust fallback: derive available values from every variant component.
                // ComponentNode.variantProperties is explicitly supported for variants.
                if (componentSet && found.size === 0) {
                    for (const child of componentSet.children) {
                        if (child.type !== 'COMPONENT')
                            continue;
                        const vp = child.variantProperties;
                        if (!vp)
                            continue;
                        for (const key of Object.keys(vp)) {
                            if (cleanName(key) === visibleKey && typeof vp[key] === 'string') {
                                found.add(vp[key]);
                            }
                        }
                    }
                }
                return Array.from(found);
            };
            const changes = {};
            for (const apiKey of Object.keys(props)) {
                if (!isMarked(apiKey))
                    continue;
                const prop = props[apiKey];
                if (prop == null)
                    continue;
                if (prop.type === 'VARIANT') {
                    const options = getVariantOptionsFromSet(apiKey);
                    if (options.length > 1) {
                        const current = String(prop.value);
                        const alternatives = options.filter((v) => v !== current);
                        const pool = alternatives.length > 0 ? alternatives : options;
                        changes[apiKey] = pick(pool);
                    }
                    else {
                        console.log('[Rambler-Content][Pixso] No variant options for', {
                            instance: instance.name,
                            apiKey,
                            current: prop.value,
                            options,
                            mainVariantProperties: mainComponent.variantProperties,
                        });
                    }
                }
                else if (prop.type === 'BOOLEAN') {
                    changes[apiKey] = !(prop.value === true);
                }
            }
            if (Object.keys(changes).length === 0) {
                console.log('[Rambler-Content][Pixso] No marked component properties found', {
                    instance: instance.name,
                    componentProperties: props,
                    mainVariantProperties: mainComponent.variantProperties,
                });
                return;
            }
            try {
                instance.setProperties(changes);
                affectedNodes.push(instance);
                console.log('[Rambler-Content][Pixso] Applied *** properties', {
                    instance: instance.name,
                    changes,
                });
            }
            catch (error) {
                console.log('[Rambler-Content][Pixso] setProperties failed', {
                    instance: instance.name,
                    changes,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }
        // Collect *img nodes for image replacement
        const imgNodesToFill = [];
        async function processNode(node) {
            const nameLower = node.name.toLowerCase();
            // Collect *img nodes (any node with fills, not TEXT)
            if (params.fillImg && nameLower.includes('*img') && node.type !== 'TEXT' && 'fills' in node) {
                imgNodesToFill.push(node);
            }
            if (node.type === 'TEXT') {
                const isTarget = targets.some((t) => nameLower.includes(t));
                if (!isTarget) {
                    // skip text nodes that don't match
                }
                else if (nameLower.includes('news-time') && params.fillNews) {
                    await processNewsTime(node);
                }
                else {
                    const len = node.characters.length;
                    const content = getContent(node.name, len);
                    if (content != null) {
                        if (len > 0) {
                            await loadAllFontsForNode(node);
                            node.characters = content;
                            affectedNodes.push(node);
                        }
                    }
                }
            }
            // Randomize *** properties on instances
            if (params.randomizeChange && node.type === 'INSTANCE' && node.name.trim().endsWith('***')) {
                await randomizeChangeProps(node);
            }
            if ('children' in node) {
                for (const child of node.children) {
                    await processNode(child);
                }
            }
        }
        for (const sel of selection) {
            await processNode(sel);
        }
        // Pixso's sandbox creates images from bytes. The UI iframe downloads the JPEG
        // (browser fetch is available there) and returns Uint8Array to the sandbox.
        if (imgNodesToFill.length > 0) {
            let imgLoaded = 0;
            for (const imgNode of imgNodesToFill) {
                const num = 1 + Math.floor(Math.random() * 220);
                const padded = String(num).padStart(5, '0');
                const url = 'https://lbbot.ru/img-' + padded + '.jpg';
                try {
                    const bytes = await requestImageBytes(url);
                    const image = pixso.createImage(bytes);
                    if ('fills' in imgNode) {
                        const existingFills = imgNode.fills;
                        const fillsArr = Array.isArray(existingFills) ? [...existingFills] : [];
                        let replaced = false;
                        for (let i = 0; i < fillsArr.length; i++) {
                            if (fillsArr[i].type === 'IMAGE') {
                                fillsArr[i] = { type: 'IMAGE', scaleMode: fillsArr[i].scaleMode || 'FILL', imageHash: image.hash };
                                replaced = true;
                                break;
                            }
                        }
                        if (!replaced)
                            fillsArr.push({ type: 'IMAGE', scaleMode: 'FILL', imageHash: image.hash });
                        imgNode.fills = fillsArr;
                        affectedNodes.push(imgNode);
                        imgLoaded++;
                    }
                }
                catch (error) {
                    console.log('[Content filler][Pixso] image load failed', url, error);
                }
            }
            if (imgLoaded > 0)
                pixso.notify('Loaded ' + imgLoaded + ' image' + (imgLoaded > 1 ? 's' : ''));
        }
        const count = affectedNodes.length;
        if (count === 0) {
            pixso.notify('No matching layers found');
        }
        else {
            pixso.notify('Filled ' + count + ' layer' + (count > 1 ? 's' : ''));
        }
    })();
    return { affectedNodes, state: null };
}
const imageRequests = new Map();
let imageRequestSeq = 0;
function requestImageBytes(url) {
    const requestId = 'img-' + (++imageRequestSeq);
    return new Promise((resolve, reject) => {
        imageRequests.set(requestId, { resolve, reject });
        pixso.ui.postMessage({ type: 'fetch-image', requestId, url });
    });
}
let pendingAiHeadlines;
let pendingAiDescriptions;
async function runAction_fill(target, notify) {
    isExecuting = true;
    try {
        const result = await action_fill(latestParams, target, null, pendingAiHeadlines, pendingAiDescriptions);
        pendingAiHeadlines = undefined;
        pendingAiDescriptions = undefined;
        attachRelaunch(result.affectedNodes);
        pushActionStates();
        if (notify) {
            pixso.notify(DISPLAY_NAME + " ran");
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        pixso.notify(message, { error: true });
        throw error;
    }
    finally {
        isExecuting = false;
    }
}
function pushActionStates() {
    const selection = pixso.currentPage.selection;
    const enabled_fill = evaluateEnabled_fill(pixso.currentPage.selection);
    pixso.ui.postMessage({
        type: 'action-state',
        actions: {
            "fill": { enabled: enabled_fill, label: "Fill content", status: status_fill(selection, enabled_fill) },
        },
    });
}
function refreshSelection() {
    if (isExecuting)
        return;
    pushActionStates();
}
const initialParams = DEFAULTS;
latestParams = initialParams;
const html = __html__;
pixso.root.setRelaunchData({ [TOOL_ID]: DISPLAY_NAME });
pixso.showUI(html, { width: 280, height: 320 });
pushActionStates();
pixso.on('selectionchange', refreshSelection);
pixso.ui.onmessage = (msg) => {
    if (msg.type === 'image-bytes') {
        const pending = imageRequests.get(msg.requestId);
        if (!pending)
            return;
        imageRequests.delete(msg.requestId);
        if (msg.error || !msg.bytes)
            pending.reject(new Error(msg.error || 'Image download failed'));
        else
            pending.resolve(msg.bytes);
        return;
    }
    if (msg.type === 'resize') {
        pixso.ui.resize(280, Math.max(120, Math.min(900, Math.round(msg.height))));
        return;
    }
    if (msg.type === 'action') {
        if (msg.id === "fill") {
            const target = actionTarget_fill();
            latestParams = normalizeParams(msg.params);
            pendingAiHeadlines = msg.aiHeadlines;
            pendingAiDescriptions = msg.aiDescriptions;
            void runAction_fill(target, true);
            return;
        }
        return;
    }
};
