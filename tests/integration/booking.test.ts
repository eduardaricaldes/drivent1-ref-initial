import * as jwt from 'jsonwebtoken';
import { TicketStatus } from '.prisma/client';
import httpStatus from 'http-status';
import supertest from 'supertest';
import faker from '@faker-js/faker';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createUser,
  createBooking,
  createHotel,
  createRoomWithHotelIdWithZeroCapacity,
  createEnrollmentWithAddress,
  createTicketTypeRemote,
  createTicket,
  createRoomWithHotelId,
  createTicketTypeWithHotel,
  createTicketType,
  createTicketWithNotIncludeHotel,
} from '../factories';
import bookingRepository from '@/repositories/booking-repository';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
  await cleanDb();
});
const server = supertest(app);

describe('GET /booking', () => {
  describe('When token is invalid', () => {
    it('should respond with status 401 if no token is given', async () => {
      const response = await server.get('/enrollments');
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();
      const response = await server.get('/enrollments').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const response = await server.get('/enrollments').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('When token is valid', () => {
    it('should return 200 when exists a booking for the user', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const createdBooking = await createBooking(user.id);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id: createdBooking.booking.id,
        Room: {
          id: createdBooking.room.id,
          name: createdBooking.room.name,
          capacity: createdBooking.room.capacity,
          hotelId: createdBooking.room.hotelId,
          createdAt: createdBooking.room.createdAt.toISOString(),
          updatedAt: createdBooking.room.updatedAt.toISOString(),
        },
      });
    });
    it('should return 404 when user has not booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  });
});

describe('POST /booking', () => {
  it('should return 404 when room not exists', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 0 });
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });
  it('should return 403 when room is full', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const enrolment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType();
    const room = await createRoomWithHotelIdWithZeroCapacity(hotel.id);
    await createTicket(enrolment.id, ticketType.id, TicketStatus.PAID);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });
  it('should return 403 when ticket is remote', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelIdWithZeroCapacity(hotel.id);
    const enrolment = await createEnrollmentWithAddress(user);
    const ticketRemote = await createTicketTypeRemote();

    await createTicket(enrolment.id, ticketRemote.id, TicketStatus.PAID);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it('should return 403 when ticket is not include hotel', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelIdWithZeroCapacity(hotel.id);
    const enrolment = await createEnrollmentWithAddress(user);
    const ticketWithNotIncludeHotel = await createTicketWithNotIncludeHotel();

    await createTicket(enrolment.id, ticketWithNotIncludeHotel.id, TicketStatus.PAID);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it('should return 403 when ticket is different to paid', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const enrolment = await createEnrollmentWithAddress(user);
    const ticketRemote = await createTicketTypeRemote();

    await createTicket(enrolment.id, ticketRemote.id, TicketStatus.RESERVED);
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });
  it('should return 200 on success', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const enrolment = await createEnrollmentWithAddress(user);
    const ticketRemote = await createTicketTypeWithHotel();

    await createTicket(enrolment.id, ticketRemote.id, TicketStatus.PAID);
    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

    const booking = await bookingRepository.getBooking(user.id);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual({
      bookingId: booking.id,
    });
  });
});

describe('PUT /booking/:bookingId', () => {
  it('should return 404 when room not exists', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send({ roomId: 0 });
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });
  it('should return 403 when room is full', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelIdWithZeroCapacity(hotel.id);

    const response = await server.put('/booking/2').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });
  it('should return 403 when user hasnt booking', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);

    const response = await server.put('/booking/2').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });
  it('should return 403 when not found booking for this user', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);

    await createBooking(user.id);

    const response = await server.put('/booking/2').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });
  it('should return 200 on success', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const booking = await createBooking(user.id);
    await createBooking(user.id);
    const response = await server
      .put(`/booking/${booking.booking.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ roomId: room.id });

    const updatedBooking = await bookingRepository.getBookingByIdAndUserId(booking.booking.id, user.id);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual({
      bookingId: booking.booking.id,
    });
    expect(booking.room.id).not.toBe(updatedBooking.roomId);
  });
});
