import { TicketStatus } from '@prisma/client';
import { BookingResponse, BookingDoneResponse } from './../../protocols';
import ticketRepository from '@/repositories/tickets-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import bookingRepository from '@/repositories/booking-repository';
import roomRepository from '@/repositories/room-repository';
import userRepository from '@/repositories/user-repository';
import {
  roomNotFoundError,
  roomIsFullError,
  userHasntBookingError,
  userNotFoundBookingError,
  bookingRulesErros,
  notFoundError,
} from '@/errors';

async function getBooking(userId: number): Promise<BookingResponse> {
  const result = await bookingRepository.getBooking(userId);

  if (!result) {
    throw notFoundError();
  }
  const BookingResponse = {
    id: result.id,
    Room: result.Room,
  };
  return BookingResponse;
}

async function createBooking(userId: number, roomId: number): Promise<BookingDoneResponse> {
  const room = await roomRepository.findRoomById(roomId);
  if (!room) {
    throw roomNotFoundError();
  }

  if (room.capacity === 0) {
    throw roomIsFullError();
  }

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (ticket.TicketType.isRemote || ticket.status !== TicketStatus.PAID) {
    throw bookingRulesErros();
  }
  const booking = await bookingRepository.create(userId, roomId);
  const responseBookingDone = {
    bookingId: booking.id,
  };
  return responseBookingDone;
}

async function updateBooking(userId: number, roomId: number, bookingId: number): Promise<BookingDoneResponse> {
  const room = await roomRepository.findRoomById(roomId);
  if (!room) {
    throw roomNotFoundError();
  }
  if (room.capacity === 0) {
    throw roomIsFullError();
  }
  const user = await userRepository.getUserById(userId);
  if (user.Booking.length === 0) {
    throw userHasntBookingError();
  }
  const booking = await bookingRepository.getBookingByIdAndUserId(bookingId, userId);
  if (!booking) {
    throw userNotFoundBookingError();
  }
  await bookingRepository.update(roomId, booking.id);
  return {
    bookingId: booking.id,
  };
}
const bookingService = {
  getBooking,
  createBooking,
  updateBooking,
};

export default bookingService;
