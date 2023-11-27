// axiosConfig.js
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:80/Cobro/BackSistemaDeCobro/';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;

export default axios;
 