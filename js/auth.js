(function () {
  const LOGIN_PAGE = 'login.html';
  const MANAGE_PAGE = 'manage.html';

  // 从加密配置获取凭证
  function getCredentials() {
    if (typeof getDecryptedCredentials === 'function') {
      const creds = getDecryptedCredentials();
      return { username: creds.username, password: creds.password };
    }
    // 回退：如果加密模块加载失败
    return { username: 'admin', password: 'huazhiyouyou' };
  }

  const credentials = getCredentials();
  const DEFAULT_USERNAME = credentials.username;
  const DEFAULT_PASSWORD = credentials.password;

  function getCurrentPageName() {
    const segments = window.location.pathname.split('/');
    return (segments[segments.length - 1] || '').toLowerCase();
  }

  function isLoginPage() {
    return getCurrentPageName() === LOGIN_PAGE;
  }

  function isManagePage() {
    return getCurrentPageName() === MANAGE_PAGE;
  }

  function isLoggedIn() {
    return localStorage.getItem('adminLoggedIn') === 'true';
  }

  function applyStoredTheme() {
    const theme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = theme === 'dark' || (theme === 'auto' && prefersDark);

    if (shouldUseDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    syncThemeToggleIcon();
  }

  function redirectTo(url) {
    window.location.href = url;
  }

  function showError(message) {
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    if (!errorMessage || !errorText) {
      return;
    }
    errorText.textContent = message;
    errorMessage.classList.add('show');
  }

  function shakeLoginCard() {
    const container = document.querySelector('.login-container');
    if (!container) {
      return;
    }
    container.style.animation = 'shake 0.5s ease';
    window.setTimeout(function () {
      container.style.animation = '';
    }, 500);
  }

  function handleLoginSubmit(event) {
    event.preventDefault();

    const username = document.getElementById('username');
    const password = document.getElementById('password');
    if (!username || !password) {
      return;
    }

    if (username.value === DEFAULT_USERNAME && password.value === DEFAULT_PASSWORD) {
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('adminUsername', username.value);
      var count = parseInt(localStorage.getItem('admin-login-count') || '0') + 1;
      localStorage.setItem('admin-login-count', String(count));
      redirectTo(MANAGE_PAGE);
      return;
    }

    showError('账号或密码错误');
    shakeLoginCard();
  }

  function initLoginPage() {
    const loginForm = document.getElementById('login-form');
    const themeToggle = document.getElementById('theme-toggle');

    if (loginForm) {
      loginForm.addEventListener('submit', handleLoginSubmit);
    }

    if (themeToggle) {
      themeToggle.addEventListener('click', function () {
        window.toggleTheme();
      });
    }
  }

  function syncThemeToggleIcon() {
    const themeToggleIcon = document.querySelector('#theme-toggle i');
    if (!themeToggleIcon) {
      return;
    }

    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    themeToggleIcon.className = isDarkTheme ? 'fa fa-sun-o' : 'fa fa-moon-o';
  }

  function initManagePage() {
    const logoutLink = document.getElementById('logout-link');
    if (!logoutLink) {
      return;
    }

    logoutLink.addEventListener('click', function (event) {
      event.preventDefault();
      window.logout();
    });
  }

  window.toggleTheme = function toggleTheme() {
    const html = document.documentElement;
    const isDarkTheme = html.getAttribute('data-theme') === 'dark';
    if (isDarkTheme) {
      html.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      html.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }

    syncThemeToggleIcon();
  };

  window.logout = function logout() {
    if (!window.confirm('确定要退出登录吗？')) {
      return;
    }

    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    redirectTo(LOGIN_PAGE);
  };

  applyStoredTheme();

  if (isManagePage() && !isLoggedIn()) {
    redirectTo(LOGIN_PAGE);
    return;
  }

  if (isLoginPage() && isLoggedIn()) {
    redirectTo(MANAGE_PAGE);
    return;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (isLoginPage()) {
      initLoginPage();
    }

    if (isManagePage()) {
      initManagePage();
    }
  });
})();
