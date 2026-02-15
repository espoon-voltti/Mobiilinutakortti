FROM node:24.13.1-trixie-slim

ARG CACHE_BUST=none

ENV TZ=Europe/Helsinki

RUN rm -f /etc/localtime && ln -s /usr/share/zoneinfo/$TZ /etc/localtime \
 && apt-get update \
 && apt-get -y dist-upgrade \
 && rm -rf /var/lib/apt/lists/*

ADD ./backend /backend

ADD ./frontend /frontend
WORKDIR /frontend
ENV REACT_APP_ENDPOINT=/api
RUN npm ci && npm run build && cp -r ./build ../backend/public

ADD ./admin-frontend /admin-frontend
WORKDIR /admin-frontend
ENV VITE_ENDPOINT=/api
ENV VITE_ADMIN_FRONTEND_URL=/nuorisotyontekijat
RUN npm ci && npm uninstall rollup && npm install rollup && npm run build && cp -r ./dist ../backend/public-admin

WORKDIR /backend
RUN npm ci && npm run build

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
