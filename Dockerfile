FROM node:12.5.0

ARG COMMIT=""

ENV APP_UID=9999
ENV APP_GID=9999
RUN groupmod -g $APP_GID node 
RUN usermod -u $APP_UID -g $APP_GID node
RUN mkdir -p /usr/src/app
RUN chown -R node /usr/src/app
USER node
WORKDIR /usr/src/app

COPY . ./
RUN npm ci
RUN npm run build

EXPOSE 3000

ENV COMMIT_SHA=${COMMIT}

COPY . .
CMD ["npm", "start"]
