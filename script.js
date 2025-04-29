// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    initTelegramWebApp();
    initTheme();
    initNavigation();
    loadInitialPage();
});

// Telegram WebApp Integration
function initTelegramWebApp() {
    if (window.Telegram?.WebApp) {
        const tgWebApp = window.Telegram.WebApp;
        tgWebApp.expand();
        tgWebApp.setHeaderColor('#0088cc');
        tgWebApp.setBackgroundColor('#f8f8f8');
        
        tgWebApp.BackButton.onClick(() => {
            if (window.history.state?.prevPage) {
                navigateTo(window.history.state.prevPage, true);
            } else {
                tgWebApp.close();
            }
        });
    }
}

// Theme Management
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    applyTheme(initialTheme);

    themeToggle.addEventListener('click', () => {
        const newTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.setBackgroundColor(newTheme === 'dark' ? '#1e1e1e' : '#f8f8f8');
        }
    });

    // Системные изменения темы
    window.matchMedia('(prefers-color-scheme: dark)').addListener(e => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
}

function applyTheme(theme) {
    document.body.dataset.theme = theme;
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// Navigation System
function initNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pageId = `${btn.dataset.page}-page`;
            navigateTo(pageId);
            
            document.querySelectorAll('.nav-btn').forEach(b => {
                b.classList.toggle('active', b === btn);
            });
        });
    });
}

function loadInitialPage() {
    const pageFromHash = window.location.hash.substring(1);
    const validPages = ['home-page', 'profile-page', 'settings-page'];
    const initialPage = validPages.includes(pageFromHash) 
        ? pageFromHash 
        : 'home-page';
    
    navigateTo(initialPage, false, true);
}

function navigateTo(pageId, isBackNavigation = false, isInitialLoad = false) {
    const currentPage = document.querySelector('.page.active');
    const newPage = document.getElementById(pageId);
    
    if (!newPage || currentPage?.id === pageId) return;

    // Анимация перехода
    if (currentPage) {
        gsap.to(currentPage, {
            opacity: 0,
            x: -20,
            duration: 0.3,
            ease: "power2.inOut",
            onComplete: () => {
                currentPage.classList.remove('active');
                showPage(newPage, isBackNavigation);
            }
        });
    } else {
        showPage(newPage, isBackNavigation);
    }

    // Обновление истории
    updateHistory(pageId, isBackNavigation, isInitialLoad);
    
    // Обновление кнопки "Назад" в Telegram
    updateTelegramBackButton(pageId);
}

function showPage(page, isBackNavigation) {
    page.classList.add('active');
    gsap.fromTo(page, 
        { 
            opacity: 0, 
            x: isBackNavigation ? -20 : 20 
        },
        { 
            opacity: 1, 
            x: 0, 
            duration: 0.3, 
            ease: "power2.inOut" 
        }
    );
}

function updateHistory(pageId, isBackNavigation, isInitialLoad) {
    const state = {
        pageId: pageId,
        prevPage: document.querySelector('.page.active')?.id || null
    };

    if (isInitialLoad) {
        window.history.replaceState(state, '', `#${pageId}`);
    } else if (isBackNavigation) {
        window.history.replaceState(state, '', `#${pageId}`);
    } else {
        window.history.pushState(state, '', `#${pageId}`);
    }
}

function updateTelegramBackButton(pageId) {
    if (window.Telegram?.WebApp) {
        pageId === 'home-page'
            ? window.Telegram.WebApp.BackButton.hide()
            : window.Telegram.WebApp.BackButton.show();
    }
}

// Обработка навигации по истории
window.addEventListener('popstate', (event) => {
    if (event.state?.pageId) {
        navigateTo(event.state.pageId, true);
        
        // Обновление активной кнопки навигации
        const pageName = event.state.pageId.replace('-page', '');
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === pageName);
        });
    }
});
