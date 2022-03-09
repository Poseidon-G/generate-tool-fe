# build app
FROM node:14-alpine

WORKDIR /app

ADD package*.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]


# # production environment
# FROM nginx:stable-alpine
# COPY /app/build /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]