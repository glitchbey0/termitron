FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV PATH="/opt/nodejs-26.11.1/bin:${PATH}"

RUN apt-get update && apt-get install -y \
    curl \
    wget \
    nano \
    ca-certificates \
    openssh-client \
    zip \
    unzip \
    procps \
    xz-utils \
    git \
    ncurses-term \
    libcurl4-openssl-dev \
    libatomic1 \
    apt-transport-https \
    gpg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /tmp

RUN wget https://nodejs.org/dist/v26.11.1/node-v26.11.1-linux-x64.tar.xz && \
    tar -xJf node-v26.11.1-linux-x64.tar.xz

RUN mkdir -p /opt/nodejs-26.11.1 && \
    cp -a /tmp/node-v26.11.1-linux-x64/. /opt/nodejs-26.11.1/ && \
    rm -rf /tmp/node-v26.11.1-linux-x64*

RUN ln -sf /opt/nodejs-26.11.1/bin/node /usr/local/bin/node && \
    ln -sf /opt/nodejs-26.11.1/bin/npm /usr/local/bin/npm && \
    ln -sf /opt/nodejs-26.11.1/bin/npx /usr/local/bin/npx

RUN /opt/nodejs-26.11.1/bin/npm install -g --allow-scripts=yarn yarn pnpm

ENV NODE_OPTIONS="--dns-result-order=ipv4first --tls-min-v1.2"
ENV TERM_BIND="0.0.0.0:8080"

WORKDIR /app

RUN git clone https://github.com/glitchbey0/termitron .

RUN npm install

EXPOSE 8080

CMD ["node", "server.js"]