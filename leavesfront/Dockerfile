# 1단계: Node 이미지에서 빌드 수행
FROM node:22.13.0 AS builder

WORKDIR /app

# 소스 복사 (node_modules, dist 제외되도록 .dockerignore 필요)
COPY . .

# 의존성 설치 및 빌드
RUN npm install
RUN npm run build

# 2단계: Nginx 이미지에 dist 결과만 복사
FROM nginx

# 커스텀 Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드된 정적 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html
