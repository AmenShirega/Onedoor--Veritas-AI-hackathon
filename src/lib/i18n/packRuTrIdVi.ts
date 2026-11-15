import type { TranslationSchema } from './schema';

export const PACK_RU_TR_ID_VI: Record<'ru' | 'tr' | 'id' | 'vi', TranslationSchema> = {
  ru: {
    brandName: 'OneDoor',
    nav: {
      home: 'Главная',
      getSupport: 'Получить помощь',
      about: 'О проекте и безопасность',
      menu: 'Меню',
      close: 'Закрыть',
      mainNavAria: 'Основная навигация',
    },
    languageSelector: {
      buttonAria: 'Выбрать язык',
      searchPlaceholder: 'Поиск языка...',
      noResults: 'Подходящий язык не найден.',
      mlLanguageBadge: 'Интерфейс переведён · ML-модель оценивает только английский текст',
    },
    quickExit: 'Быстрый выход',
    quickExitHint: 'Немедленно покинуть сайт (история браузера не очищается).',
    emergencyBanner:
      'OneDoor пока не подключён к экстренным службам или внешним клиникам. Если вы находитесь в непосредственной опасности в любой стране мира, обратитесь в местную службу экстренной помощи или к человеку, которому доверяете.',
    disclaimerExact: 'This project is a prototype and is not medical advice.',
    disclaimerLocalNote:
      'Уведомление о прототипе: платформа не предоставляет медицинскую, юридическую или экстренную диагностику.',
    hero: {
      kicker: 'Международная точка входа за помощью · Конфиденциально по замыслу',
      title: 'Один спокойный вход, чтобы организовать нужную помощь, не повторяя свою историю.',
      subtitle:
        'Опишите произошедшее своими словами — письменно или голосом. Обученный классификатор структурирует ваши потребности, проверит наличие проверенных служб для вашего города или страны и позволит отредактировать и сохранить резюме обращения под вашим полным контролем.',
      primaryCta: 'Получить помощь сейчас',
      talkCta: 'Сказать голосом',
      secondaryCta: 'Узнать о безопасности и статусе работы',
      doorwayAria: 'Анимация арочного дверного проёма OneDoor, мягко открывающегося к тёплому свету',
    },
    howItWorks: {
      title: 'Как OneDoor помогает шаг за шагом',
      subtitle:
        'Контроль остаётся у вас на каждом этапе. Делитесь только тем, что кажется безопасным — регистрация и имя не требуются.',
      steps: [
        {
          num: '01.',
          title: 'Расскажите в удобном темпе',
          body: 'Напишите или продиктуйте, что произошло. Можно пропустить имена, адреса и любые личные подробности.',
        },
        {
          num: '02.',
          title: 'Проверьте структурированные потребности',
          body: 'Обученная ML-модель выделяет медицинскую, защитную, юридическую, психологическую или социальную поддержку и честно показывает уровень уверенности.',
        },
        {
          num: '03.',
          title: 'Отредактируйте и сохраните резюме',
          body: 'Отредактируйте итоговый текст, скопируйте или скачайте его либо сохраните с приватным кодом, который можно удалить в любой момент.',
        },
      ],
    },
    categoriesSection: {
      title: 'Шесть направлений поддержки, которые помогает определить OneDoor',
      subtitle:
        'Нужна ли срочная медицинская помощь, эмоциональная поддержка, юридическая консультация или убежище — OneDoor переводит обычный рассказ в понятные шаги.',
    },
    categories: {
      medical_support: {
        label: 'Медицинская помощь',
        shortDesc: 'Конфиденциальная помощь при травмах, боли, экстренной контрацепции или срочной постконтактной профилактике.',
      },
      psychological_support: {
        label: 'Психологическая помощь',
        shortDesc: 'Травма-информированное консультирование, стабилизация паники и эмоциональная поддержка.',
      },
      protection_safeguarding: {
        label: 'Защита и безопасность',
        shortDesc: 'Срочное планирование безопасности, варианты убежища и защита несовершеннолетних.',
      },
      legal_support: {
        label: 'Юридическая помощь',
        shortDesc: 'Разъяснение охранных ордеров, домогательств на работе, опеки и прав на обращение.',
      },
      sexual_violence_support: {
        label: 'Помощь при сексуализированном насилии',
        shortDesc: 'Специализированная клиническая помощь, судебно-медицинские опции и кризисное сопровождение.',
      },
      social_support: {
        label: 'Социальная поддержка',
        shortDesc: 'Временное жильё, предметы первой необходимости или оплата дороги, уход за детьми и бытовая помощь.',
      },
    },
    safetySection: {
      title: 'Построено на вашей автономии и честных границах системы',
      cta: 'Безопасность, конфиденциальность и статус работы',
      items: [
        {
          title: 'Никогда не решает за вас',
          body: 'OneDoor никогда не указывает уходить, оставаться, конфликтовать или подавать заявление. Решения принимаете только вы и квалифицированные специалисты.',
        },
        {
          title: 'Явное согласие и минимум данных',
          body: 'Сохраняются только проверенные и одобренные вами поля и резюме. Исходный текст не логируется и не отправляется автоматически.',
        },
        {
          title: 'Честность о местном каталоге',
          body: 'Мы никогда не выдумываем организации или номера телефонов и не делаем вид, что обращение отправлено, если проверенных партнёров в регионе пока нет.',
        },
      ],
    },
    visualShowcase: {
      welcomeAlt: 'Залитый солнцем арочный проём, ведущий в спокойный внутренний дворик с зеленью',
      welcomeCaption: 'Спокойный конфиденциальный вход без необходимости повторять историю.',
      privacyAlt: 'Руки аккуратно проверяют сложенный документ у светлого окна',
      privacyCaption: 'Вы проверяете и редактируете каждое слово до сохранения.',
      communityAlt: 'Два человека в спокойной беседе рядом с общественным павильоном',
      communityCaption: 'Связь обычных человеческих запросов с профильной помощью.',
      globalAlt: 'Арочный дверной проём в сочетании с линиями карты мира и путеводным светом',
      globalCaption: 'Создано для международного использования с честным указанием доступности служб.',
      heroPhotoAlt: 'Две женщины сидят на тихой садовой скамейке и спокойно беседуют за чашкой чая среди зелени',
      counselorPhotoAlt: 'Консультант внимательно и уважительно слушает собеседника за деревянным столом в светлой комнате',
      counselorPhotoCaption: 'Живая поддержка, основанная на спокойном выслушивании без осуждения и давления.',
      calmPortraitAlt: 'Человек спокойно сидит у солнечного окна с чашкой чая и открытой тетрадью',
      pathwayCareAlt: 'Иллюстрация уютной комнаты поддержки с бирюзовыми арочными дверями, тёплой лампой и двумя чашками чая',
      pathwayCareCaption: 'Продуманные маршруты медицинской, правовой, защитной и повседневной практической помощи.',
      intakeDeskAlt: 'Иллюстрация уединённого деревянного письменного стола с блокнотом и ручкой у светлого арочного окна',
      intakeDeskCaption: 'Не торопитесь — напишите или расскажите вслух в своём темпе, прежде чем решать, чем делиться.',
    },
    location: {
      sectionTitle: 'Ваше местоположение (необязательно, по умолчанию вручную)',
      privacyWhy:
        'Используется только для проверки наличия проверенных служб в вашем городе или стране. Точный адрес не требуется, а координаты GPS удаляются сразу после определения района.',
      searchLabel: 'Поиск города, региона, индекса или страны',
      searchPlaceholder: 'Введите город, индекс или страну (напр.: Лондон, Торонто, Алматы)...',
      searching: 'Поиск местоположений...',
      noSuggestions: 'Совпадения не найдены. Вы можете указать страну и город вручную ниже.',
      autocompleteError:
        'Автозаполнение местоположения временно недоступно. Вы можете ввести страну и город вручную ниже.',
      manualFieldsTitle: 'Или введите данные о местоположении вручную',
      countryLabel: 'Страна',
      countryPlaceholder: 'напр.: Великобритания, Германия, Казахстан',
      cityLabel: 'Город / населённый пункт',
      cityPlaceholder: 'напр.: Манчестер, Берлин, Алматы',
      regionLabel: 'Регион / область (необязательно)',
      regionPlaceholder: 'напр.: Онтарио, Бавария',
      postalLabel: 'Почтовый индекс (необязательно)',
      postalPlaceholder: 'напр.: SW1A, 10001',
      confirmManualButton: 'Подтвердить введённое местоположение',
      manualValidationError: 'Пожалуйста, укажите хотя бы страну или город для подтверждения.',
      useGpsButton: 'Определить моё текущее местоположение',
      gpsDetecting: 'Запрос разрешения и поиск приблизительного города/страны...',
      gpsPrivacyNote:
        'Разрешение запрашивается только при нажатии. Координаты никогда не сохраняются в URL или логах сервера.',
      detectedTitle: 'Определено приблизительное местоположение — пожалуйста, подтвердите:',
      confirmDetectedButton: 'Подтвердить это местоположение',
      dismissDetectedButton: 'Отклонить / Ввести вручную',
      confirmedLabel: 'Подтверждённое местоположение:',
      editButton: 'Изменить',
      clearButton: 'Очистить (Не указывать)',
      preferNotToShare: 'Местоположение не указано — продолжаем без привязки к месту.',
      errUnavailable: 'Геолокация браузера недоступна на этом устройстве. Пожалуйста, введите местоположение вручную.',
      errDenied: 'Доступ к геолокации отклонён. Вы можете в любое время указать страну и город вручную.',
      errPositionUnavailable:
        'Службы геолокации отключены или недоступны. Пожалуйста, введите местоположение вручную.',
      errTimeout: 'Время ожидания определения местоположения истекло. Введите вручную или повторите попытку.',
      errReverseFailed:
        'Не удалось преобразовать координаты в название места. Пожалуйста, введите город или страну вручную.',
      errIncomplete:
        'По координатам не удалось чётко определить город или страну. Пожалуйста, уточните вручную.',
    },
    intake: {
      confidentialKicker: 'Конфиденциальный запрос помощи · Без регистрации · Без загрузки фото',
      title: 'Расскажите, что произошло',
      subtitle:
        'Делитесь только тем, чем считаете безопасным. Учётная запись не нужна, а ваш текст никогда не записывается в логи сервера.',
      privacyReassurance:
        'Вам не нужно указывать настоящее имя, телефон или точный адрес. Вы контролируете каждое слово итогового резюме.',
      englishClassifierNote:
        'Примечание о языке модели: интерфейс работает на выбранном вами языке, однако обученный ML-классификатор сейчас оценивает только текст на английском языке.',
      modeWrite: 'Написать описание',
      modeTalk: 'Сказать голосом',
      descriptionLabel: 'Что произошло или какая помощь вам сейчас нужна?',
      descriptionPlaceholder:
        'Опишите ситуацию своими словами — например, травмы, безопасность на ночь, юридические вопросы или сильная тревога...',
      minorCheckbox: 'Ситуация затрагивает несовершеннолетнего (младше 18 лет — включает уведомление о защите детей)',
      nothingSavedNote: 'На этом этапе ничего не сохраняется и не передаётся автоматически.',
      submitButton: 'Подобрать варианты помощи',
      analyzingButton: 'Анализ потребностей в помощи...',
      minLengthError: 'Пожалуйста, напишите или продиктуйте минимум 3 символа, чтобы OneDoor мог подобрать варианты.',
      networkError: 'Ошибка соединения при обработке запроса. Пожалуйста, попробуйте ещё раз.',
      resultsKicker: 'Обученный классификатор TF-IDF + Logistic Regression',
      resultsTitle: 'Предложенные направления помощи',
      refineButton: 'Сформировать мягкое пояснение и резюме',
      refiningButton: 'Подготовка мягкого пояснения...',
      geminiUsedBadge: 'Формулировка улучшена с Gemini (классификация выполнена локальной ML-моделью)',
      urgencyTitlePrefix: 'Отмечена возможная срочность (оценка ML: {pct}%)',
      urgencyNotice:
        'Автоматическая модель заметила возможную срочность. Это не профессиональная медицинская или кризисная оценка — если вам угрожает непосредственная опасность, обратитесь в местные экстренные службы.',
      minorTitle: 'Напоминание о защите несовершеннолетних',
      minorSafeguardingNote:
        'Уведомление о защите: когда ситуация касается лица младше 18 лет, действуют дополнительные правовые меры защиты детей, требующие участия профильных специалистов.',
      uncertaintyTitle: 'Прозрачность модели и уровень уверенности',
      confidenceLabel: 'Уровень уверенности:',
      confidenceLow: 'Низкий (открыты широкие варианты помощи)',
      confidenceUncertain: 'Неопределённый / смешанные сигналы',
      confidenceClear: 'Более чёткий текстовый сигнал',
      defaultExplanationLow:
        'Обученный классификатор показал низкую уверенность по части вашего сообщения — это часто бывает при кратких, косвенных или неанглийских формулировках. Все основные направления ниже остаются доступными для выбора.',
      defaultExplanationNormal:
        'На основе обучающих паттернов ML-модель выделила: {needs}{urgent}. Вы можете изменить любые категории ниже перед составлением резюме.',
      defaultSummaryTemplate:
        'Запрос о помощи{location}: требуется {needs}.{urgent}{minor} Человек предпочитает рассмотреть варианты без повторения всех подробностей.',
      nonEnglishModelNote:
        'Обученный ML-классификатор анализирует только английский текст. Поскольку обнаружен неанглийский шрифт, уверенность модели снижена и все общие направления остаются открытыми для вашего выбора.',
      adjustNeedsPrompt: 'Отметьте или снимите категории помощи, чтобы уточнить резюме и поиск служб:',
      statusSuggested: 'Рекомендовано',
      statusUncertain: 'Неопределённо',
      statusBelow: 'Ниже порога',
      keywordsLabel: 'Замеченные ключевые слова:',
      centersKicker: 'Международный подбор служб поддержки',
      centersTitle: 'Статус местных служб поддержки',
      noVerifiedForLocationTitle: 'Для локации «{location}» проверенные местные службы пока не подключены',
      noVerifiedForLocationBody:
        'OneDoor никогда не выдумывает организации, адреса и телефоны. Алгоритм проверил каталог для «{location}» — подтверждённых партнёров пока нет. Вы всё равно можете подготовить и скачать редактируемое резюме ниже для самостоятельного обращения.',
      noLocationSharedTitle: 'Местоположение не указано — честный статус каталога',
      noLocationSharedBody:
        'Вы предпочли не указывать местоположение, а проверенные международные партнёры пока не добавлены. Вы можете указать город или страну выше или подготовить личное резюме ниже.',
      rankPrefix: 'Позиция #{rank}',
      matchPrefix: 'Совпадение {score}',
      whyMatched: 'Почему подходит:',
      selectPathway: 'Выбрать службу',
      selectedPathway: 'Выбранная служба',
      referralKicker: 'Резюме с вашего согласия · Сохраняется локально до интеграции партнёров',
      referralTitle: 'Проверка, редактирование и сохранение резюме',
      referralSubtitle:
        'Отредактируйте каждую деталь ниже перед сохранением. Сохранение создаёт приватный код, с помощью которого можно скопировать, скачать, открыть или удалить запись в любое время.',
      selectedServiceLabel: 'Выбранный получатель / формат:',
      selfDirectedLabel: 'Личное резюме обращения (готово для копирования или скачивания для любой местной службы)',
      summaryEditorLabel: 'Точный текст резюме (отредактируйте или удалите всё лишнее)',
      includeLocationLabel: 'Включить подтверждённое местоположение:',
      notProvided: 'Не указано',
      includeUrgencyLabel: 'Включить отметку о срочности:',
      flaggedLabel: 'Отмечено',
      notFlaggedLabel: 'Не отмечено',
      previewTitle: 'Точные поля, которые войдут в сохранённое резюме:',
      previewNeeds: 'Потребности в помощи:',
      previewLocation: 'Местоположение:',
      previewUrgency: 'Отметка о срочности:',
      previewRawText: 'Исходный текст сохраняется?',
      noneSelected: 'Ничего не выбрано',
      notIncluded: 'Не включено',
      urgencySummaryValue: 'Возможная срочная необходимость',
      noRawSavedValue: 'Нет (сохраняется только отредактированное резюме выше).',
      consentCheckbox:
        'Я проверил(а) текст выше и подтверждаю, что именно эти выбранные сведения могут быть сохранены в моей записи обращения.',
      sendReferralButton: 'Подтвердить и сохранить резюме',
      savingButton: 'Сохранение резюме...',
      savedStatusLabel: 'Сохранено локально (во внешние службы не отправлено)',
      referencePrefix: 'Код:',
      savedBodyPrefix: 'Ваше отредактированное резюме сохранено под приватным кодом для:',
      savedBodySuffix:
        'Поскольку внешние партнёрские каналы здесь ещё не подключены, запись не была отправлена автоматически — вы можете скопировать или скачать её ниже либо удалить в любой момент.',
      copySummary: 'Копировать резюме',
      copiedSummary: 'Резюме скопировано',
      downloadSummary: 'Скачать резюме (.txt)',
      withdrawRecord: 'Отозвать и удалить запись',
      readinessLink: 'Подробности о готовности системы',
      withdrawnConfirmation: 'Сохранённая запись {code} безвозвратно удалена из хранилища OneDoor.',
      lookupTitle: 'Найти или удалить сохранённое обращение',
      lookupSubtitle:
        'Сохранённые записи никогда не публикуются в общем списке. Введите приватный код OD-REF-XXXXXX, чтобы просмотреть, скачать или окончательно удалить запись.',
      lookupToggleOpen: 'Ввести код обращения',
      lookupToggleClose: 'Скрыть поиск',
      lookupPlaceholder: 'OD-REF-123456',
      lookupButton: 'Найти запись',
      lookupChecking: 'Проверка...',
      lookupEmptyError: 'Введите код обращения (например, OD-REF-123456).',
      lookupDeleteButton: 'Удалить навсегда',
    },
    voice: {
      kicker: 'Голосовой ввод в браузере · Не является горячей линией',
      title: 'Продиктуйте описание',
      audioOn: 'Звук включён',
      audioMuted: 'Звук выключен',
      guidancePrompt:
        'Говорите в спокойном для себя темпе, когда будете готовы. Делитесь только тем, что безопасно — имена и точные адреса необязательны, а каждое слово можно отредактировать перед подбором помощи.',
      readyStatus: 'Нажмите на микрофон для диктовки или введите текст прямо ниже.',
      unsupportedStatus: 'Распознавание речи недоступно в этом браузере. Вы можете ввести текст прямо в поле ниже.',
      stoppedStatus: 'Микрофон остановлен. Проверьте или отредактируйте текст ниже.',
      listeningStatus: 'Идёт запись с микрофона браузера... Говорите спокойно в своём темпе.',
      micErrorPrefix: 'Микрофон недоступен ({error}). Вы можете ввести текст прямо ниже.',
      startMic: 'Включить микрофон',
      stopMic: 'Остановить микрофон',
      readAloud: 'Озвучить подсказку',
      transcriptLabel: 'Распознанный текст (отредактируйте или очистите перед подбором)',
      transcriptPlaceholder: 'Сказанные слова появятся здесь, либо введите текст вручную...',
      submitButton: 'Подобрать варианты помощи',
    },
    about: {
      kicker: 'Безопасность, готовность к работе, конфиденциальность и международная архитектура',
      title: 'О платформе OneDoor',
      intro:
        'OneDoor — это международная платформа навигации за поддержкой с приоритетом конфиденциальности, помогающая людям, столкнувшимся с насилием или домогательствами, структурировать потребности и подготовить резюме обращения без многократного пересказа своей истории.',
      disclaimerTitle: 'Прототип и медицинская оговорка',
      disclaimerBody:
        'OneDoor не является службой экстренного реагирования и не ставит медицинских, психологических или юридических диагнозов. Сохранённые резюме хранятся только на этой платформе до подключения проверенных местных партнёров.',
      worksTitle: 'Что уже работает сейчас',
      worksItems: [
        {
          title: 'Обученный ML-классификатор',
          body: 'Модель TF-IDF + L2 Logistic Regression распределяет английские описания по 6 направлениям помощи и отмечает возможную срочность с понятными индикаторами уверенности.',
        },
        {
          title: 'Глобальный поиск местоположения и сопоставление',
          body: 'Поддерживает ручной поиск по стране/городу/региону/индексу, опциональное обратное геокодирование по разрешению и фильтрацию проверенного каталога.',
        },
        {
          title: 'Локализация на 20 языков (включая RTL)',
          body: 'Мгновенное переключение между 20 языками, включая арабский и урду с направлением справа налево, с сохранением выбора между визитами.',
        },
        {
          title: 'Резюме с явным согласием',
          body: 'Редактирование каждого слова, выбор полей, копирование и скачивание (.txt), а также сохранение и удаление по приватному коду OD-REF-XXXXXX.',
        },
      ],
      notYetTitle: 'Что ещё не готово к полноценному запуску',
      notYetItems: [
        {
          title: 'Проверенный международный каталог служб',
          body: 'Реальные клиники, шелтеры, кризисные центры и юридические службы в каждой стране должны пройти верификацию перед публикацией контактов.',
        },
        {
          title: 'Передача обращений во внешние организации',
          body: 'Сейчас сохранение создаёт локальную запись с кодом; автоматическая отправка во внешние службы не выполняется.',
        },
        {
          title: 'Многоязычное обучение ML',
          body: 'Интерфейс переведён на 20 языков, но ML-классификатор обучен только на английском языке и честно предупреждает об этом.',
        },
        {
          title: 'Аудит безопасности и клиническая проверка',
          body: 'Промышленный запуск требует сквозного шифрования, тестирования на проникновение, юридической/клинической экспертизы и протоколов защиты детей.',
        },
      ],
      safeguardingTitle: 'Несовершеннолетние и защита детей',
      safeguardingBody:
        'Если ситуация касается человека младше 18 лет, действуют особые правовые требования и протоколы защиты детей, требующие участия профильных специалистов.',
      quickExitTitle: 'Быстрый выход и приватность браузера',
      quickExitBody:
        'Кнопка «Быстрый выход» на каждой странице мгновенно перенаправляет на нейтральный сайт погоды с заменой текущей записи истории. Она не очищает историю браузера — по возможности используйте приватное окно.',
      directoryTitle: 'Статус проверенного каталога служб',
      directoryBody:
        'Чтобы не вводить людей в заблуждение, OneDoor не публикует непроверенные или вымышленные организации. Подтверждённые службы появятся строго для соответствующих стран и городов.',
      architectureTitle: 'Архитектура и ответственное обращение с данными',
      architectureItems: [
        {
          title: 'Этика обучающих данных',
          body: 'Внутренняя ML-модель обучена исключительно на 200 синтетических описаниях — никогда на реальных личных историях.',
        },
        {
          title: 'Приватность координат и текста',
          body: 'Исходный текст и GPS-координаты никогда не записываются в логи сервера и не передаются в URL.',
        },
        {
          title: 'Приватные коды доступа',
          body: 'Сохранённые резюме не имеют публичного списка и доступны только по индивидуальному коду обращения.',
        },
      ],
    },
    footer: {
      navigationTitle: 'Навигация',
      safetyTitle: 'Безопасность и язык',
      prototypeNote:
        'OneDoor не публикует непроверенные организации или вымышленные контакты; каталог заполняется только по мере верификации реальных партнёров.',
      languageNotice: 'Доступно на 20 языках · ML-классификатор сейчас оценивает английский текст.',
    },
  },

  tr: {
    brandName: 'OneDoor',
    nav: {
      home: 'Ana Sayfa',
      getSupport: 'Destek Al',
      about: 'Hakkında ve Güvenlik',
      menu: 'Menü',
      close: 'Kapat',
      mainNavAria: 'Ana gezinme',
    },
    languageSelector: {
      buttonAria: 'Dil seçin',
      searchPlaceholder: 'Dil ara...',
      noResults: 'Eşleşen dil bulunamadı.',
      mlLanguageBadge: 'Arayüz çevrildi · ML sınıflandırıcısı yalnızca İngilizce metni değerlendirir',
    },
    quickExit: 'Hızlı Çıkış',
    quickExitHint: 'Bu siteden hemen ayrılır (tarayıcı geçmişini silmez).',
    emergencyBanner:
      'OneDoor henüz canlı acil durum hatlarına veya dış kliniklere bağlı değildir. Dünyanın herhangi bir yerinde acil tehlikedeyseniz lütfen yerel acil servislere veya yakınınızdaki güvenilir bir kişiye ulaşın.',
    disclaimerExact: 'This project is a prototype and is not medical advice.',
    disclaimerLocalNote:
      'Prototip uyarısı: Bu platform tıbbi, hukuki veya acil durum tanısı sunmaz.',
    hero: {
      kicker: 'Küresel Destek Giriş Noktası · Tasarım Gereği Gizli',
      title: 'Hikayenizi tekrarlamadan doğru desteği düzenlemek için sakin bir kapı.',
      subtitle:
        'Yaşadıklarınızı yazarak veya konuşarak kendi kelimelerinizle anlatın. Eğitilmiş sınıflandırıcımız destek ihtiyaçlarınızı düzenler, konumunuz için doğrulanmış hizmetlerin durumunu kontrol eder ve tamamen sizin kontrolünüzde yönlendirme özetinizi düzenleyip kaydetmenizi sağlar.',
      primaryCta: 'Şimdi Destek Al',
      talkCta: 'Sesli Anlat',
      secondaryCta: 'Güvenlik ve çalışma durumunu oku',
      doorwayAria: 'Sıcak iç ışığa doğru nazikçe açılan animasyonlu OneDoor kemerli kapısı',
    },
    howItWorks: {
      title: 'OneDoor adım adım nasıl destek olur',
      subtitle:
        'Her aşamada kontrol sizdedir. Yalnızca güvende hissettiğiniz bilgileri paylaşın—hesap veya kimlik gerekmez.',
      steps: [
        {
          num: '01.',
          title: 'Kendi hızınızda paylaşın',
          body: 'Ne olduğunu yazın veya sesle dikte edin. İsimleri, açık adresleri veya gizli tutmak istediğiniz ayrıntıları atlayabilirsiniz.',
        },
        {
          num: '02.',
          title: 'Düzenlenmiş destek ihtiyaçlarını inceleyin',
          body: 'Eğitilmiş ML modeli tıbbi, koruma, hukuki, psikolojik veya sosyal ihtiyaçları gruplar ve belirsizlikleri dürüstçe gösterir.',
        },
        {
          num: '03.',
          title: 'Özetinizi düzenleyin, kaydedin ve yanınıza alın',
          body: 'Yönlendirme özetinizi gözden geçirip düzenleyin, kopyalayın veya indirin ya da istediğiniz zaman silebileceğiniz özel bir referans koduyla kaydedin.',
        },
      ],
    },
    categoriesSection: {
      title: 'OneDoor’un düzenlemeye yardımcı olduğu altı destek yolu',
      subtitle:
        'Acil tıbbi bakım, duygusal destek veya hukuki ya da barınma rehberliği arıyor olun, OneDoor günlük anlatımı yapılandırılmış sonraki adımlara dönüştürür.',
    },
    categories: {
      medical_support: {
        label: 'Tıbbi destek',
        shortDesc: 'Yaralanmalar, ağrı, acil kontrasepsiyon veya zamana duyarlı maruziyet sonrası bakım için gizli destek.',
      },
      psychological_support: {
        label: 'Psikolojik destek',
        shortDesc: 'Travma duyarlı danışmanlık, panik yatıştırma ve duygusal bakım.',
      },
      protection_safeguarding: {
        label: 'Koruma ve güvenlik',
        shortDesc: 'Acil güvenlik planlaması, güvenli barınma seçenekleri ve çocuk koruma.',
      },
      legal_support: {
        label: 'Hukuki destek',
        shortDesc: 'Koruma kararları, işyeri tacizi, velayet ve bildirim hakları konusunda rehberlik.',
      },
      sexual_violence_support: {
        label: 'Cinsel şiddet desteği',
        shortDesc: 'Uzman hayatta kalan odaklı klinik bakım, adli seçenekler ve kriz savunuculuğu.',
      },
      social_support: {
        label: 'Sosyal destek',
        shortDesc: 'Geçici barınma, acil temel ihtiyaçlar veya ulaşım desteği, çocuk bakımı ve geçim bağlantıları.',
      },
    },
    safetySection: {
      title: 'Özerkliğiniz ve dürüst sistem sınırları üzerine kurulu',
      cta: 'Güvenlik, Gizlilik ve Çalışma Durumu',
      items: [
        {
          title: 'Sizin yerinize asla karar vermez',
          body: 'OneDoor size asla ayrılmanızı, kalmanızı, biriyle yüzleşmenizi veya şikayette bulunmanızı söylemez. Karar her zaman sizde ve uzmanlardadır.',
        },
        {
          title: 'Açık rıza ve veri minimizasyonu',
          body: 'Yalnızca inceleyip onayladığınız özet ve alanlar kaydedilir. Ham anlatımlar asla günlüğe kaydedilmez veya otomatik gönderilmez.',
        },
        {
          title: 'Yerel dizin durumu konusunda dürüstlük',
          body: 'Henüz doğrulanmış yerel bir ortak yoksa asla uydurma kurumlar veya telefon numaraları göstermeyiz.',
        },
      ],
    },
    visualShowcase: {
      welcomeAlt: 'Huzurlu bir bahçe avlusuna açılan güneşli kemerli kapı',
      welcomeCaption: 'Hikayenizi tekrarlamadan sakin ve gizli bir başlangıç.',
      privacyAlt: 'Aydınlık bir pencerenin yanında kişisel özet belgesini dikkatle inceleyen eller',
      privacyCaption: 'Herhangi bir şey kaydedilmeden önce her kelimeyi siz kontrol edersiniz.',
      communityAlt: 'Sakin bir topluluk köşkünün yanında duran iki destekleyici kişi',
      communityCaption: 'Günlük dildeki ihtiyaçları yapılandırılmış destek yollarıyla buluşturur.',
      globalAlt: 'Dünya haritası çizgileri ve yol gösteren ışık hatlarıyla birleşen kemerli kapı',
      globalCaption: 'Şeffaf yerel dizin sınırlarıyla uluslararası kullanım için tasarlandı.',
      heroPhotoAlt: 'Sakin bir bahçe bankında yeşillikler içinde çay eşliğinde içtenlikle sohbet eden iki kadın',
      counselorPhotoAlt: 'Güneş alan bir destek ofisinde ahşap masa başında saygıyla ve dikkatle dinleyen bir danışman',
      counselorPhotoCaption: 'Yargılamadan ve baskı kurmadan sakin dinlemeye dayanan insani destek.',
      calmPortraitAlt: 'Güneşli bir pencere kenarında çay ve açık bir defterle huzurlu bir anda oturan bir kişi',
      pathwayCareAlt: 'Koyu teal kemerli kapılar, sıcak kehribar lamba ışığı ve iki çay fincanıyla sakin bir bakım odası illüstrasyonu',
      pathwayCareCaption: 'Tıbbi, hukuki, koruma ve günlük pratik desteği kapsayan yapılandırılmış destek yolları.',
      intakeDeskAlt: 'Güneşli kemerli bir pencerenin yanında günlük ve kalemin bulunduğu özel ahşap yazı masası illüstrasyonu',
      intakeDeskCaption: 'Acele etmeyin — neleri paylaşacağınızı seçmeden önce kendi hızınızda gizlice yazın veya konuşun.',
    },
    location: {
      sectionTitle: 'Konumunuz (isteğe bağlı, varsayılan olarak manuel)',
      privacyWhy:
        'Yalnızca şehrinizde veya ülkenizde doğrulanmış hizmetlerin bulunup bulunmadığını kontrol etmek için kullanılır. Sokak adresi gerekmez ve GPS koordinatları arama sonrası hemen silinir.',
      searchLabel: 'Şehir, bölge, posta kodu veya ülke ara',
      searchPlaceholder: 'Şehir, posta kodu veya ülke yazın (örn. İstanbul, Londra, Toronto)...',
      searching: 'Konumlar aranıyor...',
      noSuggestions: 'Otomatik tamamlama sonucu bulunamadı. Ülke ve şehri aşağıya manuel girebilirsiniz.',
      autocompleteError:
        'Konum otomatik tamamlama geçici olarak kullanılamıyor. Ülke ve şehri aşağıya manuel girebilirsiniz.',
      manualFieldsTitle: 'Veya konum bilgilerini manuel girin',
      countryLabel: 'Ülke',
      countryPlaceholder: 'örn. Türkiye, Birleşik Krallık, Almanya',
      cityLabel: 'Şehir / İlçe',
      cityPlaceholder: 'örn. İstanbul, Ankara, Manchester',
      regionLabel: 'Bölge / Eyalet (isteğe bağlı)',
      regionPlaceholder: 'örn. Marmara, Ontario',
      postalLabel: 'Posta kodu (isteğe bağlı)',
      postalPlaceholder: 'örn. 34000, SW1A',
      confirmManualButton: 'Manuel Konumu Onayla',
      manualValidationError: 'Konumunuzu onaylamak için lütfen en azından bir ülke veya şehir girin.',
      useGpsButton: 'Mevcut konumumu kullan',
      gpsDetecting: 'İzin isteniyor ve yaklaşık şehir/ülke aranıyor...',
      gpsPrivacyNote:
        'Yalnızca tıklandığında izin ister. Koordinatlar asla URL’lere veya sunucu günlüklerine kaydedilmez.',
      detectedTitle: 'Yaklaşık konum algılandı — lütfen onaylayın:',
      confirmDetectedButton: 'Bu Konumu Onayla',
      dismissDetectedButton: 'Reddet / Manuel Gir',
      confirmedLabel: 'Onaylanan konum:',
      editButton: 'Düzenle',
      clearButton: 'Temizle (Paylaşmak istemiyorum)',
      preferNotToShare: 'Konum paylaşılmadı — konum olmadan devam ediliyor.',
      errUnavailable: 'Bu cihazda tarayıcı konum servisi kullanılamıyor. Lütfen konumu manuel girin.',
      errDenied: 'Konum izni reddedildi. İstediğiniz zaman ülke ve şehrinizi manuel girebilirsiniz.',
      errPositionUnavailable:
        'Konum servisleri şu anda kapalı veya kullanılamıyor görünüyor. Lütfen konumunuzu manuel girin.',
      errTimeout: 'Konum belirleme zaman aşımına uğradı. Lütfen manuel girin veya tekrar deneyin.',
      errReverseFailed:
        'Koordinatlar okunabilir bir yer adına dönüştürülemedi. Lütfen şehir veya ülkeyi manuel girin.',
      errIncomplete:
        'Algılanan koordinatlar net bir şehir veya ülke döndürmedi. Lütfen konumunuzu manuel girin.',
    },
    intake: {
      confidentialKicker: 'Gizli Destek Başvurusu · Hesap Gerekmez · Fotoğraf Yüklenmez',
      title: 'Ne olduğunu anlatın',
      subtitle:
        'Yalnızca güvenli ve rahat hissettiğiniz bilgileri paylaşın. Hesap gerekmez ve açıklamanız sunucuda asla günlüğe kaydedilmez.',
      privacyReassurance:
        'Gerçek adınızı, telefon numaranızı veya açık sokak adresinizi paylaşmanız gerekmez. Son özetin her kelimesi sizin kontrolünüzdedir.',
      englishClassifierNote:
        'Model dil notu: Arayüz seçtiğiniz dilde çalışır; ancak eğitilmiş ML sınıflandırıcısı şu anda yalnızca İngilizce açıklamaları değerlendirir.',
      modeWrite: 'Açıklama yaz',
      modeTalk: 'Konuş (Sesli Giriş)',
      descriptionLabel: 'Ne oldu veya nasıl bir yardım arıyorsunuz?',
      descriptionPlaceholder:
        'Durumunuzu kendi kelimelerinizle anlatın—örneğin yaralanmalar, bu gece güvenlik, hukuki sorular veya duygusal sıkıntı...',
      minorCheckbox: 'Bu durum 18 yaşından küçük birini içeriyor (çocuk koruma uyarısını tetikler)',
      nothingSavedNote: 'Bu adımda hiçbir şey otomatik olarak kaydedilmez veya paylaşılmaz.',
      submitButton: 'Destek Seçeneklerini Düzenle',
      analyzingButton: 'Destek ihtiyaçları düzenleniyor...',
      minLengthError: 'OneDoor’un seçenekleri düzenleyebilmesi için lütfen en az 3 karakter yazın veya söyleyin.',
      networkError: 'Destek seçenekleri düzenlenirken bağlantı hatası oluştu. Lütfen tekrar deneyin.',
      resultsKicker: 'Eğitilmiş TF-IDF + Lojistik Regresyon Sınıflandırıcısı',
      resultsTitle: 'Önerilen Destek Yolları',
      refineButton: 'Nazik Açıklama ve Özet Oluştur',
      refiningButton: 'Nazik açıklama hazırlanıyor...',
      geminiUsedBadge: 'Özet Gemini ile ifade edildi (sınıflandırma yerel ML olarak kalır)',
      urgencyTitlePrefix: 'Zamana duyarlı olası aciliyet işaretlendi (ML puanı: %{pct})',
      urgencyNotice:
        'Otomatik model olası bir zaman duyarlılığı fark etti. Bu profesyonel bir tıbbi veya güvenlik değerlendirmesi değildir—acil tehlikedeyseniz yerel acil yardıma başvurun.',
      minorTitle: 'Reşit Olmayanlar ve Koruma Hatırlatması',
      minorSafeguardingNote:
        'Koruma uyarısı: 18 yaşın altındaki bir kişi etkilendiğinde ek çocuk koruma prosedürleri uygulanır. Gerçek müdahale eğitimli uzmanlar gerektirir.',
      uncertaintyTitle: 'Model şeffaflığı ve belirsizlik',
      confidenceLabel: 'Güven düzeyi:',
      confidenceLow: 'Düşük (Geniş seçenekler açık bırakıldı)',
      confidenceUncertain: 'Belirsiz / Karışık sinyaller',
      confidenceClear: 'Daha net metin sinyali',
      defaultExplanationLow:
        'Eğitilmiş sınıflandırıcı mesajınızın bazı bölümlerinde düşük güven bildirdi; bu kısa, dolaylı veya İngilizce olmayan ifadelerde sık görülür. Aşağıdaki geniş seçenekler açık kalır—size uyanları seçin veya kaldırın.',
      defaultExplanationNormal:
        'Eğitim sırasında öğrenilen örüntülere dayanarak ML modeli {needs}{urgent} başlıklarını öne çıkardı. Özetinizi oluşturmadan önce aşağıdan herhangi bir kategoriyi düzenleyebilirsiniz.',
      defaultSummaryTemplate:
        'Destek talebi{location}: {needs} ihtiyacı.{urgent}{minor} Kişi tüm ayrıntıları tekrarlamadan seçenekleri incelemeyi tercih ediyor.',
      nonEnglishModelNote:
        'Eğitilmiş ML sınıflandırıcısı yalnızca İngilizce metni değerlendirir. İngilizce dışı yazı algılandığından otomatik güven düşüktür ve tüm genel destek seçenekleri seçiminize açıktır.',
      adjustNeedsPrompt: 'Özetinizi ve hizmet eşleşmenizi ayarlamak için destek ihtiyaçlarını işaretleyin veya kaldırın:',
      statusSuggested: 'Önerilen',
      statusUncertain: 'Belirsiz',
      statusBelow: 'Eşiğin altında',
      keywordsLabel: 'Fark edilen anahtar kelimeler:',
      centersKicker: 'Uluslararası Hizmet Dizini Eşleştirmesi',
      centersTitle: 'Yerel Destek Hizmetleri Durumu',
      noVerifiedForLocationTitle: '{location} için henüz doğrulanmış yerel sağlayıcı eklenmedi',
      noVerifiedForLocationBody:
        'OneDoor asla uydurma kurum, adres veya telefon numarası oluşturmaz. Eşleştirme motorumuz {location} için doğrulanmış kayıtları kontrol etti ve canlı dizinde henüz ortak bulunmuyor. Yerel hizmetlere ulaşırken aşağıdaki düzenlenebilir özetinizi kullanabilirsiniz.',
      noLocationSharedTitle: 'Konum onaylanmadı — dizin durumu dürüstçe gösteriliyor',
      noLocationSharedBody:
        'Konum paylaşmamayı seçtiniz ve henüz doğrulanmış uluslararası ortak eklenmedi. Yukarıdan istediğiniz zaman şehir veya ülke girebilir ya da aşağıdan kişisel özetinizi hazırlayabilirsiniz.',
      rankPrefix: 'Sıra #{rank}',
      matchPrefix: 'Eşleşme {score}',
      whyMatched: 'Neden eşleşti:',
      selectPathway: 'Hizmeti Seç',
      selectedPathway: 'Seçilen Hizmet',
      referralKicker: 'Rızaya Dayalı Özet · Ortak Entegrasyonuna Kadar Yerel Olarak Kaydedilir',
      referralTitle: 'Yönlendirme Özetini İncele, Düzenle ve Kaydet',
      referralSubtitle:
        'Kaydetmeden önce aşağıdaki her ayrıntıyı düzenleyin. Kaydetme işlemi, özetinizi istediğiniz zaman kopyalayıp indirebileceğiniz veya silebileceğiniz özel bir referans kodu oluşturur.',
      selectedServiceLabel: 'Seçilen alıcı / biçim:',
      selfDirectedLabel: 'Kişisel yönlendirme özeti (herhangi bir yerel sağlayıcı için kopyalamaya veya indirmeye hazır)',
      summaryEditorLabel: 'Eklenecek tam özet (istediğiniz kısmı düzenleyin veya silin)',
      includeLocationLabel: 'Onaylanan konumu dahil et:',
      notProvided: 'Sağlanmadı',
      includeUrgencyLabel: 'Zaman duyarlılığı işaretini dahil et:',
      flaggedLabel: 'İşaretlendi',
      notFlaggedLabel: 'İşaretlenmedi',
      previewTitle: 'Kaydedilen yönlendirme özetinize dahil edilen tam alanlar:',
      previewNeeds: 'Destek ihtiyaçları:',
      previewLocation: 'Konum:',
      previewUrgency: 'Aciliyet notu:',
      previewRawText: 'Ham metin kaydediliyor mu?',
      noneSelected: 'Seçilmedi',
      notIncluded: 'Dahil edilmedi',
      urgencySummaryValue: 'Olası zamana duyarlı aciliyet',
      noRawSavedValue: 'Hayır (yalnızca yukarıdaki düzenlenmiş özetiniz).',
      consentCheckbox:
        'Yukarıdaki özeti inceledim ve seçilen bu bilgilerin yönlendirme kaydıma kaydedilmesini onaylıyorum.',
      sendReferralButton: 'Onayla ve Yönlendirme Özetini Kaydet',
      savingButton: 'Yönlendirme özeti kaydediliyor...',
      savedStatusLabel: 'Yerel olarak kaydedildi (dışarıya iletilmedi)',
      referencePrefix: 'Referans:',
      savedBodyPrefix: 'Düzenlenen özetiniz özel referans kodunuzla kaydedildi:',
      savedBodySuffix:
        'Dış ortak entegrasyonları henüz bağlı olmadığından bu kayıt otomatik gönderilmedi—aşağıdan kopyalayın veya indirin ya da istediğiniz zaman kalıcı olarak silin.',
      copySummary: 'Özeti Kopyala',
      copiedSummary: 'Özet Kopyalandı',
      downloadSummary: 'Özeti İndir (.txt)',
      withdrawRecord: 'Kaydı Geri Çek ve Sil',
      readinessLink: 'Çalışma Hazırlığı Ayrıntıları',
      withdrawnConfirmation: 'Kaydedilen {code} kaydı OneDoor depolamasından kalıcı olarak kaldırıldı.',
      lookupTitle: 'Kayıtlı Bir Yönlendirmeyi Bul veya Geri Çek',
      lookupSubtitle:
        'Kaydedilen kayıtlar asla herkese açık listelenmez. Görüntülemek, indirmek veya kalıcı olarak silmek için özel OD-REF-XXXXXX kodunuzu girin.',
      lookupToggleOpen: 'Referans Kodu Gir',
      lookupToggleClose: 'Aramayı Gizle',
      lookupPlaceholder: 'OD-REF-123456',
      lookupButton: 'Kaydı Bul',
      lookupChecking: 'Kontrol ediliyor...',
      lookupEmptyError: 'Bir referans kodu girin (örn. OD-REF-123456).',
      lookupDeleteButton: 'Kalıcı Olarak Sil',
    },
    voice: {
      kicker: 'Tarayıcı Sesli Dikte · Canlı telefon yardım hattı değildir',
      title: 'Açıklamanızı Sesli Anlatın',
      audioOn: 'Ses Açık',
      audioMuted: 'Ses Kapalı',
      guidancePrompt:
        'Hazır olduğunuzda kendi hızınızda konuşun. Yalnızca güvenli hissettiğiniz bilgileri paylaşın—isimler ve açık adresler isteğe bağlıdır ve destek seçeneklerini düzenlemeden önce her kelimeyi değiştirebilirsiniz.',
      readyStatus: 'Dikte etmek için mikrofonu kullanın veya doğrudan aşağıya yazın.',
      unsupportedStatus: 'Bu tarayıcıda sesten metne özelliği kullanılamıyor. Doğrudan aşağıdaki kutuya yazabilirsiniz.',
      stoppedStatus: 'Mikrofon durduruldu. Aşağıdaki metninizi inceleyin veya düzenleyin.',
      listeningStatus: 'Tarayıcı mikrofonuyla dinleniyor... Kendi hızınızda sakince konuşun.',
      micErrorPrefix: 'Mikrofon girişi kullanılamıyor ({error}). Doğrudan aşağıya yazabilirsiniz.',
      startMic: 'Mikrofonu Başlat',
      stopMic: 'Mikrofonu Durdur',
      readAloud: 'Rehberi Sesli Oku',
      transcriptLabel: 'Sesli notlar (seçenekleri düzenlemeden önce değiştirin veya temizleyin)',
      transcriptPlaceholder: 'Söylediğiniz kelimeler burada görünür veya doğrudan yazabilirsiniz...',
      submitButton: 'Destek Seçeneklerini Düzenle',
    },
    about: {
      kicker: 'Güvenlik, Operasyonel Hazırlık, Gizlilik ve Küresel Mimari',
      title: 'OneDoor Hakkında',
      intro:
        'OneDoor, şiddet veya tacizden etkilenen kişilerin hikayelerini tekrar tekrar anlatmadan destek ihtiyaçlarını düzenlemelerine ve rıza kontrollü yönlendirme özetleri hazırlamalarına yardımcı olan gizlilik öncelikli uluslararası bir destek platformudur.',
      disclaimerTitle: 'Prototip ve Tıbbi Uyarı',
      disclaimerBody:
        'OneDoor acil müdahale hattı değildir ve tıbbi, psikolojik veya hukuki tanı koymaz. Kaydedilen özetler, doğrulanmış yerel ortak entegrasyonları kurulana kadar yalnızca bu platformda saklanır.',
      worksTitle: 'Şu Anda Çalışan Özellikler',
      worksItems: [
        {
          title: 'Eğitilmiş ML Sınıflandırması',
          body: 'Eğitilmiş TF-IDF + L2 Lojistik Regresyon modeli İngilizce açıklamaları 6 destek yoluna ayırır ve olası aciliyeti açık güven göstergeleriyle işaretler.',
        },
        {
          title: 'Küresel Konum Arama ve Eşleştirme Motoru',
          body: 'Manuel ülke/şehir/bölge/posta aramasını, izin temelli ters coğrafi kodlamayı ve doğrulanmış hizmet dizini eşleştirmesini destekler.',
        },
        {
          title: '20 Dilli Yerelleştirilmiş Arayüz (RTL dahil)',
          body: 'Arapça ve Urduca sağdan sola düzenler dahil 20 dil arasında anında geçiş yapar ve seçimi ziyaretler arasında hatırlar.',
        },
        {
          title: 'Rıza Kontrollü Yönlendirme Özetleri',
          body: 'Her kelimeyi düzenleyin, alanları seçin, kopyalayın veya (.txt) indirin ve özel OD-REF-XXXXXX kodlarıyla saklayın veya kalıcı olarak silin.',
        },
      ],
      notYetTitle: 'Canlı Kullanım İçin Henüz Hazır Olmayanlar',
      notYetItems: [
        {
          title: 'Doğrulanmış Uluslararası Ortak Dizini',
          body: 'Doğrulanmış iletişim bilgileri yayınlanmadan önce her ülkedeki gerçek klinikler, sığınaklar, hatlar ve hukuki destek sağlayıcıları incelenmelidir.',
        },
        {
          title: 'Dış Kurumlara Yönlendirme İletimi',
          body: 'Özeti kaydetmek onu referans koduyla yerel olarak saklar; henüz hiçbir dış kuruma otomatik iletim yapılmaz.',
        },
        {
          title: 'Çok Dilli ML Eğitimi',
          body: 'Arayüz 20 dili desteklerken mevcut ML sınıflandırıcısı yalnızca İngilizce metin üzerinde eğitilmiştir ve diğer dilleri dürüstçe işaretler.',
        },
        {
          title: 'Güvenlik Denetimi ve Klinik Yönetişim',
          body: 'Tam yayın için uçtan uca şifreleme, sızma testleri, hukuki/klinik inceleme ve resmi çocuk koruma süreçleri gereklidir.',
        },
      ],
      safeguardingTitle: 'Reşit Olmayanlar ve Çocuk Koruma',
      safeguardingBody:
        '18 yaşın altındaki bir kişi etkilendiğinde ek yasal çocuk koruma kuralları geçerlidir. Gerçek kullanım için eğitimli koruma uzmanları gerekir.',
      quickExitTitle: 'Hızlı Çıkış ve Tarayıcı Gizlilik Bildirimi',
      quickExitBody:
        'Her sayfadaki Hızlı Çıkış düğmesi, geçmiş değiştirme kullanarak sizi anında tarafsız bir hava durumu sitesine yönlendirir. Tarayıcı geçmişini silmez—mümkün olduğunda gizli pencere kullanın.',
      directoryTitle: 'Doğrulanmış Hizmet Dizini Durumu',
      directoryBody:
        'Zor durumdaki kişileri yanıltmamak için OneDoor şu anda doğrulanmamış veya kurgusal kurumlar yayınlamaz. Gerçek yerel ortaklar onaylandıkça yalnızca eşleşen konumlar için görünür.',
      architectureTitle: 'Mimari ve Sorumlu Veri İşleme',
      architectureItems: [
        {
          title: 'Sentetik Eğitim Verisi Etiği',
          body: 'Dahili ML modeli yalnızca 200 sentetik açıklama üzerinde eğitilmiştir—asla gerçek kullanıcı paylaşımları kullanılmamıştır.',
        },
        {
          title: 'Koordinat ve Metin Gizliliği',
          body: 'Ham metinler ve GPS koordinatları asla sunucu günlüklerine kaydedilmez veya URL’lere eklenmez.',
        },
        {
          title: 'Özel Referans Kodları',
          body: 'Kaydedilen özetler asla herkese açık listelenmez ve yalnızca özel referans koduyla görüntülenebilir veya silinebilir.',
        },
      ],
    },
    footer: {
      navigationTitle: 'Gezinme',
      safetyTitle: 'Güvenlik ve Dil',
      prototypeNote:
        'OneDoor asla doğrulanmamış kurum veya sahte iletişim bilgisi yayınlamaz; yerel dizinler yalnızca gerçek ortaklar doğrulandıkça doldurulur.',
      languageNotice: '20 dilde kullanılabilir · ML sınıflandırıcısı şu anda İngilizce metni değerlendirir.',
    },
  },

  id: {
    brandName: 'OneDoor',
    nav: {
      home: 'Beranda',
      getSupport: 'Dapatkan Bantuan',
      about: 'Tentang & Keamanan',
      menu: 'Menu',
      close: 'Tutup',
      mainNavAria: 'Navigasi utama',
    },
    languageSelector: {
      buttonAria: 'Pilih bahasa',
      searchPlaceholder: 'Cari bahasa...',
      noResults: 'Bahasa yang cocok tidak ditemukan.',
      mlLanguageBadge: 'Antarmuka diterjemahkan · Model ML hanya mengevaluasi teks bahasa Inggris',
    },
    quickExit: 'Keluar Cepat',
    quickExitHint: 'Langsung meninggalkan situs ini (tidak menghapus riwayat browser).',
    emergencyBanner:
      'OneDoor belum terhubung ke layanan darurat langsung atau klinik eksternal. Jika Anda berada dalam bahaya segera di mana pun di dunia, hubungi layanan darurat setempat atau orang terpercaya terdekat.',
    disclaimerExact: 'This project is a prototype and is not medical advice.',
    disclaimerLocalNote:
      'Pemberitahuan prototipe: Platform ini tidak memberikan diagnosis medis, hukum, atau darurat.',
    hero: {
      kicker: 'Pintu Masuk Bantuan Global · Rahasia Sejak Awal',
      title: 'Satu pintu yang tenang untuk menata bantuan yang tepat, tanpa mengulang cerita Anda.',
      subtitle:
        'Ceritakan apa yang terjadi dengan kata-kata Anda sendiri secara tertulis atau suara. Pengklasifikasi terlatih kami menata kebutuhan dukungan Anda, memeriksa ketersediaan layanan terverifikasi di lokasi Anda, serta memungkinkan Anda mengedit dan menyimpan ringkasan rujukan sepenuhnya di bawah kendali Anda.',
      primaryCta: 'Dapatkan Bantuan Sekarang',
      talkCta: 'Bicara Saja',
      secondaryCta: 'Baca status keamanan & operasional',
      doorwayAria: 'Animasi pintu melengkung OneDoor yang terbuka lembut menuju cahaya hangat',
    },
    howItWorks: {
      title: 'Cara OneDoor membantu Anda langkah demi langkah',
      subtitle:
        'Anda memegang kendali di setiap tahap. Bagikan hanya hal yang terasa aman—tanpa akun atau nama asli.',
      steps: [
        {
          num: '01.',
          title: 'Bagikan sesuai kecepatan Anda',
          body: 'Ketik atau diktekan apa yang terjadi. Anda dapat melewati nama, alamat jalan, atau detail pribadi apa pun.',
        },
        {
          num: '02.',
          title: 'Tinjau kebutuhan dukungan yang tertata',
          body: 'Model ML terlatih mengelompokkan kebutuhan medis, perlindungan, hukum, psikologis, atau sosial serta menampilkan tingkat keyakinan secara jujur.',
        },
        {
          num: '03.',
          title: 'Edit, simpan & bawa ringkasan Anda',
          body: 'Tinjau dan edit ringkasan rujukan Anda, salin atau unduh, atau simpan dengan kode referensi pribadi yang dapat dihapus kapan saja.',
        },
      ],
    },
    categoriesSection: {
      title: 'Enam jalur dukungan yang dibantu ditata oleh OneDoor',
      subtitle:
        'Baik Anda membutuhkan perawatan medis mendesak, dukungan emosional, atau panduan hukum dan tempat aman, OneDoor mengubah cerita Anda menjadi langkah berikutnya yang terstruktur.',
    },
    categories: {
      medical_support: {
        label: 'Dukungan medis',
        shortDesc: 'Perawatan rahasia untuk cedera, nyeri, kontrasepsi darurat, atau perawatan pascapaparan yang sensitif waktu.',
      },
      psychological_support: {
        label: 'Dukungan psikologis',
        shortDesc: 'Konseling peka trauma, penenangan kepanikan, dan perawatan emosional.',
      },
      protection_safeguarding: {
        label: 'Perlindungan & pengamanan',
        shortDesc: 'Perencanaan keselamatan segera, opsi rumah aman, dan perlindungan anak.',
      },
      legal_support: {
        label: 'Dukungan hukum',
        shortDesc: 'Panduan tentang perintah perlindungan, pelecehan di tempat kerja, hak asuh, dan hak pelaporan.',
      },
      sexual_violence_support: {
        label: 'Dukungan kekerasan seksual',
        shortDesc: 'Perawatan klinis khusus berpusat pada penyintas, opsi forensik, dan advokasi krisis.',
      },
      social_support: {
        label: 'Dukungan sosial',
        shortDesc: 'Tempat tinggal sementara, kebutuhan darurat atau ongkos transportasi, pengasuhan anak, dan dukungan penghidupan.',
      },
    },
    safetySection: {
      title: 'Dibangun di atas otonomi penyintas dan batasan sistem yang jujur',
      cta: 'Keamanan, Privasi & Status Operasional',
      items: [
        {
          title: 'Tidak pernah memutuskan untuk Anda',
          body: 'OneDoor tidak pernah menyuruh Anda pergi, bertahan, menghadapi seseorang, atau melapor. Anda dan tenaga ahli tetap memegang kendali.',
        },
        {
          title: 'Persetujuan eksplisit & minimisasi data',
          body: 'Hanya ringkasan dan kolom yang Anda tinjau serta setujui yang disimpan. Uraian mentah tidak pernah dicatat atau dikirim otomatis.',
        },
        {
          title: 'Jujur tentang kesiapan direktori lokal',
          body: 'Kami tidak pernah mengarang organisasi, nomor telepon, atau berpura-pura rujukan terkirim jika mitra lokal terverifikasi belum tersedia.',
        },
      ],
    },
    visualShowcase: {
      welcomeAlt: 'Pintu melengkung bermandikan sinar matahari yang membuka ke taman halaman yang tenang',
      welcomeCaption: 'Akses masuk yang tenang dan rahasia tanpa mengulang cerita Anda.',
      privacyAlt: 'Tangan meninjau dokumen ringkasan pribadi dengan saksama di dekat jendela cerah',
      privacyCaption: 'Anda meninjau, mengedit, dan mengendalikan setiap kata sebelum disimpan.',
      communityAlt: 'Dua orang yang saling mendukung di samping paviliun komunitas yang damai',
      communityCaption: 'Menghubungkan kebutuhan bahasa sehari-hari dengan jalur layanan terstruktur.',
      globalAlt: 'Pintu melengkung berpadu dengan garis peta dunia dan jalur cahaya penuntun',
      globalCaption: 'Dirancang untuk penggunaan internasional dengan batasan direktori lokal yang jujur.',
      heroPhotoAlt: 'Dua perempuan duduk di bangku taman yang tenang sambil berbincang hangat ditemani secangkir teh',
      counselorPhotoAlt: 'Seorang pendamping mendengarkan dengan penuh hormat di meja kayu dalam ruang layanan yang terang',
      counselorPhotoCaption: 'Dukungan manusiawi yang berpusat pada mendengarkan dengan tenang tanpa menghakimi atau menekan.',
      calmPortraitAlt: 'Seseorang duduk tenang di dekat jendela bercahaya matahari dengan teh dan buku catatan terbuka',
      pathwayCareAlt: 'Ilustrasi ruang pendampingan teduh dengan pintu melengkung hijau tua, lampu hangat, dan dua cangkir teh',
      pathwayCareCaption: 'Jalur terstruktur yang mencakup dukungan medis, hukum, perlindungan, dan bantuan praktis sehari-hari.',
      intakeDeskAlt: 'Ilustrasi meja tulis kayu pribadi di samping jendela melengkung terang dengan jurnal dan pena',
      intakeDeskCaption: 'Luangkan waktu Anda — tulis atau bicaralah secara pribadi sesuai ritme Anda sebelum memilih apa yang dibagikan.',
    },
    location: {
      sectionTitle: 'Lokasi Anda (opsional, manual secara default)',
      privacyWhy:
        'Hanya digunakan untuk memeriksa apakah layanan terverifikasi tersedia di kota atau negara Anda. Alamat jalan tidak pernah diminta, dan koordinat GPS langsung dihapus setelah pencarian.',
      searchLabel: 'Cari kota, wilayah, kode pos, atau negara',
      searchPlaceholder: 'Ketik kota, kode pos, atau negara (mis. Jakarta, London, Toronto)...',
      searching: 'Mencari lokasi...',
      noSuggestions: 'Tidak ada saran otomatis yang cocok. Anda dapat memasukkan negara dan kota secara manual di bawah.',
      autocompleteError:
        'Pelengkapan otomatis lokasi sedang tidak tersedia. Anda dapat memasukkan negara dan kota secara manual di bawah.',
      manualFieldsTitle: 'Atau masukkan detail lokasi secara manual',
      countryLabel: 'Negara',
      countryPlaceholder: 'mis. Indonesia, Inggris, Brasil',
      cityLabel: 'Kota / Kabupaten',
      cityPlaceholder: 'mis. Surabaya, Bandung, Manchester',
      regionLabel: 'Provinsi / Wilayah (opsional)',
      regionPlaceholder: 'mis. Jawa Barat, Ontario',
      postalLabel: 'Kode pos (opsional)',
      postalPlaceholder: 'mis. 10110, SW1A',
      confirmManualButton: 'Konfirmasi Lokasi Manual',
      manualValidationError: 'Harap masukkan setidaknya negara atau kota untuk mengonfirmasi lokasi Anda.',
      useGpsButton: 'Gunakan lokasi saya saat ini',
      gpsDetecting: 'Meminta izin dan mencari perkiraan kota/negara...',
      gpsPrivacyNote:
        'Hanya meminta izin saat diklik. Koordinat tidak pernah disimpan di URL atau log server.',
      detectedTitle: 'Perkiraan lokasi terdeteksi — harap konfirmasi:',
      confirmDetectedButton: 'Konfirmasi Lokasi Ini',
      dismissDetectedButton: 'Abaikan / Isi Manual',
      confirmedLabel: 'Lokasi terkonfirmasi:',
      editButton: 'Edit',
      clearButton: 'Hapus (Pilih tidak membagikan)',
      preferNotToShare: 'Lokasi tidak dibagikan — melanjutkan tanpa lokasi.',
      errUnavailable: 'Geolokasi browser tidak tersedia di perangkat ini. Silakan masukkan lokasi secara manual.',
      errDenied: 'Izin lokasi ditolak. Anda dapat memasukkan negara dan kota secara manual kapan saja.',
      errPositionUnavailable:
        'Layanan lokasi tampaknya nonaktif atau tidak tersedia saat ini. Silakan masukkan lokasi secara manual.',
      errTimeout: 'Deteksi lokasi habis waktu. Silakan masukkan secara manual atau coba lagi.',
      errReverseFailed:
        'Tidak dapat mengubah koordinat menjadi nama tempat yang terbaca. Silakan masukkan kota atau negara secara manual.',
      errIncomplete:
        'Koordinat yang terdeteksi tidak menghasilkan kota atau negara yang jelas. Silakan masukkan secara manual.',
    },
    intake: {
      confidentialKicker: 'Penerimaan Dukungan Rahasia · Tanpa Akun · Tanpa Unggah Foto',
      title: 'Ceritakan apa yang terjadi',
      subtitle:
        'Bagikan hanya hal yang terasa aman dan nyaman. Tidak perlu akun, dan cerita Anda tidak pernah dicatat di server.',
      privacyReassurance:
        'Anda tidak perlu membagikan nama asli, nomor telepon, atau alamat lengkap. Anda mengendalikan setiap kata dalam ringkasan akhir.',
      englishClassifierNote:
        'Catatan bahasa model: Antarmuka bekerja dalam bahasa pilihan Anda, sementara pengklasifikasi ML terlatih saat ini hanya mengevaluasi teks bahasa Inggris.',
      modeWrite: 'Tulis deskripsi',
      modeTalk: 'Bicara (Input Suara)',
      descriptionLabel: 'Apa yang terjadi atau bantuan seperti apa yang Anda cari?',
      descriptionPlaceholder:
        'Jelaskan situasi dengan kata-kata Anda sendiri—seperti cedera, keselamatan malam ini, pertanyaan hukum, atau tekanan emosional...',
      minorCheckbox: 'Situasi ini melibatkan seseorang di bawah usia 18 tahun (memicu pemberitahuan perlindungan anak)',
      nothingSavedNote: 'Tidak ada yang disimpan atau dibagikan secara otomatis pada langkah ini.',
      submitButton: 'Tata Opsi Bantuan',
      analyzingButton: 'Menata kebutuhan dukungan...',
      minLengthError: 'Harap tulis atau ucapkan minimal 3 karakter agar OneDoor dapat menata opsi.',
      networkError: 'Kesalahan koneksi saat menata opsi bantuan. Silakan coba lagi.',
      resultsKicker: 'Pengklasifikasi Terlatih TF-IDF + Regresi Logistik',
      resultsTitle: 'Jalur Dukungan yang Disarankan',
      refineButton: 'Buat Penjelasan Lembut & Ringkasan',
      refiningButton: 'Menyusun penjelasan lembut...',
      geminiUsedBadge: 'Ringkasan disusun dengan Gemini (klasifikasi tetap menggunakan ML lokal)',
      urgencyTitlePrefix: 'Kemungkinan urgensi sensitif waktu ditandai (skor ML: {pct}%)',
      urgencyNotice:
        'Model otomatis mendeteksi kemungkinan urgensi waktu. Ini bukan penilaian medis atau keselamatan profesional—jika berada dalam bahaya segera, hubungi bantuan darurat setempat.',
      minorTitle: 'Pengingat Anak di Bawah Umur & Perlindungan',
      minorSafeguardingNote:
        'Pemberitahuan perlindungan: Prosedur hukum dan perlindungan anak tambahan berlaku setiap kali anak di bawah 18 tahun terdampak.',
      uncertaintyTitle: 'Transparansi model & ketidakpastian',
      confidenceLabel: 'Tingkat keyakinan:',
      confidenceLow: 'Rendah (Opsi luas tetap terbuka)',
      confidenceUncertain: 'Tidak pasti / Sinyal campuran',
      confidenceClear: 'Sinyal kata lebih jelas',
      defaultExplanationLow:
        'Pengklasifikasi terlatih memiliki keyakinan lebih rendah pada bagian pesan Anda, yang sering terjadi pada kalimat singkat, tidak langsung, atau non-Inggris. Opsi luas di bawah tetap terbuka untuk Anda pilih.',
      defaultExplanationNormal:
        'Berdasarkan pola pelatihan, model ML menyoroti {needs}{urgent}. Anda dapat menyesuaikan kategori di bawah sebelum membuat ringkasan.',
      defaultSummaryTemplate:
        'Permintaan dukungan{location} untuk {needs}.{urgent}{minor} Pemohon memilih meninjau opsi tanpa mengulang seluruh detail.',
      nonEnglishModelNote:
        'Pengklasifikasi ML terlatih hanya mengevaluasi teks bahasa Inggris. Karena aksara/bahasa non-Inggris terdeteksi, keyakinan otomatis rendah dan semua opsi umum tetap tersedia.',
      adjustNeedsPrompt: 'Centang atau hapus kebutuhan dukungan untuk menyesuaikan ringkasan dan pencocokan layanan:',
      statusSuggested: 'Disarankan',
      statusUncertain: 'Tidak pasti',
      statusBelow: 'Di bawah ambang',
      keywordsLabel: 'Kata kunci yang terdeteksi:',
      centersKicker: 'Pencocokan Direktori Layanan Internasional',
      centersTitle: 'Status Layanan Dukungan Lokal',
      noVerifiedForLocationTitle: 'Belum ada penyedia lokal terverifikasi untuk {location}',
      noVerifiedForLocationBody:
        'OneDoor tidak pernah mengarang organisasi, alamat, atau nomor telepon. Mesin pencocokan kami memeriksa catatan terverifikasi untuk {location}, dan belum ada mitra aktif di direktori. Anda tetap dapat menggunakan ringkasan yang dapat diedit di bawah saat menghubungi layanan setempat.',
      noLocationSharedTitle: 'Belum ada lokasi dikonfirmasi — menampilkan status direktori secara jujur',
      noLocationSharedBody:
        'Anda memilih tidak membagikan lokasi, dan belum ada mitra internasional terverifikasi yang terdaftar. Anda dapat memasukkan kota atau negara di atas kapan saja, atau menyiapkan ringkasan pribadi Anda di bawah.',
      rankPrefix: 'Peringkat #{rank}',
      matchPrefix: 'Kecocokan {score}',
      whyMatched: 'Alasan cocok:',
      selectPathway: 'Pilih Layanan',
      selectedPathway: 'Layanan Dipilih',
      referralKicker: 'Ringkasan Terkendali Persetujuan · Disimpan Lokal Menunggu Integrasi Mitra',
      referralTitle: 'Tinjau, Edit & Simpan Ringkasan Rujukan',
      referralSubtitle:
        'Edit setiap detail di bawah sebelum menyimpan. Menyimpan akan membuat kode referensi pribadi agar Anda dapat menyalin, mengunduh, mengambil, atau menghapusnya kapan saja.',
      selectedServiceLabel: 'Penerima / format terpilih:',
      selfDirectedLabel: 'Ringkasan rujukan pribadi (siap disalin atau diunduh untuk penyedia layanan lokal mana pun)',
      summaryEditorLabel: 'Ringkasan persis yang disertakan (edit atau hapus apa pun yang Anda inginkan)',
      includeLocationLabel: 'Sertakan lokasi terkonfirmasi:',
      notProvided: 'Tidak diberikan',
      includeUrgencyLabel: 'Sertakan tanda sensitivitas waktu:',
      flaggedLabel: 'Ditandai',
      notFlaggedLabel: 'Tidak ditandai',
      previewTitle: 'Kolom persis yang masuk ke ringkasan rujukan tersimpan Anda:',
      previewNeeds: 'Kebutuhan dukungan:',
      previewLocation: 'Lokasi:',
      previewUrgency: 'Catatan urgensi:',
      previewRawText: 'Teks asli mentah disimpan?',
      noneSelected: 'Tidak ada yang dipilih',
      notIncluded: 'Tidak disertakan',
      urgencySummaryValue: 'Kemungkinan urgensi sensitif waktu',
      noRawSavedValue: 'Tidak (hanya ringkasan yang Anda edit di atas).',
      consentCheckbox:
        'Saya telah meninjau ringkasan di atas dan mengonfirmasi bahwa detail pilihan ini boleh disimpan dalam catatan rujukan saya.',
      sendReferralButton: 'Setujui & Simpan Ringkasan Rujukan',
      savingButton: 'Menyimpan Ringkasan Rujukan...',
      savedStatusLabel: 'Disimpan secara lokal (tidak dikirim ke pihak luar)',
      referencePrefix: 'Referensi:',
      savedBodyPrefix: 'Ringkasan editan Anda telah disimpan dengan kode referensi pribadi untuk',
      savedBodySuffix:
        'Karena integrasi mitra eksternal belum terhubung di sini, catatan ini belum dikirim secara otomatis—salin atau unduh di bawah, atau hapus permanen kapan saja.',
      copySummary: 'Salin Ringkasan',
      copiedSummary: 'Ringkasan Disalin',
      downloadSummary: 'Unduh Ringkasan (.txt)',
      withdrawRecord: 'Tarik & Hapus Catatan',
      readinessLink: 'Detail Kesiapan Operasional',
      withdrawnConfirmation: 'Catatan tersimpan {code} telah dihapus permanen dari penyimpanan OneDoor.',
      lookupTitle: 'Ambil atau Tarik Kembali Rujukan Tersimpan',
      lookupSubtitle:
        'Catatan tersimpan tidak pernah ditampilkan secara publik. Masukkan kode pribadi OD-REF-XXXXXX Anda untuk melihat, mengunduh, atau menghapus permanen.',
      lookupToggleOpen: 'Masukkan Kode Referensi',
      lookupToggleClose: 'Sembunyikan Pencarian',
      lookupPlaceholder: 'OD-REF-123456',
      lookupButton: 'Cari Catatan',
      lookupChecking: 'Memeriksa...',
      lookupEmptyError: 'Masukkan kode referensi (mis. OD-REF-123456).',
      lookupDeleteButton: 'Hapus Permanen',
    },
    voice: {
      kicker: 'Dikte Suara Browser · Bukan saluran telepon langsung',
      title: 'Ucapkan Deskripsi Anda',
      audioOn: 'Audio Aktif',
      audioMuted: 'Audio Dibisukan',
      guidancePrompt:
        'Bicaralah sesuai kecepatan Anda kapan pun siap. Bagikan hanya yang terasa aman—nama dan alamat lengkap bersifat opsional, dan Anda dapat mengedit setiap kata sebelum menata opsi dukungan.',
      readyStatus: 'Gunakan mikrofon Anda untuk mendikte, atau ketik langsung di bawah.',
      unsupportedStatus: 'Ucapan-ke-teks tidak tersedia di browser ini. Anda dapat mengetik langsung di kotak di bawah.',
      stoppedStatus: 'Mikrofon dihentikan. Tinjau atau edit teks Anda di bawah.',
      listeningStatus: 'Mendengarkan melalui mikrofon browser... Bicaralah dengan tenang sesuai kecepatan Anda.',
      micErrorPrefix: 'Input mikrofon tidak tersedia ({error}). Anda dapat mengetik langsung di bawah.',
      startMic: 'Mulai Mikrofon',
      stopMic: 'Hentikan Mikrofon',
      readAloud: 'Bacakan Panduan',
      transcriptLabel: 'Catatan lisan (edit atau hapus sebelum menata opsi)',
      transcriptPlaceholder: 'Kata-kata yang diucapkan akan muncul di sini, atau ketik langsung...',
      submitButton: 'Tata Opsi Bantuan',
    },
    about: {
      kicker: 'Keamanan, Kesiapan Operasional, Privasi & Arsitektur Global',
      title: 'Tentang OneDoor',
      intro:
        'OneDoor adalah platform navigasi dukungan internasional yang mengutamakan privasi untuk membantu penyintas kekerasan atau pelecehan menata kebutuhan bantuan dan menyiapkan ringkasan rujukan terkendali persetujuan tanpa mengulang cerita mereka.',
      disclaimerTitle: 'Prototipe & Penafian Medis',
      disclaimerBody:
        'OneDoor bukan layanan pengiriman darurat dan tidak memberikan diagnosis medis, psikologis, atau hukum. Ringkasan tersimpan hanya berada di platform ini hingga integrasi mitra lokal terverifikasi tersedia.',
      worksTitle: 'Yang Berfungsi Saat Ini',
      worksItems: [
        {
          title: 'Klasifikasi ML Terlatih',
          body: 'Model TF-IDF + Regresi Logistik L2 mengklasifikasikan deskripsi bahasa Inggris ke 6 jalur dukungan dan menandai kemungkinan urgensi dengan indikator keyakinan.',
        },
        {
          title: 'Pencarian Lokasi Global & Mesin Pencocokan',
          body: 'Mendukung pencarian manual negara/kota/wilayah/kode pos, reverse geocoding opsional berbasis izin, dan pencocokan direktori terverifikasi.',
        },
        {
          title: 'Antarmuka 20 Bahasa (termasuk RTL)',
          body: 'Beralih dengan mulus di 20 bahasa termasuk tata letak kanan-ke-kiri Arab dan Urdu, yang diingat antar kunjungan.',
        },
        {
          title: 'Ringkasan Rujukan Berbasis Persetujuan',
          body: 'Edit setiap kata, pilih metadata, salin atau unduh (.txt), dan simpan atau hapus permanen melalui kode pribadi OD-REF-XXXXXX.',
        },
      ],
      notYetTitle: 'Belum Siap untuk Peluncuran Langsung',
      notYetItems: [
        {
          title: 'Direktori Mitra Internasional Terverifikasi',
          body: 'Klinik, rumah aman, hotline, dan penyedia bantuan hukum nyata di tiap negara harus diverifikasi sebelum kontak layanan ditampilkan.',
        },
        {
          title: 'Pengiriman Rujukan Eksternal',
          body: 'Menyimpan ringkasan hanya menyimpannya secara lokal dengan kode referensi; belum ada pengiriman otomatis ke organisasi luar.',
        },
        {
          title: 'Pelatihan ML Multibahasa',
          body: 'Antarmuka tersedia dalam 20 bahasa, sedangkan pengklasifikasi ML saat ini dilatih hanya pada teks Inggris dan memberi tahu secara jujur untuk input non-Inggris.',
        },
        {
          title: 'Audit Keamanan & Tata Kelola Klinis',
          body: 'Peluncuran penuh memerlukan enkripsi ujung-ke-ujung, uji penetrasi, tinjauan hukum/klinis, dan alur eskalasi perlindungan anak resmi.',
        },
      ],
      safeguardingTitle: 'Anak di Bawah Umur & Perlindungan',
      safeguardingBody:
        'Persyaratan hukum dan perlindungan anak tambahan berlaku setiap kali seseorang di bawah usia 18 tahun terdampak. Penggunaan nyata memerlukan spesialis terlatih.',
      quickExitTitle: 'Keluar Cepat & Pemberitahuan Privasi Browser',
      quickExitBody:
        'Tombol Keluar Cepat di setiap halaman langsung mengarahkan ke situs cuaca netral dengan penggantian riwayat. Ini tidak menghapus riwayat browser—gunakan mode privat bila aman.',
      directoryTitle: 'Status Direktori Layanan Terverifikasi',
      directoryBody:
        'Untuk menghindari informasi menyesatkan, OneDoor saat ini tidak menerbitkan organisasi palsu atau belum terverifikasi. Mitra resmi akan muncul khusus untuk lokasi yang sesuai setelah diverifikasi.',
      architectureTitle: 'Arsitektur & Penanganan Data yang Bertanggung Jawab',
      architectureItems: [
        {
          title: 'Etika Data Pelatihan Sintetis',
          body: 'Model ML internal dilatih hanya pada 200 deskripsi sintetis—tidak pernah menggunakan kisah nyata penyintas.',
        },
        {
          title: 'Privasi Koordinat & Teks',
          body: 'Teks mentah dan koordinat GPS tidak pernah dicatat oleh server atau dimasukkan ke dalam URL.',
        },
        {
          title: 'Kode Referensi Pribadi',
          body: 'Ringkasan tersimpan tidak pernah ditampilkan secara publik dan hanya dapat dilihat atau dihapus dengan kode referensi pribadinya.',
        },
      ],
    },
    footer: {
      navigationTitle: 'Navigasi',
      safetyTitle: 'Keamanan & Bahasa',
      prototypeNote:
        'OneDoor tidak pernah menerbitkan organisasi tak terverifikasi atau kontak palsu; direktori lokal hanya diisi setelah mitra asli terverifikasi.',
      languageNotice: 'Tersedia dalam 20 bahasa · Pengklasifikasi ML saat ini mengevaluasi teks bahasa Inggris.',
    },
  },

  vi: {
    brandName: 'OneDoor',
    nav: {
      home: 'Trang chủ',
      getSupport: 'Nhận Hỗ Trợ',
      about: 'Giới thiệu & An toàn',
      menu: 'Menu',
      close: 'Đóng',
      mainNavAria: 'Điều hướng chính',
    },
    languageSelector: {
      buttonAria: 'Chọn ngôn ngữ',
      searchPlaceholder: 'Tìm ngôn ngữ...',
      noResults: 'Không tìm thấy ngôn ngữ phù hợp.',
      mlLanguageBadge: 'Giao diện đã dịch · Mô hình ML hiện chỉ đánh giá văn bản tiếng Anh',
    },
    quickExit: 'Thoát Nhanh',
    quickExitHint: 'Rời khỏi trang này ngay lập tức (không xóa lịch sử trình duyệt).',
    emergencyBanner:
      'OneDoor hiện chưa kết nối với lực lượng khẩn cấp trực tiếp hoặc phòng khám bên ngoài. Nếu bạn đang gặp nguy hiểm tức thì ở bất kỳ đâu trên thế giới, hãy liên hệ dịch vụ khẩn cấp địa phương hoặc người đáng tin cậy gần đó.',
    disclaimerExact: 'This project is a prototype and is not medical advice.',
    disclaimerLocalNote:
      'Lưu ý nguyên mẫu: Nền tảng này không cung cấp chẩn đoán y tế, pháp lý hoặc ứng cứu khẩn cấp.',
    hero: {
      kicker: 'Cổng Hỗ Trợ Toàn Cầu · Bảo Mật Theo Thiết Kế',
      title: 'Một cánh cửa bình yên để sắp xếp hỗ trợ phù hợp, không phải kể lại câu chuyện nhiều lần.',
      subtitle:
        'Mô tả điều đã xảy ra bằng lời của bạn qua việc gõ hoặc nói. Bộ phân loại được huấn luyện của chúng tôi sắp xếp nhu cầu hỗ trợ, kiểm tra dịch vụ đã xác minh tại khu vực của bạn và cho phép bạn chỉnh sửa, lưu bản tóm tắt chuyển tiếp hoàn toàn dưới quyền kiểm soát của bạn.',
      primaryCta: 'Nhận Hỗ Trợ Ngay',
      talkCta: 'Nói Thay Vì Gõ',
      secondaryCta: 'Xem tình trạng an toàn & vận hành',
      doorwayAria: 'Hình minh họa động cánh cửa vòm OneDoor mở nhẹ nhàng hướng về ánh sáng ấm áp',
    },
    howItWorks: {
      title: 'OneDoor hỗ trợ bạn từng bước như thế nào',
      subtitle:
        'Bạn luôn giữ quyền kiểm soát ở mọi bước. Chỉ chia sẻ những gì bạn thấy an toàn—không cần tài khoản hay tên thật.',
      steps: [
        {
          num: '01.',
          title: 'Chia sẻ theo nhịp độ của bạn',
          body: 'Gõ hoặc đọc lại những gì đã xảy ra. Bạn có thể bỏ qua tên, địa chỉ cụ thể hoặc bất kỳ chi tiết riêng tư nào.',
        },
        {
          num: '02.',
          title: 'Xem xét các nhu cầu hỗ trợ được sắp xếp',
          body: 'Mô hình ML đã huấn luyện phân nhóm nhu cầu y tế, bảo vệ, pháp lý, tâm lý hoặc xã hội và hiển thị trung thực mức độ chắc chắn.',
        },
        {
          num: '03.',
          title: 'Chỉnh sửa, lưu & mang theo bản tóm tắt',
          body: 'Xem lại và chỉnh sửa bản tóm tắt chuyển tiếp, sao chép hoặc tải xuống, hoặc lưu bằng mã tham chiếu riêng có thể xóa bất cứ lúc nào.',
        },
      ],
    },
    categoriesSection: {
      title: 'Sáu nhóm hỗ trợ OneDoor giúp sắp xếp',
      subtitle:
        'Dù bạn cần chăm sóc y tế khẩn cấp, hỗ trợ tâm lý, hay hướng dẫn pháp lý hoặc nơi tạm lánh, OneDoor biến lời kể thông thường thành các bước tiếp theo rõ ràng.',
    },
    categories: {
      medical_support: {
        label: 'Hỗ trợ y tế',
        shortDesc: 'Chăm sóc bảo mật cho chấn thương, đau đớn, tránh thai khẩn cấp hoặc điều trị dự phòng kịp thời.',
      },
      psychological_support: {
        label: 'Hỗ trợ tâm lý',
        shortDesc: 'Tư vấn am hiểu sang chấn, ổn định hoảng loạn và chăm sóc cảm xúc.',
      },
      protection_safeguarding: {
        label: 'Bảo vệ & an toàn',
        shortDesc: 'Lập kế hoạch an toàn tức thời, lựa chọn nơi tạm lánh và bảo vệ trẻ vị thành niên.',
      },
      legal_support: {
        label: 'Hỗ trợ pháp lý',
        shortDesc: 'Hướng dẫn về lệnh bảo vệ, quấy rối nơi làm việc, quyền nuôi con và quyền trình báo.',
      },
      sexual_violence_support: {
        label: 'Hỗ trợ bạo lực tình dục',
        shortDesc: 'Chăm sóc lâm sàng chuyên biệt lấy người bị hại làm trung tâm, lựa chọn giám định và hỗ trợ khủng hoảng.',
      },
      social_support: {
        label: 'Hỗ trợ xã hội',
        shortDesc: 'Chỗ ở tạm thời, nhu yếu phẩm hoặc chi phí đi lại khẩn cấp, giữ trẻ và kết nối sinh kế.',
      },
    },
    safetySection: {
      title: 'Xây dựng quanh quyền tự chủ và giới hạn hệ thống trung thực',
      cta: 'An toàn, Quyền riêng tư & Trạng thái Vận hành',
      items: [
        {
          title: 'Không bao giờ quyết định thay bạn',
          body: 'OneDoor không bao giờ yêu cầu bạn rời đi, ở lại, đối mặt với ai hay trình báo. Bạn và chuyên gia có chuyên môn luôn nắm quyền quyết định.',
        },
        {
          title: 'Đồng thuận rõ ràng & tối thiểu hóa dữ liệu',
          body: 'Chỉ bản tóm tắt và các mục bạn xem xét, phê duyệt mới được lưu. Mô tả gốc không bao giờ bị ghi nhật ký hay tự động gửi đi.',
        },
        {
          title: 'Trung thực về danh bạ địa phương',
          body: 'Chúng tôi không bao giờ bịa đặt tổ chức, số điện thoại hay giả vờ đã gửi chuyển tiếp khi chưa có đối tác xác minh tại khu vực đó.',
        },
      ],
    },
    visualShowcase: {
      welcomeAlt: 'Cổng vòm ngập nắng mở ra khoảng sân vườn yên bình',
      welcomeCaption: 'Lối vào êm dịu, bảo mật mà không cần lặp lại câu chuyện.',
      privacyAlt: 'Đôi tay cẩn thận xem lại bản tóm tắt cá nhân bên khung cửa sổ đầy nắng',
      privacyCaption: 'Bạn kiểm tra, chỉnh sửa từng từ trước khi lưu bất cứ thông tin nào.',
      communityAlt: 'Hai người hỗ trợ nhau bên khu nhà sinh hoạt cộng đồng yên tĩnh',
      communityCaption: 'Kết nối nhu cầu thường ngày với các hướng chăm sóc rõ ràng.',
      globalAlt: 'Cổng vòm kết hợp cùng đường nét bản đồ thế giới và lối đi ánh sáng',
      globalCaption: 'Thiết kế cho người dùng toàn cầu với thông tin danh bạ minh bạch.',
      heroPhotoAlt: 'Hai người phụ nữ ngồi trên ghế đá sân vườn yên tĩnh, trò chuyện ấm áp bên tách trà cạnh mảng xanh',
      counselorPhotoAlt: 'Nhân viên hỗ trợ lắng nghe tôn trọng và điềm tĩnh bên bàn gỗ trong phòng tư vấn ngập nắng',
      counselorPhotoCaption: 'Sự đồng hành nhân văn dựa trên lắng nghe bình tĩnh, không phán xét hay thúc ép.',
      calmPortraitAlt: 'Một người ngồi thư thái bên khung cửa sổ đầy nắng cùng tách trà và cuốn sổ mở',
      pathwayCareAlt: 'Tranh minh họa phòng chăm sóc yên tĩnh với cửa vòm xanh sẫm, đèn hổ phách ấm và hai tách trà',
      pathwayCareCaption: 'Các lộ trình rõ ràng gồm y tế, pháp lý, bảo vệ an toàn và hỗ trợ thiết thực hằng ngày.',
      intakeDeskAlt: 'Tranh minh họa bàn viết gỗ riêng tư bên cửa sổ vòm ngập nắng cùng sổ tay và bút',
      intakeDeskCaption: 'Đừng vội vàng — hãy viết hoặc nói riêng tư theo nhịp độ của bạn trước khi chọn nội dung chia sẻ.',
    },
    location: {
      sectionTitle: 'Vị trí của bạn (tùy chọn, mặc định nhập thủ công)',
      privacyWhy:
        'Chỉ dùng để kiểm tra xem có dịch vụ đã xác minh gần thành phố hoặc quốc gia của bạn hay không. Không yêu cầu địa chỉ đường phố, và tọa độ GPS bị xóa ngay sau khi tra cứu.',
      searchLabel: 'Tìm thành phố, vùng, mã bưu chính hoặc quốc gia',
      searchPlaceholder: 'Nhập thành phố, mã bưu chính hoặc quốc gia (vd: Hà Nội, London, Toronto)...',
      searching: 'Đang tìm vị trí...',
      noSuggestions: 'Không có gợi ý phù hợp. Bạn có thể nhập quốc gia và thành phố thủ công bên dưới.',
      autocompleteError:
        'Tự động gợi ý vị trí tạm thời không khả dụng. Bạn có thể nhập quốc gia và thành phố thủ công bên dưới.',
      manualFieldsTitle: 'Hoặc nhập chi tiết vị trí thủ công',
      countryLabel: 'Quốc gia',
      countryPlaceholder: 'vd: Việt Nam, Vương quốc Anh, Brazil',
      cityLabel: 'Thành phố / Thị xã',
      cityPlaceholder: 'vd: TP. Hồ Chí Minh, Đà Nẵng, Manchester',
      regionLabel: 'Tỉnh / Bang / Vùng (tùy chọn)',
      regionPlaceholder: 'vd: Đồng Nai, Ontario',
      postalLabel: 'Mã bưu chính (tùy chọn)',
      postalPlaceholder: 'vd: 700000, SW1A',
      confirmManualButton: 'Xác nhận vị trí thủ công',
      manualValidationError: 'Vui lòng nhập ít nhất quốc gia hoặc thành phố để xác nhận vị trí.',
      useGpsButton: 'Sử dụng vị trí hiện tại của tôi',
      gpsDetecting: 'Đang xin quyền và tra cứu thành phố/quốc gia gần đúng...',
      gpsPrivacyNote:
        'Chỉ hỏi quyền khi bạn bấm nút. Tọa độ không bao giờ lưu trong URL hoặc nhật ký máy chủ.',
      detectedTitle: 'Đã phát hiện vị trí gần đúng — vui lòng xác nhận:',
      confirmDetectedButton: 'Xác nhận vị trí này',
      dismissDetectedButton: 'Bỏ qua / Nhập thủ công',
      confirmedLabel: 'Vị trí đã xác nhận:',
      editButton: 'Chỉnh sửa',
      clearButton: 'Xóa (Không muốn chia sẻ)',
      preferNotToShare: 'Không chia sẻ vị trí — tiếp tục không kèm vị trí.',
      errUnavailable: 'Trình duyệt trên thiết bị này không hỗ trợ định vị. Vui lòng nhập vị trí thủ công.',
      errDenied: 'Quyền truy cập vị trí bị từ chối. Bạn có thể nhập quốc gia và thành phố thủ công bất cứ lúc nào.',
      errPositionUnavailable:
        'Dịch vụ vị trí hiện đang tắt hoặc không khả dụng. Vui lòng nhập vị trí thủ công.',
      errTimeout: 'Hết thời gian xác định vị trí. Vui lòng nhập thủ công hoặc thử lại.',
      errReverseFailed:
        'Không thể chuyển tọa độ thành tên địa điểm dễ đọc. Vui lòng nhập thành phố hoặc quốc gia thủ công.',
      errIncomplete:
        'Tọa độ phát hiện không trả về thành phố hoặc quốc gia rõ ràng. Vui lòng nhập thủ công.',
    },
    intake: {
      confidentialKicker: 'Tiếp nhận hỗ trợ bảo mật · Không cần tài khoản · Không tải ảnh',
      title: 'Chia sẻ điều đã xảy ra',
      subtitle:
        'Chỉ chia sẻ những gì bạn cảm thấy an toàn và thoải mái. Không cần tài khoản, và mô tả của bạn không bao giờ được lưu log trên máy chủ.',
      privacyReassurance:
        'Bạn không cần chia sẻ tên thật, số điện thoại hay địa chỉ chính xác. Bạn kiểm soát từng từ trong bản tóm tắt cuối cùng.',
      englishClassifierNote:
        'Lưu ý ngôn ngữ mô hình: Giao diện hoạt động bằng ngôn ngữ bạn chọn, trong khi bộ phân loại ML hiện chỉ đánh giá mô tả bằng tiếng Anh.',
      modeWrite: 'Viết mô tả',
      modeTalk: 'Nói (Nhập giọng nói)',
      descriptionLabel: 'Chuyện gì đã xảy ra hoặc bạn đang tìm sự hỗ trợ nào?',
      descriptionPlaceholder:
        'Mô tả tình huống bằng lời của bạn—ví dụ: thương tích, an toàn đêm nay, câu hỏi pháp lý hoặc căng thẳng tâm lý...',
      minorCheckbox: 'Tình huống này liên quan đến người dưới 18 tuổi (hiển thị lưu ý bảo vệ trẻ em)',
      nothingSavedNote: 'Không có gì được lưu hoặc chia sẻ tự động ở bước này.',
      submitButton: 'Sắp Xếp Lựa Chọn Hỗ Trợ',
      analyzingButton: 'Đang sắp xếp nhu cầu hỗ trợ...',
      minLengthError: 'Vui lòng viết hoặc nói ít nhất 3 ký tự để OneDoor sắp xếp các lựa chọn.',
      networkError: 'Lỗi kết nối khi sắp xếp lựa chọn hỗ trợ. Vui lòng thử lại.',
      resultsKicker: 'Bộ phân loại TF-IDF + Logistic Regression đã huấn luyện',
      resultsTitle: 'Các Hướng Hỗ Trợ Gợi Ý',
      refineButton: 'Tạo Giải Thích Nhẹ Nhàng & Tóm Tắt',
      refiningButton: 'Đang soạn giải thích nhẹ nhàng...',
      geminiUsedBadge: 'Tóm tắt được diễn đạt bằng Gemini (phân loại vẫn do ML nội bộ thực hiện)',
      urgencyTitlePrefix: 'Ghi nhận khả năng cần xử lý gấp (điểm ML: {pct}%)',
      urgencyNotice:
        'Mô hình tự động nhận thấy khả năng cần chú ý sớm. Đây không phải đánh giá y tế hoặc an toàn chuyên môn—nếu bạn đang gặp nguy hiểm tức thì, hãy tìm trợ giúp khẩn cấp tại địa phương.',
      minorTitle: 'Lưu ý về Người dưới 18 tuổi & Bảo vệ Trẻ em',
      minorSafeguardingNote:
        'Thông báo bảo vệ: Các quy trình pháp lý và bảo vệ trẻ em bổ sung sẽ áp dụng bất cứ khi nào có người dưới 18 tuổi bị ảnh hưởng.',
      uncertaintyTitle: 'Minh bạch mô hình & mức độ chắc chắn',
      confidenceLabel: 'Mức độ tin cậy:',
      confidenceLow: 'Thấp (Giữ mở rộng các lựa chọn)',
      confidenceUncertain: 'Chưa chắc chắn / Tín hiệu đan xen',
      confidenceClear: 'Tín hiệu từ ngữ rõ hơn',
      defaultExplanationLow:
        'Bộ phân loại có mức độ tin cậy thấp hơn với một phần nội dung—điều thường gặp với câu ngắn, gián tiếp hoặc không phải tiếng Anh. Các lựa chọn rộng bên dưới vẫn mở để bạn chọn hoặc bỏ chọn.',
      defaultExplanationNormal:
        'Dựa trên các mẫu đã học khi huấn luyện, mô hình ML đã làm nổi bật {needs}{urgent}. Bạn có thể điều chỉnh bất kỳ mục nào bên dưới trước khi tạo tóm tắt.',
      defaultSummaryTemplate:
        'Yêu cầu hỗ trợ{location} về {needs}.{urgent}{minor} Người dùng muốn xem xét các lựa chọn mà không lặp lại toàn bộ chi tiết.',
      nonEnglishModelNote:
        'Bộ phân loại ML hiện chỉ đánh giá văn bản tiếng Anh. Do phát hiện văn bản không phải tiếng Anh, độ tin cậy tự động thấp và mọi lựa chọn chung đều mở sẵn cho bạn.',
      adjustNeedsPrompt: 'Chọn hoặc bỏ chọn các nhu cầu hỗ trợ để điều chỉnh bản tóm tắt và tìm dịch vụ:',
      statusSuggested: 'Đề xuất',
      statusUncertain: 'Chưa chắc chắn',
      statusBelow: 'Dưới ngưỡng',
      keywordsLabel: 'Từ khóa ghi nhận:',
      centersKicker: 'Đối Chiếu Danh Bạ Dịch Vụ Quốc Tế',
      centersTitle: 'Tình Trạng Dịch Vụ Hỗ Trợ Địa Phương',
      noVerifiedForLocationTitle: 'Chưa có đơn vị xác minh tại địa phương cho {location}',
      noVerifiedForLocationBody:
        'OneDoor không bao giờ bịa đặt tổ chức, địa chỉ hoặc số điện thoại. Hệ thống đã kiểm tra danh bạ xác minh cho {location} nhưng hiện chưa có đối tác nào được kết nối. Bạn vẫn có thể dùng bản tóm tắt chỉnh sửa bên dưới khi liên hệ dịch vụ địa phương.',
      noLocationSharedTitle: 'Chưa xác nhận vị trí — hiển thị trung thực trạng thái danh bạ',
      noLocationSharedBody:
        'Bạn đã chọn không chia sẻ vị trí và hiện chưa có đối tác quốc tế xác minh nào được thêm. Bạn có thể nhập thành phố hoặc quốc gia ở trên bất cứ lúc nào, hoặc chuẩn bị bản tóm tắt cá nhân bên dưới.',
      rankPrefix: 'Hạng #{rank}',
      matchPrefix: 'Phù hợp {score}',
      whyMatched: 'Lý do phù hợp:',
      selectPathway: 'Chọn Dịch Vụ',
      selectedPathway: 'Đã Chọn Dịch Vụ',
      referralKicker: 'Tóm Tắt Theo Đồng Thuận · Lưu Cục Bộ Trong Khi Chờ Kết Nối Đối Tác',
      referralTitle: 'Xem Lại, Chỉnh Sửa & Lưu Tóm Tắt Chuyển Tiếp',
      referralSubtitle:
        'Chỉnh sửa mọi chi tiết bên dưới trước khi lưu. Việc lưu tạo một mã tham chiếu riêng để bạn sao chép, tải xuống, tra cứu hoặc xóa bất cứ lúc nào.',
      selectedServiceLabel: 'Đơn vị nhận / định dạng đã chọn:',
      selfDirectedLabel: 'Tóm tắt chuyển tiếp cá nhân (sẵn sàng sao chép hoặc tải xuống cho bất kỳ đơn vị địa phương nào)',
      summaryEditorLabel: 'Nội dung tóm tắt chính xác sẽ lưu (chỉnh sửa hoặc xóa tùy ý)',
      includeLocationLabel: 'Bao gồm vị trí đã xác nhận:',
      notProvided: 'Không cung cấp',
      includeUrgencyLabel: 'Bao gồm dấu hiệu cần hỗ trợ sớm:',
      flaggedLabel: 'Đã đánh dấu',
      notFlaggedLabel: 'Không đánh dấu',
      previewTitle: 'Các trường chính xác trong bản tóm tắt chuyển tiếp đã lưu:',
      previewNeeds: 'Nhu cầu hỗ trợ:',
      previewLocation: 'Vị trí:',
      previewUrgency: 'Ghi chú khẩn cấp:',
      previewRawText: 'Có lưu văn bản thô ban đầu không?',
      noneSelected: 'Chưa chọn mục nào',
      notIncluded: 'Không bao gồm',
      urgencySummaryValue: 'Có khả năng cần hỗ trợ sớm',
      noRawSavedValue: 'Không (chỉ lưu bản tóm tắt bạn đã chỉnh sửa ở trên).',
      consentCheckbox:
        'Tôi đã xem lại bản tóm tắt ở trên và xác nhận các chi tiết đã chọn này có thể được lưu vào hồ sơ chuyển tiếp của tôi.',
      sendReferralButton: 'Phê Duyệt & Lưu Tóm Tắt',
      savingButton: 'Đang lưu bản tóm tắt...',
      savedStatusLabel: 'Đã lưu cục bộ (chưa truyền ra ngoài)',
      referencePrefix: 'Mã tham chiếu:',
      savedBodyPrefix: 'Bản tóm tắt đã chỉnh sửa của bạn được lưu bằng mã tham chiếu riêng cho:',
      savedBodySuffix:
        'Vì kết nối đối tác bên ngoài chưa được tích hợp tại đây, hồ sơ này chưa tự động gửi đi—hãy sao chép hoặc tải xuống bên dưới, hoặc xóa vĩnh viễn bất cứ lúc nào.',
      copySummary: 'Sao Chép Tóm Tắt',
      copiedSummary: 'Đã Sao Chép',
      downloadSummary: 'Tải Tóm Tắt (.txt)',
      withdrawRecord: 'Rút Lại & Xóa Hồ Sơ',
      readinessLink: 'Chi tiết mức độ sẵn sàng vận hành',
      withdrawnConfirmation: 'Hồ sơ đã lưu {code} đã được xóa vĩnh viễn khỏi bộ nhớ OneDoor.',
      lookupTitle: 'Tra Cứu Hoặc Rút Lại Tóm Tắt Đã Lưu',
      lookupSubtitle:
        'Hồ sơ đã lưu không bao giờ được liệt kê công khai. Nhập mã riêng OD-REF-XXXXXX của bạn để xem, tải xuống hoặc xóa vĩnh viễn.',
      lookupToggleOpen: 'Nhập Mã Tham Chiếu',
      lookupToggleClose: 'Ẩn Tra Cứu',
      lookupPlaceholder: 'OD-REF-123456',
      lookupButton: 'Tìm Hồ Sơ',
      lookupChecking: 'Đang kiểm tra...',
      lookupEmptyError: 'Nhập mã tham chiếu (vd: OD-REF-123456).',
      lookupDeleteButton: 'Xóa Vĩnh Viễn',
    },
    voice: {
      kicker: 'Đọc Chính Tả Trên Trình Duyệt · Không phải đường dây nóng trực tiếp',
      title: 'Nói Mô Tả Của Bạn',
      audioOn: 'Đang Bật Âm Thanh',
      audioMuted: 'Đã Tắt Âm Thanh',
      guidancePrompt:
        'Hãy nói theo nhịp độ của riêng bạn bất cứ khi nào sẵn sàng. Chỉ chia sẻ những gì bạn thấy an toàn—tên và địa chỉ cụ thể là tùy chọn, và bạn có thể sửa từng từ trước khi sắp xếp lựa chọn hỗ trợ.',
      readyStatus: 'Dùng micrô để đọc chính tả, hoặc gõ trực tiếp bên dưới.',
      unsupportedStatus: 'Trình duyệt này không hỗ trợ chuyển giọng nói thành văn bản. Bạn có thể gõ trực tiếp vào ô bên dưới.',
      stoppedStatus: 'Đã dừng micrô. Xem lại hoặc chỉnh sửa văn bản bên dưới.',
      listeningStatus: 'Đang nghe qua micrô trình duyệt... Hãy nói chậm rãi theo nhịp của bạn.',
      micErrorPrefix: 'Không thể dùng micrô ({error}). Bạn có thể gõ trực tiếp bên dưới.',
      startMic: 'Bật Micrô',
      stopMic: 'Dừng Micrô',
      readAloud: 'Đọc To Hướng Dẫn',
      transcriptLabel: 'Ghi chú đã nói (chỉnh sửa hoặc xóa trước khi sắp xếp)',
      transcriptPlaceholder: 'Lời bạn nói sẽ hiện ở đây, hoặc bạn có thể gõ trực tiếp...',
      submitButton: 'Sắp Xếp Lựa Chọn Hỗ Trợ',
    },
    about: {
      kicker: 'An toàn, Sẵn sàng Vận hành, Quyền riêng tư & Kiến trúc Toàn cầu',
      title: 'Giới thiệu về OneDoor',
      intro:
        'OneDoor là nền tảng điều hướng hỗ trợ quốc tế ưu tiên quyền riêng tư, giúp người bị ảnh hưởng bởi bạo lực hoặc quấy rối sắp xếp nhu cầu hỗ trợ và chuẩn bị bản tóm tắt chuyển tiếp có kiểm soát đồng thuận mà không phải kể lại câu chuyện nhiều lần.',
      disclaimerTitle: 'Nguyên mẫu & Tuyên bố Miễn trừ Y tế',
      disclaimerBody:
        'OneDoor không phải dịch vụ điều phối khẩn cấp và không cung cấp chẩn đoán y tế, tâm lý hay pháp lý. Các bản tóm tắt đã lưu hiện chỉ nằm trên nền tảng này cho đến khi thiết lập kết nối đối tác xác minh.',
      worksTitle: 'Những Gì Đang Hoạt Động',
      worksItems: [
        {
          title: 'Phân loại ML Đã Huấn Luyện',
          body: 'Mô hình TF-IDF + Logistic Regression L2 phân loại mô tả tiếng Anh thành 6 nhóm hỗ trợ và gắn cờ khả năng khẩn cấp kèm chỉ báo độ tin cậy rõ ràng.',
        },
        {
          title: 'Tìm Kiếm Vị Trí Toàn Cầu & Bộ Đối Chiếu',
          body: 'Hỗ trợ tìm kiếm thủ công theo quốc gia/thành phố/vùng/mã bưu chính, định vị ngược tùy chọn theo quyền người dùng và lọc danh bạ xác minh.',
        },
        {
          title: 'Giao Diện 20 Ngôn Ngữ (gồm RTL)',
          body: 'Chuyển đổi mượt mà giữa 20 ngôn ngữ gồm bố cục phải-sang-trái cho tiếng Ả Rập và tiếng Urdu, lưu lại giữa các lần truy cập.',
        },
        {
          title: 'Tóm Tắt Chuyển Tiếp Có Đồng Thuận',
          body: 'Chỉnh sửa từng từ, chọn mục đính kèm, sao chép hoặc tải (.txt), và lưu hoặc xóa vĩnh viễn bằng mã riêng OD-REF-XXXXXX.',
        },
      ],
      notYetTitle: 'Chưa Sẵn Sàng Cho Vận Hành Thực Tế',
      notYetItems: [
        {
          title: 'Danh Bạ Đối Tác Quốc Tế Đã Xác Minh',
          body: 'Các phòng khám, nhà tạm lánh, đường dây nóng và đơn vị trợ giúp pháp lý thực tế tại từng quốc gia phải được thẩm định trước khi hiển thị liên hệ.',
        },
        {
          title: 'Truyền Tải Chuyển Tiếp Ra Bên Ngoài',
          body: 'Lưu bản tóm tắt hiện chỉ lưu cục bộ kèm mã tham chiếu; chưa tự động gửi tới tổ chức bên ngoài nào.',
        },
        {
          title: 'Huấn Luyện ML Đa Ngôn Ngữ',
          body: 'Giao diện hỗ trợ 20 ngôn ngữ, trong khi bộ phân loại ML hiện tại chỉ được huấn luyện bằng tiếng Anh và sẽ thông báo trung thực khi gặp ngôn ngữ khác.',
        },
        {
          title: 'Kiểm Toán Bảo Mật & Quản Trị Lâm Sàng',
          body: 'Triển khai thực tế đòi hỏi mã hóa đầu-cuối, kiểm thử xâm nhập, rà soát pháp lý/lâm sàng và quy trình bảo vệ trẻ em chính thức.',
        },
      ],
      safeguardingTitle: 'Người Dưới 18 Tuổi & Bảo Vệ Trẻ Em',
      safeguardingBody:
        'Các yêu cầu pháp lý và bảo vệ trẻ em bổ sung sẽ áp dụng bất cứ khi nào có người dưới 18 tuổi bị ảnh hưởng. Vận hành thực tế cần chuyên gia bảo vệ trẻ em được đào tạo.',
      quickExitTitle: 'Thoát Nhanh & Lưu Ý Riêng Tư Trình Duyệt',
      quickExitBody:
        'Nút Thoát Nhanh trên mọi trang chuyển ngay tới trang thời tiết trung tính bằng cách thay thế lịch sử hiện tại. Nút này không xóa lịch sử trình duyệt—hãy dùng cửa sổ ẩn danh khi an toàn.',
      directoryTitle: 'Trạng Thái Danh Bạ Dịch Vụ Xác Minh',
      directoryBody:
        'Để tránh gây hiểu lầm cho người đang gặp khó khăn, OneDoor hiện không đăng tải bất kỳ tổ chức chưa xác minh hoặc giả định nào. Khi đối tác địa phương được xác minh, họ sẽ chỉ hiển thị cho đúng khu vực phù hợp.',
      architectureTitle: 'Kiến Trúc & Xử Lý Dữ Liệu Có Trách Nhiệm',
      architectureItems: [
        {
          title: 'Đạo Đức Dữ Liệu Huấn Luyện',
          body: 'Mô hình ML nội bộ chỉ được huấn luyện trên 200 mô tả tổng hợp—không bao giờ dùng lời kể thật của người bị hại.',
        },
        {
          title: 'Quyền Riêng Tư Tọa Độ & Văn Bản',
          body: 'Văn bản thô và tọa độ GPS không bao giờ được máy chủ ghi nhật ký hoặc đưa vào URL.',
        },
        {
          title: 'Mã Tham Chiếu Riêng Tư',
          body: 'Các bản tóm tắt đã lưu không bao giờ được liệt kê công khai và chỉ có thể xem hoặc xóa bằng mã tham chiếu riêng.',
        },
      ],
    },
    footer: {
      navigationTitle: 'Điều hướng',
      safetyTitle: 'An toàn & Ngôn ngữ',
      prototypeNote:
        'OneDoor không bao giờ đăng tải tổ chức chưa xác minh hay liên hệ giả; danh bạ địa phương chỉ được bổ sung khi đối tác thực tế đã được xác minh.',
      languageNotice: 'Hỗ trợ 20 ngôn ngữ · Bộ phân loại ML hiện đánh giá văn bản tiếng Anh.',
    },
  },
};
