# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=https://api.zerde.co/diaxel
ARG VITE_ASSISTANT_ID=7de674c1-6029-4609-92c4-074fab740bad

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_ASSISTANT_ID=$VITE_ASSISTANT_ID

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
