FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json ./
# Hosted mode calls Azure; it does not install the native local-model SDK.
COPY index.html style.css server.mjs ./
COPY src ./src
ENV HOST=0.0.0.0 PORT=4180
EXPOSE 4180
USER node
CMD ["node", "server.mjs"]
