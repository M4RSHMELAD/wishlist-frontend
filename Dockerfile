# Multi-stage build для React приложения
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Очищаем кэш npm и устанавливаем зависимости
RUN npm cache clean --force && \
    npm ci --silent || npm install --silent

# Устанавливаем react-scripts глобально
RUN npm install -g react-scripts

# Копируем исходный код
COPY . .

# Даем права на выполнение
RUN chmod +x node_modules/.bin/*

# Собираем production build
RUN npm run build

# Второй этап - nginx для раздачи статики
FROM nginx:alpine

# Копируем собранное приложение в nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Копируем стандартную конфигурацию nginx (создайте этот файл)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
