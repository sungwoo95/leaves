# Node 22.13.0 이미지 사용 
FROM node:22.13.0

# 컨테이너 내부 작업 디렉토리 지정
WORKDIR /app

# 소스 코드 복사 
COPY . .

# pm2 및 의존성 설치
RUN npm install -g pm2
RUN npm install

#빌드
RUN npm run build

# 앱 포트 노출
EXPOSE 3000

# pm2를 통해 앱 실행
CMD ["pm2-runtime", "start", "ecosystem.config.js"]

