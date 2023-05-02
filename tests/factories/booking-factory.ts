import { createHotel, createRoomWithHotelId } from './';
import { prisma } from '@/config';

export async function createBooking(userId: number) {
  const hotel = await createHotel();
  const room = await createRoomWithHotelId(hotel.id);
  const booking = await prisma.booking.create({
    data: {
      userId,
      roomId: room.id,
    },
  });

  return {
    room,
    booking,
  };
}
