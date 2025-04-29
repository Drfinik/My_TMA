// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация Telegram WebApp
    initTelegramWebApp();
    
    // Инициализация темной/светлой темы
    initTheme();
    
    // Инициализация навигации
    initNavigation();
    
    // Показываем начальную страницу
    const initialPage = getInitialPage();
    switchPage(initialPage, false);
});

// Инициализация Telegram WebApp
function initTelegramWebApp() {
    if (window.Telegram && window.Telegram.WebApp) {
        const tgWebApp = window.Telegram.WebApp;
        
        // Развернуть на весь экран
        tgWebApp.expand();
        
        // Настройка цветов
        tgWebApp.setHeaderColor('#0088cc');
        tgWebApp.setBackgroundColor('#f8f8f8');
        
        // Обработка кнопки "Назад"
        tgWebApp.BackButton.onClick(() => {
            if (window.history.state && window.history.state.prevPage) {
                const prevPage = window.history.state.prevPage;
                switchPage(prevPage, true);
            } else {
                tgWebApp.close();
            }
        });
    }
}

// Инициализация темы
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const newTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
            document.body.dataset.theme = newTheme;
            
            // Сохраняем выбор темы
            localStorage.setItem('theme', newTheme);
            
            // Обновляем фон в Telegram WebApp
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.setBackgroundColor(newTheme === 'dark' ? '#1e1e1e' : '#f8f8f8');
            }
        });
        
        // Восстанавливаем сохраненную тему
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.dataset.theme = savedTheme;
    }
}

// Инициализация навигации
function initNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pageId = btn.dataset.page + '-page';
            switchPage(pageId);
            
            // Обновляем активную кнопку
            document.querySelectorAll('.nav-btn').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
        });
    });
}

// Получение начальной страницы
function getInitialPage() {
    // Проверяем хэш в URL
    if (window.location.hash) {
        const pageFromHash = window.location.hash.substring(1);
        if (document.getElementById(pageFromHash)) {
            return pageFromHash;
        }
    }
    
    // Проверяем сохраненную страницу
    const savedPage = localStorage.getItem('lastPage');
    if (savedPage && document.getElementById(savedPage)) {
        return savedPage;
    }
    
    // Возвращаем страницу по умолчанию
    return 'home-page';
}

// Переключение страниц
function switchPage(pageId, isBackNavigation = false) {
    const currentPage = document.querySelector('.page.active');
    const newPage = document.getElementById(pageId);
    
    if (!newPage || (currentPage && currentPage.id === pageId)) {
        return;
    }
    
    // Анимация перехода
    if (currentPage) {
        gsap.to(currentPage, {
            opacity: 0,
            x: -50,
            duration: 0.3,
            onComplete: () => {
                currentPage.classList.remove('active');
                showNewPage(newPage, isBackNavigation);
            }
        });
    } else {
        showNewPage(newPage, isBackNavigation);
    }
    
    // Обновляем историю
    updateHistory(pageId, isBackNavigation);
    
    // Сохраняем последнюю страницу
    localStorage.setItem('lastPage', pageId);
    
    // Показываем/скрываем кнопку "Назад" в Telegram
    updateTelegramBackButton(pageId);
}

// Показать новую страницу
function showNewPage(page, isBackNavigation) {
    page.style.display = 'block';
    page.classList.add('active');
    
    gsap.fromTo(page, {
        opacity: 0,
        x: isBackNavigation ? -50 : 50
    }, {
        opacity: 1,
        x: 0,
        duration: 0.3
    });
}

// Обновление истории браузера
function updateHistory(pageId, isBackNavigation) {
    const state = {
        pageId: pageId,
        prevPage: document.querySelector('.page.active')?.id || null
    };
    
    if (isBackNavigation) {
        window.history.replaceState(state, '', `#${pageId}`);
    } else {
        window.history.pushState(state, '', `#${pageId}`);
    }
}

// Обновление кнопки "Назад" в Telegram
function updateTelegramBackButton(pageId) {
    if (window.Telegram && window.Telegram.WebApp) {
        const isMainPage = pageId === 'home-page';
        isMainPage 
            ? window.Telegram.WebApp.BackButton.hide()
            : window.Telegram.WebApp.BackButton.show();
    }
}

// Обработка навигации по истории
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.pageId) {
        switchPage(event.state.pageId, true);
        
        // Обновляем активную кнопку навигации
        const pageName = event.state.pageId.replace('-page', '');
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === pageName);
        });
    }
});