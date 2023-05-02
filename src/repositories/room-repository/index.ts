import { prisma } from '@/config';

async function findRoomById(roomId: number) {
  return prisma.room.findFirst({
    where: {
      id: roomId,
    },
  });
}
const roomRepotory = {
  findRoomById,
};
export default roomRepotory;
