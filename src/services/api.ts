import axios from 'axios';
import { API_URL } from '@env';

export const api = axios.create({
  baseURL: API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});
