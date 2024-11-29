
# 体积更小-alpine3.14

FROM node:18-alpine3.14

WORKDIR /app

# 复制 package.json 文件
COPY package.json .

# 设置 npm 源
RUN npm config set registry https://registry.npmmirror.com/

# 安装依赖
RUN npm install

# 复制项目的其余文件
COPY . .

# 构建项目
RUN npm run build

# 暴露端口
EXPOSE 3001

# 设置启动命令
CMD [ "node", "./dist/main.js" ]

# 打包
# docker build -t nest:first . 