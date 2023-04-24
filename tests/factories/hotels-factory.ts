import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotel() {
  return await prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.imageUrl(),
    },
  });
}

export async function createRoomWithHotelId(hotelId: number) {
  return prisma.room.create({
    data: {
      name: '2000',
      capacity: 3,
      hotelId: hotelId,
    },
  });
}

export async function createRoomWithHotelIdWithZeroCapacity(hotelId: number) {
  return prisma.room.create({
    data: {
      name: '2000',
      capacity: 0,
      hotelId: hotelId,
    },
  });
}
