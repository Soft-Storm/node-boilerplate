FROM node:latest
RUN apt-get update && apt-get install -y python curl build-essential
WORKDIR /usr/src/app
COPY ./ ./
RUN npm install
RUN npm run-script lint
RUN npm run-script clean
RUN npm run-script build
EXPOSE 8080
ENTRYPOINT ["npm", "start"]
