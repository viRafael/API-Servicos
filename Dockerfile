
FROM node:24.8.0 as build
WORKDIR /app

COPY package*.json ./

RUN npm install
COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:24.8.0-alpine as production
WORKDIR /app

COPY package*.json ./
COPY --from=build /app/prisma ./prisma/

RUN npm install --prod

RUN npx prisma generate

COPY --from=build /app/dist ./dist/

CMD ["npm", "run", "start:prod"]