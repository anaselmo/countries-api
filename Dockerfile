FROM node:latest

# Instalar las extensiones de Visual Studio Code
RUN apt-get update && apt-get install -y \
  curl \
  git \
  openssh-client \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN npm install

# Change the ownership of the /root/.npm directory to the node user
RUN chown -R node:node /root/.npm

CMD ["npm", "run", "dev"]