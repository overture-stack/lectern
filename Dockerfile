FROM node:16-alpine
ARG COMMIT=""

ENV APP_USER=lectern
ENV APP_UID=9999
ENV APP_GID=9999
RUN addgroup -S -g $APP_GID $APP_USER \
	&& adduser -S -u $APP_UID -g $APP_GID $APP_USER \
	&& mkdir -p /usr/src/app \
	&& chown -R $APP_USER /usr/src/app
USER $APP_UID

WORKDIR /usr/src/app

COPY . ./
RUN npm ci
RUN npm run build

EXPOSE 3000

ENV COMMIT_SHA=${COMMIT}

CMD ["npm", "start"]
