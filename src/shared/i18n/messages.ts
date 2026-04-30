export const supportedLocales = ['ru', 'en'] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = 'en';
export const localeCookieName = 'locale';

type HomeDataItem = {
  label: string;
  href: string;
};

type MessagesShape = {
  metadata: {
    description: string;
  };
  common: {
    back: string;
    close: string;
    hide: string;
    loading: string;
    next: string;
    ok: string;
    openImage: string;
    retry: string;
    save: string;
    viewImage: string;
  };
  header: {
    title: string;
    subtitle: string;
    navigationLabel: string;
    nav: {
      home: string;
      favorites: string;
      battles: string;
      leaderboard: string;
    };
    locale: {
      label: string;
      ru: string;
      en: string;
    };
  };
  footer: {
    email: string;
    builtWith: string;
    copyright: string;
  };
  home: {
    introTitle: string;
    introText: string;
    sectionsEyebrow: string;
    sections: string[];
    dataEyebrow: string;
    data: HomeDataItem[];
    featuredTitle: string;
    actionsEyebrow: string;
    actionsText: string;
  };
  favorites: {
    introTitle: string;
    introText: string;
    previewEyebrow: string;
    previewItems: string[];
    orderEyebrow: string;
    orderText: string;
    sectionTitle: string;
    savedLabel: string;
    loginRequiredMeta: string;
    authPrompt: string;
    empty: string;
    viewerAlt: string;
    viewerAria: string;
    addedPrefix: string;
    addedSeparator: string;
    removedBadge: string;
  };
  battles: {
    introTitle: string;
    introText: string;
    rulesEyebrow: string;
    rules: string[];
    currentPairTitle: string;
    currentPairMeta: string;
    battleImageAlt: string;
    battleViewerAria: string;
    errorTitle: string;
    errorDescription: string;
    insufficientData: string;
    dailyLimitReached: string;
    voteButton: string;
    loginToVote: string;
  };
  leaderboard: {
    introTitle: string;
    introText: string;
    sortingEyebrow: string;
    sorting: string[];
    sectionTitle: string;
    empty: string;
    pagerAria: string;
    table: {
      photo: string;
      link: string;
      score: string;
      open: string;
      viewerAlt: string;
      viewerAria: string;
    };
  };
  history: {
    title: string;
    updating: string;
    recent: string;
    tabsLabel: string;
    all: string;
    mine: string;
    loginRequired: string;
    loadFailed: string;
    empty: string;
    winnerAlt: string;
    loserAlt: string;
    resultWon: string;
    viewerAria: string;
  };
  featuredCat: {
    alt: string;
    openAria: string;
    refresh: string;
    refreshing: string;
    errorTitle: string;
    errorDescription: string;
    viewerAria: string;
  };
  auth: {
    account: string;
    loggedInAs: string;
    login: string;
    logout: string;
    register: string;
    createAccount: string;
    close: string;
    actionChoice: string;
    modalLabelLogin: string;
    modalLabelRegister: string;
    emailOrLogin: string;
    email: string;
    name: string;
    password: string;
    helper: string;
    collectionPrompt: string;
    needLoginTitle: string;
    needLoginText: string;
    errors: {
      enterCredentials: string;
      fillEmailPassword: string;
      loginFailed: string;
      registerFailed: string;
      rateLimited: string;
      missingUsernamePassword: string;
      missingEmailPassword: string;
      invalidEmail: string;
      shortPassword: string;
      invalidCredentials: string;
      accountSetupIncomplete: string;
      accountExists: string;
      loadAccountFailed: string;
      genericLoginFailed: string;
      genericCreateFailed: string;
    };
  };
  errors: {
    genericTitle: string;
    genericDescription: string;
    pageTitle: string;
    pageDescription: string;
    globalTitle: string;
    globalDescription: string;
  };
  images: {
    closeViewer: string;
    previous: string;
    next: string;
    defaultViewerAria: string;
    openImageWithAlt: string;
    unavailable: string;
  };
  favoriteButton: {
    add: string;
    remove: string;
  };
  catCard: {
    age: string;
    wins: string;
    likes: string;
    like: string;
  };
};

