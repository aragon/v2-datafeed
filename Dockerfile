FROM node:12.14.0-alpine
RUN apk add --no-cache git

WORKDIR /v2-data-feed

# Copy root package json file
COPY ./package.json /v2-data-feed/package.json

# Install dependencies
COPY ./yarn.lock /v2-data-feed/yarn.lock
RUN yarn

COPY . .

CMD echo specify one of the package.json scripts in command line
