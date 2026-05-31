FROM node:20-alpine

WORKDIR /app

# package.json varsa bağımlılıkları yükle
COPY package*.json ./
RUN [ -f package.json ] && npm install || true

EXPOSE 3000

CMD ["sh", "-c", "[ -f package.json ] && npm run dev || tail -f /dev/null"]
