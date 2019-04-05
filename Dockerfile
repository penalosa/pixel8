FROM node:9.6.1

RUN mkdir /src
WORKDIR /src

ENV PATH /src/node_modules/.bin:$PATH

COPY package.json /src/package.json
COPY package-lock.json /src/package-lock.json
RUN npm install
RUN npm install -g serve
COPY . .
RUN npm run build

CMD ["serve","-l","8000", "build"]
