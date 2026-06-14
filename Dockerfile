FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
COPY src ./src
RUN npm install --omit=dev
RUN npx prisma generate
COPY --from=build /app/.next ./.next
COPY public ./public
EXPOSE 3000
CMD ["npm", "start"]