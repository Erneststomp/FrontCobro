// axiosConfig.js
import axios from 'axios';

axios.defaults.baseURL = 'https://ernestolopez.art/BackCobroDif/';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;

export default axios;
 