FROM node:22-alpine AS build
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev git > /dev/null 2>&1

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY . .
RUN npm run build

FROM node:22-alpine
RUN apk add --no-cache vips-dev

ENV NODE_ENV=production
WORKDIR /opt/app

RUN addgroup -S strapi && adduser -S strapi -G strapi

COPY --from=build --chown=strapi:strapi /opt/node_modules /opt/node_modules
COPY --from=build --chown=strapi:strapi /opt/app ./
ENV PATH=/opt/node_modules/.bin:$PATH

USER strapi
EXPOSE 1338
CMD ["npm", "run", "start"]