export type Messages = MessagesShape;

export const messages: Record<Locale, Messages> = {
  ru: {
    metadata: {
      description: 'Кот дня, избранное, битвы и рейтинг для тех, кто любит котов.',
    },
    common: {
      back: 'Назад',
      close: 'Закрыть',
      hide: 'Скрыть',
      loading: 'Обновляем...',
      next: 'Дальше',
      ok: 'Ок',
      openImage: 'Открыть изображение',
      retry: 'Повторить',
      save: 'Сохранить',
      viewImage: 'Просмотр изображения',
    },
    header: {
      title: 'CATastrophic club',
      subtitle:
        'Небольшой клуб для тех, кто любит котов, картинки и немного соревновательного духа.',
      navigationLabel: 'Основная навигация',
      nav: {
        home: 'Главная',
        favorites: 'Избранное',
        battles: 'Битвы',
        leaderboard: 'Рейтинг',
      },
      locale: {
        label: 'Язык',
        ru: 'Русский',
        en: 'English',
      },
    },
    footer: {
      email: 'Почта: teaspoonkitsune@proton.me', // kitty-committee@catastrophic.club is still cool alternative, but not registered
      builtWith: 'Сделано на Next 16',
      copyright: '2026 CATastrophic club',
    },
    home: {
      introTitle: 'CATastrophic club',
      introText:
        'Здесь кот, там кот. Заходи посмотреть кота дня, собрать избранное и устроить пару честных битв за звание самой обаятельной мордочки.',
      sectionsEyebrow: 'разделы',
      sections: [
        'Избранное для любимых находок',
        'Битвы для быстрых дуэлей',
        'Рейтинг для победителей',
      ],
      dataEyebrow: 'данные',
      data: [
        { label: 'Фото: cataas.com', href: 'https://cataas.com/' },
        { label: 'Факты: catfact.ninja', href: 'https://catfact.ninja/' },
      ],
      featuredTitle: 'Кот дня',
      actionsEyebrow: 'действия',
      actionsText:
        'Открой фото, сохрани понравившегося кота или обнови карточку, если хочется увидеть еще одного героя дня.',
    },
    favorites: {
      introTitle: 'Избранное',
      introText: 'Твоя личная полка с котиками, к которым хочется возвращаться.',
      previewEyebrow: 'просмотр',
      previewItems: [
        'Фото открываются в крупном просмотре',
        'Между сохраненными котиками можно листать',
        'Убрать кота можно прямо из окна просмотра',
      ],
      orderEyebrow: 'порядок',
      orderText: 'Новые сохранения всегда лежат сверху.',
      sectionTitle: 'Мои котики',
      savedLabel: 'Сохранено',
      loginRequiredMeta: 'Нужно войти в аккаунт',
      authPrompt: 'Войдите, чтобы собирать свою коллекцию любимых котиков.',
      empty: 'В избранном пока ничего нет.',
      viewerAlt: 'Котик из избранного',
      viewerAria: 'Просмотр котика из избранного',
      addedPrefix: 'Добавлено:',
      addedSeparator: 'в',
      removedBadge: 'Убрано из избранного',
    },
    battles: {
      introTitle: 'Битвы котиков',
      introText: 'Две мордочки, один голос. Выбери того, кто сегодня явно в ударе.',
      rulesEyebrow: 'правила',
      rules: [
        'Победитель получает одно очко',
        'Новая пара появляется сразу после выбора',
        'Понравившегося кота можно сохранить',
      ],
      currentPairTitle: 'Текущая пара',
      currentPairMeta: 'Победитель получает 1 очко',
      battleImageAlt: 'Котик для битвы',
      battleViewerAria: 'Просмотр котика для битвы',
      errorTitle: 'Не удалось загрузить битву',
      errorDescription: 'Попробуйте еще раз.',
      insufficientData: 'Недостаточно данных для битвы.',
      dailyLimitReached: 'Лимит голосов на сегодня исчерпан.',
      voteButton: 'Выбрать',
      loginToVote: 'Войдите, чтобы голосовать',
    },
    leaderboard: {
      introTitle: 'Рейтинг',
      introText: 'Здесь собираются котики, которые чаще других выходят из битв победителями.',
      sortingEyebrow: 'сортировка',
      sorting: [
        'Выше поднимаются котики с большим числом очков',
        'При равенстве выше остается тот, кто появился раньше',
      ],
      sectionTitle: 'Лучшие котики',
      empty: 'Рейтинг пока пуст.',
      pagerAria: 'Навигация по рейтингу',
      table: {
        photo: 'Фото',
        link: 'Ссылка',
        score: 'Очки',
        open: 'Открыть',
        viewerAlt: 'Котик из рейтинга',
        viewerAria: 'Просмотр котика из рейтинга',
      },
    },
    history: {
      title: 'История битв',
      updating: 'Обновляем...',
      recent: 'Последние 10 боев',
      tabsLabel: 'Переключение истории битв',
      all: 'Все',
      mine: 'Моя',
      loginRequired: 'Войдите, чтобы посмотреть свою историю.',
      loadFailed: 'Не удалось загрузить историю. Код:',
      empty: 'История пуста.',
      winnerAlt: 'Победитель битвы',
      loserAlt: 'Проигравший битвы',
      resultWon: 'победил',
      viewerAria: 'Просмотр котика из истории битв',
    },
    featuredCat: {
      alt: 'Кот дня',
      openAria: 'Открыть картинку дня',
      refresh: 'Другое фото',
      refreshing: 'Обновляем...',
      errorTitle: 'Не удалось загрузить фото',
      errorDescription: 'Попробуйте еще раз.',
      viewerAria: 'Просмотр картинки дня',
    },
    auth: {
      account: 'аккаунт',
      loggedInAs: 'Вы вошли как',
      login: 'Войти',
      logout: 'Выйти',
      register: 'Регистрация',
      createAccount: 'Создать аккаунт',
      close: 'Закрыть',
      actionChoice: 'Выбор действия',
      modalLabelLogin: 'Вход в аккаунт',
      modalLabelRegister: 'Регистрация',
      emailOrLogin: 'Email или логин',
      email: 'Email',
      name: 'Логин',
      password: 'Пароль',
      helper: 'Вход в боковой панели. Регистрация откроется в окне.',
      collectionPrompt: 'Войдите, чтобы собирать свою коллекцию любимых котиков.',
      needLoginTitle: 'Нужно войти',
      needLoginText: 'Избранное доступно после входа.',
      errors: {
        enterCredentials: 'Введите логин и пароль.',
        fillEmailPassword: 'Введите логин, email и пароль.',
        loginFailed: 'Не удалось войти в аккаунт.',
        registerFailed: 'Не удалось создать аккаунт.',
        rateLimited: 'Слишком много попыток. Попробуйте немного позже.',
        missingUsernamePassword: 'Введите логин и пароль.',
        missingEmailPassword: 'Введите логин, email и пароль.',
        invalidEmail: 'Введите корректный email.',
        shortPassword: 'Пароль должен быть не короче 8 символов.',
        invalidCredentials: 'Неверный логин или пароль.',
        accountSetupIncomplete:
          'Аккаунт создан, но Keycloak считает его незавершенным. Проверь required actions в админке.',
        accountExists: 'Аккаунт с такой почтой или логином уже существует.',
        loadAccountFailed: 'Не удалось загрузить данные аккаунта.',
        genericLoginFailed: 'Не удалось войти в аккаунт.',
        genericCreateFailed: 'Не удалось создать аккаунт.',
      },
    },
    errors: {
      genericTitle: 'Что-то пошло не так',
      genericDescription: 'Попробуйте еще раз чуть позже.',
      pageTitle: 'Что-то пошло не так',
      pageDescription: 'Страница не загрузилась как надо. Попробуй открыть её ещё раз.',
      globalTitle: 'Сайт споткнулся',
      globalDescription:
        'Попробуй обновить страницу. Обычно этого хватает, чтобы всё вернулось на место.',
    },
    images: {
      closeViewer: 'Закрыть просмотр',
      previous: 'Предыдущее фото',
      next: 'Следующее фото',
      defaultViewerAria: 'Просмотр изображения',
      openImageWithAlt: 'Открыть изображение:',
      unavailable: 'Изображение недоступно',
    },
    favoriteButton: {
      add: 'Добавить в избранное',
      remove: 'Убрать из избранного',
    },
    catCard: {
      age: 'Возраст',
      wins: 'Побед',
      likes: 'Лайков',
      like: 'Лайк',
    },
  },
  en: {
    metadata: {
      description:
        'Cat of the day, favorites, battles, and a leaderboard for people who like cats.',
    },
    common: {
      back: 'Back',
      close: 'Close',
      hide: 'Hide',
      loading: 'Loading...',
      next: 'Next',
      ok: 'OK',
      openImage: 'Open image',
      retry: 'Retry',
      save: 'Save',
      viewImage: 'View image',
    },
    header: {
      title: 'CATastrophic club',
      subtitle: 'A small club for people who like cats, pictures, and a little competitive spirit.',
      navigationLabel: 'Main navigation',
      nav: {
        home: 'Home',
        favorites: 'Favorites',
        battles: 'Battles',
        leaderboard: 'Leaderboard',
      },
      locale: {
        label: 'Language',
        ru: 'Russian',
        en: 'English',
      },
    },
    footer: {
      email: 'Email: teaspoonkitsune@proton.me', // kitty-committee@catastrophic.club is still cool alternative, but not registered
      builtWith: 'Built with Next 16',
      copyright: '2026 CATastrophic club',
    },
    home: {
      introTitle: 'CATastrophic club',
      introText:
        'A cat here, a cat there. Stop by for the cat of the day, build your favorites shelf, and settle a few fair battles for the title of the most charming face.',
      sectionsEyebrow: 'sections',
      sections: [
        'Favorites for your best finds',
        'Battles for quick duels',
        'Leaderboard for the winners',
      ],
      dataEyebrow: 'data',
      data: [
        { label: 'Photos: cataas.com', href: 'https://cataas.com/' },
        { label: 'Facts: catfact.ninja', href: 'https://catfact.ninja/' },
      ],
      featuredTitle: 'Cat of the day',
      actionsEyebrow: 'actions',
      actionsText:
        'Open the photo, save the cat you like, or refresh the card if you want to meet another daily favorite.',
    },
    favorites: {
      introTitle: 'Favorites',
      introText: 'Your personal shelf of cats worth coming back to.',
      previewEyebrow: 'viewer',
      previewItems: [
        'Photos open in a large viewer',
        'You can browse through saved cats',
        'You can remove a cat right from the viewer',
      ],
      orderEyebrow: 'order',
      orderText: 'New saves always stay on top.',
      sectionTitle: 'My cats',
      savedLabel: 'Saved',
      loginRequiredMeta: 'Sign in required',
      authPrompt: 'Sign in to build your own collection of favorite cats.',
      empty: 'There is nothing in favorites yet.',
      viewerAlt: 'Favorite cat',
      viewerAria: 'Favorite cat viewer',
      addedPrefix: 'Added:',
      addedSeparator: 'at',
      removedBadge: 'Removed from favorites',
    },
    battles: {
      introTitle: 'Cat battles',
      introText: 'Two faces, one vote. Pick the one that is clearly having the better day.',
      rulesEyebrow: 'rules',
      rules: [
        'The winner gets one point',
        'A new pair appears right after your choice',
        'You can save the cat you like',
      ],
      currentPairTitle: 'Current pair',
      currentPairMeta: 'The winner gets 1 point',
      battleImageAlt: 'Battle cat',
      battleViewerAria: 'Battle cat viewer',
      errorTitle: 'Could not load the battle',
      errorDescription: 'Please try again.',
      insufficientData: 'Not enough data for a battle yet.',
      dailyLimitReached: 'You have reached today’s voting limit.',
      voteButton: 'Choose',
      loginToVote: 'Sign in to vote',
    },
    leaderboard: {
      introTitle: 'Leaderboard',
      introText: 'This is where the cats that win battles most often rise to the top.',
      sortingEyebrow: 'sorting',
      sorting: [
        'Cats with more points appear higher',
        'If points are equal, the earlier record stays higher',
      ],
      sectionTitle: 'Top cats',
      empty: 'The leaderboard is empty for now.',
      pagerAria: 'Leaderboard navigation',
      table: {
        photo: 'Photo',
        link: 'Link',
        score: 'Score',
        open: 'Open',
        viewerAlt: 'Leaderboard cat',
        viewerAria: 'Leaderboard cat viewer',
      },
    },
    history: {
      title: 'Battle history',
      updating: 'Updating...',
      recent: 'Last 10 battles',
      tabsLabel: 'Battle history tabs',
      all: 'All',
      mine: 'Mine',
      loginRequired: 'Sign in to view your history.',
      loadFailed: 'Could not load history. Code:',
      empty: 'History is empty.',
      winnerAlt: 'Battle winner',
      loserAlt: 'Battle loser',
      resultWon: 'won',
      viewerAria: 'Battle history viewer',
    },
    featuredCat: {
      alt: 'Cat of the day',
      openAria: 'Open the cat of the day',
      refresh: 'Another photo',
      refreshing: 'Loading...',
      errorTitle: 'Could not load the photo',
      errorDescription: 'Please try again.',
      viewerAria: 'Cat of the day viewer',
    },
    auth: {
      account: 'account',
      loggedInAs: 'Signed in as',
      login: 'Sign in',
      logout: 'Sign out',
      register: 'Register',
      createAccount: 'Create account',
      close: 'Close',
      actionChoice: 'Choose an action',
      modalLabelLogin: 'Sign in',
      modalLabelRegister: 'Registration',
      emailOrLogin: 'Email or username',
      email: 'Email',
      name: 'Username',
      password: 'Password',
      helper: 'Sign in from the sidebar. Registration opens in a separate window.',
      collectionPrompt: 'Sign in to build your own collection of favorite cats.',
      needLoginTitle: 'Sign in required',
      needLoginText: 'Favorites are available after signing in.',
      errors: {
        enterCredentials: 'Enter your username and password.',
        fillEmailPassword: 'Enter your username, email, and password.',
        loginFailed: 'Could not sign in.',
        registerFailed: 'Could not create the account.',
        rateLimited: 'Too many attempts. Please try again a little later.',
        missingUsernamePassword: 'Username and password are required.',
        missingEmailPassword: 'Username, email, and password are required.',
        invalidEmail: 'Enter a valid email address.',
        shortPassword: 'Password must be at least 8 characters long.',
        invalidCredentials: 'Invalid username or password.',
        accountSetupIncomplete:
          'The account was created, but Keycloak still considers it incomplete. Check required actions in the admin panel.',
        accountExists: 'An account with this email or username already exists.',
        loadAccountFailed: 'Could not load account data.',
        genericLoginFailed: 'Could not sign in.',
        genericCreateFailed: 'Could not create the account.',
      },
    },
    errors: {
      genericTitle: 'Something went wrong',
      genericDescription: 'Please try again a little later.',
      pageTitle: 'Something went wrong',
      pageDescription: 'The page did not load as expected. Try opening it again.',
      globalTitle: 'The site tripped over itself',
      globalDescription:
        'Try refreshing the page. That is usually enough to get everything back in place.',
    },
    images: {
      closeViewer: 'Close viewer',
      previous: 'Previous photo',
      next: 'Next photo',
      defaultViewerAria: 'Image viewer',
      openImageWithAlt: 'Open image:',
      unavailable: 'Image unavailable',
    },
    favoriteButton: {
      add: 'Add to favorites',
      remove: 'Remove from favorites',
    },
    catCard: {
      age: 'Age',
      wins: 'Wins',
      likes: 'Likes',
      like: 'Like',
    },
  },
};

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'ru' || value === 'en';
}

export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  return isLocale(normalized) ? normalized : null;
}

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}
