const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
  project_id: "lighthousehotel",
  private_key_id: "8109ad051d213a493354017b55ca948bc4a4cc54",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDlY+/cWsqjUSrF\nVntK5cMOYl5c6OeTqE3TC38janQJxwaX3AedT/i5K2r3FY6/kSctNxHGk7FNjQ6m\nQJ3ITqzo2Jl/w5PJhKfYHB495TZnSvu49Gq6BTRtz4sBM217CVac5zH5FP5ihTtG\nLwj+FuyDb/5yozmdEviqOZTKgwmeghkN6jk7lC/y3TTvclXCfyQshjwNxkmlEUPY\nhQi61Vk0a1FeltmZK9qIxMp8oxFbCx5rZAAWp1GIUQzW/UuDTQPXd7L8XExXyF9e\nDf7lLESl6LOOR7MdWJYUHnFq/xAdsQYdbdO2EKzYLa7jkIaLeDZuucPk/oGWxV7V\n/ZevWcalAgMBAAECggEABeaMZl9FGruQXX0imypn2kUR5x/sMD8oqVOzx7k9Fn2y\nuYTkz6Ydk5D+i/zw+ODtLUH4yHvgfrDKZK2a1J4GRc/a7ikD8mLhxZklKgBtMtQz\njDsCF82uEiw/7h4tipGsU0lOXsYS331/3DrpGoG3QCl8VeSSK2xjTk9AeMKzV6Sc\nM80i3RKp9WtJqWMPF22fKGFpGaJHJQJCtUrFxDqrWZdj/4z/JwvMn9di0dOWpFvA\n5rb0aKkCd1wgW6guvkQ3DG7Ow/e4Awn3w1vLTgCFmes9J4NWFAU6rRYPwrho4cGC\nTO+KDXYN/Oy6kQo2UhRlowvzf2YanH+B5qbqQH2t7QKBgQDtotlMhSjv/QAWp7QK\nYuYzVt7M5SyqlAY2+9BaSZJitOpypjkZrTtTk2MNuSyxhaolGllHe7O/pOZVr3vX\nnSeaUam+RdJFd0yno+fzNBz7zKB6NUU+7CweJ3Ua1bftMfz5sSiDCLiykxKndlrl\ncxMZK3mD7INYO9zwU5Ze896CDwKBgQD3HfZuVggFmr4gk76WEty7UehybpQ38VWv\naq314CRSRWG16PYL1+6iKkG3eh1I6UXQF6Gto5L4RlZhDdnVUqOOqNgw+TjJYaAS\nZZIodDEG0LYYrOlt4aUuCzl5NY1LOox3UsC3NfAKGLcfsrPMPS/qmL+DpUNtuH6O\nrcVjKQLQCwKBgF98llBXGXIFeWmhDYk24EU03OX8GIyaWjzxxnDhKz8abzKOdFdK\n8pHMoXq8M6dJjGrIQaOloz6Ypi08DElBTs6Fje105N8g5t5d0DA7eoH7YWh5y09T\nWw7qz/Vudy+KbJpwg1TTxlOLIW3E8xVLvhrZC0TlXomv1EGFdODGoVwlAoGBAJ+T\n4Lw1oC6GU/rTjcJ54cKxTQsAb4SEuxFxMW9S1AGwvj1rd+AEDBz6br+eAuU/ho6v\ng/+OXu0m9sbr29yO5gHM9PcDKXGaMnVO1Ah9p98/zie3GXKUwUcvhmjIdTq8T1MK\nxFpLYXwTo8W7b7IXXScAhsPrZ9SlzEw02P+Ez0UrAoGADgWge6h1l2hZwWaZcSzY\nHAKmJNRGFJS2OptRMtaBMHPF749CNUy6NMXObTzMh51YxvTAAu8blMUilCjaleEe\nKveGrHMjznXRPx/i28bujTMlVuD4EpPvoCteG3xNSUEdSGd1cAIgmL9+yKGd37jG\ntBVMErz7fYrJ3Xap2gRRTsw=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-vywmp@lighthousehotel.iam.gserviceaccount.com",
  client_id: "109651082343614593561",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-vywmp%40lighthousehotel.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
  }),
});

module.exports = admin; 