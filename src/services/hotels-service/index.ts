import { notFoundError } from '@/errors';
import { cantListHotelErrors } from '@/errors/cant-list-hotel-errors';
import hotelRepository from '@/repositories/hotel-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function ListHotels(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) {
    throw notFoundError();
  }

  if (ticket.status !== 'PAID' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw cantListHotelErrors();
  }
}

async function getHotels(userId: number) {
  await ListHotels(userId);
  const hotels = await hotelRepository.findHotels();
  return hotels;
}

async function getHotelsRooms(userId: number, hotelId: number) {
  await ListHotels(userId);
  const hotel = await hotelRepository.findRoomsByHotelId(hotelId);

  if (!hotel) {
    throw notFoundError();
  }
  return hotel;
}

const hotelsService = {
  getHotels,
  getHotelsRooms,
};

export default hotelsService;
