
FROM node:20-alpine

RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont udev xvfb x11vnc fluxbox dbus  # puppeteer 실행을 위해 필요한 패키지들을 설치

RUN apk add --no-cache --virtual .build-deps curl \
    && echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories \
    && echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
    && echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
    && apk add --no-cache curl wget \
    && apk del .build-deps

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

ENTRYPOINT ["yarn", "start"]