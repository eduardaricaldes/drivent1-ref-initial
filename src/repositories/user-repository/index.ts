import { Prisma } from '@prisma/client';
import { prisma } from '@/config';

async function findByEmail(email: string, select?: Prisma.UserSelect) {
  const params: Prisma.UserFindUniqueArgs = {
    where: {
      email,
    },
  };

  if (select) {
    params.select = select;
  }

  return prisma.user.findUnique(params);
}

async function create(data: Prisma.UserUncheckedCreateInput) {
  return prisma.user.create({
    data,
  });
}
async function getUserById(userId: number) {
  return prisma.user.findFirst({
    where: {
      id: userId,
    },
    include: {
      Booking: true,
    },
  });
}

const userRepository = {
  findByEmail,
  create,
  getUserById,
};

export default userRepository;
