# Используем официальный образ Node.js (LTS версия)
FROM node:16-alpine

# Создаем рабочую директорию в контейнере
WORKDIR /app

# Копируем файлы package.json и package-lock.json в рабочую директорию
COPY package*.json ./

# Устанавливаем все зависимости
RUN npm ci

# Копируем все файлы вашего приложения в рабочую директорию
COPY . .
ENV PORT=3000
# Открываем порт 3000
EXPOSE $PORT

# Запускаем приложение
CMD ["npm", "start"]
