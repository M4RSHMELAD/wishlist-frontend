// Возвращает полный URL изображения через прокси бэкенда.
export function resolveUrl(url) {
  if (!url) return '';
  
  // Если это URL из Yandex Object Storage, проксируем через бэкенд
  if (url.startsWith('https://storage.yandexcloud.net/')) {
    const path = url.replace('https://storage.yandexcloud.net/', '');
    // Добавляем timestamp чтобы обойти кэш браузера
    return `http://localhost:8081/api/v1/proxy/image?path=${encodeURIComponent(path)}&t=${Date.now()}`;
  }
  
  // Если уже абсолютный URL (другой домен)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Относительный путь
  return `http://localhost:8081${url}`;
}
