import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import supertest from 'supertest';
import { Prisma, Payment, TicketType, TicketStatus, User } from '@prisma/client';

import { cleanDb, generateValidToken } from '../helpers';
import {
  createEnrollmentWithAddress,
  createPayment,
  createTicketTypeRemote,
  createUser,
  createTicket,
  createHotel,
  createTicketType,
} from '../factories';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});
beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET/hotels', () => {
  it("Respond error 401 if token it doesn't given", async () => {
    const response = await server.get('/hotels');
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it('Respond error 401 if token is invalid', async () => {
    const token = 'token invalido';
    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("Respond error 401 if doesn't exist session in token given", async () => {
    const userNotTokenValidSession = await createUser();
    const token = jwt.sign({ userId: userNotTokenValidSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe('when token is valid', () => {
    it('Response status 402 when ticket is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it("response status 404 when user hasn't enrollment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const TicketType = await createTicketTypeRemote();
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('response status 200 and list of hotels', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);

      const createdHotelResp = await createHotel();
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.OK);

      expect(response.body).toEqual([
        {
          id: createdHotelResp.id,
          name: createdHotelResp.name,
          image: createdHotelResp.image,
          createdAt: createdHotelResp.createdAt.toISOString(),
          updatedAt: createdHotelResp.updatedAt.toISOString(),
        },
      ]);
    });

    it('respond status 200 and return an empty array', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual([]);
    });
  });
});

describe('GET/hotels/:hotelId', () => {
  it("respond status 401 if token isn't give", async () => {
    const response = await server.get('/hotels/1');
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('response status 401 token is invalid', async () => {
    const token = 'token invalido';
    const response = await server.get('/hotels/i').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("respond status 401 doesn't exist token for this session", async () => {
    const userNotTokenValidSession = await createUser();
    const token = jwt.sign({ userId: userNotTokenValidSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('respond token is valid', () => {
    it('respond status 402 ticket is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);

      const createdHotelResp = await createHotel();

      const response = await server.get(`/hotels/${createdHotelResp.id}`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
    it('respond status 200 on success ', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);

      const createdHotelResp = await createHotel();
      const response = await server.get(`/hotels/${createdHotelResp.id}`).set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        id: createdHotelResp.id,
        name: createdHotelResp.name,
        image: createdHotelResp.image,
        createdAt: createdHotelResp.createdAt.toISOString(),
        updatedAt: createdHotelResp.updatedAt.toISOString(),
        Rooms: [],
      });
    });
  });
});
