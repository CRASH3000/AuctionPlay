// Конфигурация API
const getApiUrl = () => {
  // Проверяем, есть ли сохраненный URL
  const savedUrl = window.localStorage.getItem('api_url');
  if (savedUrl) {
    return savedUrl;
  }

  // Получаем текущий hostname из URL
  const hostname = window.location.hostname;
  
  // Для Capacitor приложений (Android/iOS)
  if (window.location.protocol === 'capacitor:') {
    return 'http://192.168.1.8:8000'; // Ваш текущий IP (изменить на ваш, если понадобится)
  }
  
  // Для localhost (разработка на компьютере)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  
  // Для IP адресов (мобильные устройства, доступ по сети)
  if (hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    return `http://${hostname}:8000`;
  }
  
  // Fallback для других случаев
  return 'http://localhost:8000';
};

export const API_URL = getApiUrl();

// Функция для обновления API URL (если нужно переключиться)
export const setApiUrl = (url) => {
  window.localStorage.setItem('api_url', url);
  window.location.reload();
};

// Для отладки
console.log('🔧 API Configuration:', {
  hostname: window.location.hostname,
  protocol: window.location.protocol,
  selectedApiUrl: API_URL
}); 