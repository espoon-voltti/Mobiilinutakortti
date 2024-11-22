FROM node:20.16.0

RUN mkdir -p /frontend
WORKDIR /frontend

COPY package.json /frontend

COPY . /frontend
RUN npm ci

CMD ["npm", "start"]
