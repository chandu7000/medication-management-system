import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authAPI, medicationAPI } from '../services/api';

// Mock fetch
global.fetch = vi.fn();

describe('API Services', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  describe('authAPI', () => {
    it('should make login request with correct data', async () => {
      const mockResponse = {
        data: { token: 'test-token', user: { id: 1, name: 'Test User' } }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await authAPI.login('test@example.com', 'password');

      expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
      });

      expect(result.data).toEqual(mockResponse);
    });

    it('should include authorization header when token exists', async () => {
      localStorage.setItem('token', 'test-token');

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await medicationAPI.getAll();

      expect(fetch).toHaveBeenCalledWith('/api/medications', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
      });
    });
  });

  describe('medicationAPI', () => {
    it('should create medication with correct data', async () => {
      const medicationData = {
        name: 'Ibuprofen',
        dosage: '200mg',
        frequency: 'twice_daily'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: 1, ...medicationData } }),
      });

      const result = await medicationAPI.create(medicationData);

      expect(fetch).toHaveBeenCalledWith('/api/medications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(medicationData),
      });

      expect(result.data.data.name).toBe('Ibuprofen');
    });
  });
});