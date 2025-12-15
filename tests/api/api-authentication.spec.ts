import { test, expect } from '@playwright/test';

test.describe('API Authentication Tests', () => {
  const baseURL = 'https://restful-booker.herokuapp.com';

  test('should authenticate and receive token', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth`, {
      data: {
        username: 'admin',
        password: 'password123'
      }
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('token');
    expect(body.token).toBeTruthy();
  });

  test('should fail with invalid credentials', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth`, {
      data: {
        username: 'invalid',
        password: 'wrong'
      }
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.reason).toBe('Bad credentials');
  });

  test('should get booking list', async ({ request }) => {
    const response = await request.get(`${baseURL}/booking`);
    
    expect(response.status()).toBe(200);
    const bookings = await response.json();
    expect(Array.isArray(bookings)).toBeTruthy();
    expect(bookings.length).toBeGreaterThan(0);
  });

  test('should create new booking', async ({ request }) => {
    const response = await request.post(`${baseURL}/booking`, {
      data: {
        firstname: 'Test',
        lastname: 'User',
        totalprice: 100,
        depositpaid: true,
        bookingdates: {
          checkin: '2025-01-01',
          checkout: '2025-01-02'
        }
      }
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('bookingid');
  });
});