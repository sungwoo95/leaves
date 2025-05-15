module.exports = {
  apps: [
    {
      name: "namunibs_api", // PM2에서 관리할 프로세스 이름
      script: "dist/app.js", // 실행할 Node.js 엔트리 파일
    },
  ],
};
