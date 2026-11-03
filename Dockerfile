FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install --omit=dev
COPY app.js .
RUN adduser -D appuser
USER appuser
EXPOSE 3000
CMD ["node", "app.js"]
