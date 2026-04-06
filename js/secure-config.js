// 密钥配置 - 不要将此文件分享给他人
// 密钥用于加密敏感数据
const SECURE_KEY = 'hz2026huazhiyou';  // 修改为你自己的密钥
const ENCRYPTED_ADMIN = 'CR5fWVw=';  // 加密后的账号
const ENCRYPTED_PASSWORD = 'AA9TSlpfERoUAwcc';  // 加密后的密码

// 简单的异或加密 + Base64（仅用于演示，生产环境应使用更安全的加密方式）
function simpleEncrypt(str, key) {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result);
}

function simpleDecrypt(encoded, key) {
  try {
    let decoded = atob(encoded);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch (e) {
    return '';
  }
}

function getDecryptedCredentials() {
  return {
    username: simpleDecrypt(ENCRYPTED_ADMIN, SECURE_KEY),
    password: simpleDecrypt(ENCRYPTED_PASSWORD, SECURE_KEY)
  };
}
