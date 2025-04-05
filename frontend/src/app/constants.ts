/** Regular expression that validates passwords */
export const passwordRegExp = new RegExp(
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!#$%&"'()*+,\-./:;<=>?@\[\\\]^_`{|}~])[A-Za-z\d!#$%&"'()*+,\-./:;<=>?@\[\\\]^_`{|}~]{10,}$/
);


/** Backend API URL prefix */
export const backendBaseUrl = 'http://localhost:8080/api/v1';
