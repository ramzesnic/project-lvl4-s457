FROM node:11.5

RUN echo 'deb http://deb.debian.org/debian stretch-backports main' >> /etc/apt/sources.list
RUN apt-get update
RUN apt-get -t stretch-backports install -yq libsqlite3-0
RUN npm install -g npm-check-updates
WORKDIR /code