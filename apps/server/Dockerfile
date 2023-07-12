FROM node:18.16.1-bookworm-slim

ARG COMMIT=""

# create our own user to run node, don't run node in production as root
ENV APP_USER=lectern
ENV APP_UID=999
ENV APP_GID=999
RUN addgroup --system -gid ${APP_GID} ${APP_USER} \
	&& adduser --system -uid ${APP_UID} --gid ${APP_GID} ${APP_USER} \
	&& mkdir -p /usr/src/app 


WORKDIR /usr/src/app
COPY . ./

RUN chown -R $APP_UID /usr/src/app

# install pnpm as root user, before updating node ownership
RUN npm i -g pnpm

# give our user ownership over node source directories
RUN chown -R $APP_UID:${APP_GID} $(npm config get prefix)

USER ${APP_UID}:${APP_GID}

RUN pnpm install --ignore-scripts
RUN pnpm nx build server

EXPOSE 3000

ENV COMMIT_SHA=${COMMIT}
ENV NODE_ENV=production

CMD [ "pnpm", "-C", "apps/server", "--silent", "start"]