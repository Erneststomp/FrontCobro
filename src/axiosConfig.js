// axiosConfig.js
import axios from 'axios';

axios.defaults.baseURL = 'https://189.203.131.125/cobro/BackSistemaDeCobro/';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;

export default axios;
 