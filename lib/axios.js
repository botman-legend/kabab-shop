// lib/axios.js
import axios from 'axios';

const instance = axios.create({
  headers: {
    'User-Agent': 'YourCustomUserAgent/1.0',
  },
});

export default instance;
