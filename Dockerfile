FROM node:14.17.0

ENV PATH $PATH:node_modules/.bin

RUN npm cache verify
# RUN npm install install babel-cli@6 babel -preset-react-app@3

# RUN apt-get clean && \
#     rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
#     npm cache verify

EXPOSE 19000