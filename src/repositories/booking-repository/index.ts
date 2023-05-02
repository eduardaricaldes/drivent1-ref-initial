import { prisma } from '@/config';

async function getBooking(userId: number) {
  return prisma.booking.findFirst({
    where: { userId },
    include: {
      Room: true,
    },
  });
}

async function getBookingByIdAndUserId(bookingId: number, userId: number) {
  return prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId,
    },
  });
}

async function create(userId: number, roomId: number) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

async function update(roomId: number, bookingId: number) {
  return await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      roomId,
    },
  });
}
const bookingRepository = {
  getBooking,
  create,
  getBookingByIdAndUserId,
  update,
};

export default bookingRepository;
