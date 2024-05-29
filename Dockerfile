FROM node:16
WORKDIR /app
RUN  rm -rf node_modules/
COPY --chown=node:node ./package.json /app
RUN npm install --save
COPY --chown=node:node . /app
RUN chmod 777 mirror.sh
#RUN chmod 777 ./alias-add.sh
USER node
CMD ./mirror.sh