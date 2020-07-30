FROM node:10
RUN apt-get update && apt-get install -y python curl build-essential
WORKDIR /usr/src/app
COPY ./ ./
RUN npm install
RUN npm run-script build
EXPOSE 8000
CMD npm run-script start