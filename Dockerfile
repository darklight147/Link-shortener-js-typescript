FROM node:12-alpine as client

# Working directory be app
WORKDIR /usr/app/client/

COPY client/package.json .
COPY client/yarn.lock .

# Install dependencies
RUN yarn install --frozen-lockfile --production

# copy local files to app folder
COPY client/ ./

RUN GENERATE_SOURCEMAP=false yarn build
FROM node:12-alpine

# Uncomment if use of `process.dlopen` is necessary
# apk add --no-cache libc6-compat

ENV PORT 4000
EXPOSE 4000 

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

WORKDIR /usr/src/app
COPY --from=client /usr/app/client/build/ ./client/build/
COPY package.json .
COPY yarn.lock .
RUN yarn install --frozen-lockfile
COPY . .

COPY ./client ./dist/client/


CMD [ "yarn", "start" ]