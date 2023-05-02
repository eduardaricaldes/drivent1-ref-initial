import httpStatus from 'http-status';
import { Response } from 'express';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';

export async function getBookingByUser(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const userBooking = await bookingService.getBooking(userId);
    return res.status(httpStatus.OK).send(userBooking);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function booking(req: AuthenticatedRequest, res: Response) {
  const { userId, body } = req;

  try {
    const createdBooking = await bookingService.createBooking(userId, body.roomId);

    return res.status(httpStatus.OK).send(createdBooking);
  } catch (error) {
    return res.sendStatus(error.status);
  }
}
export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const { userId, body, params } = req;

  try {
    const bookingId = parseInt(params.bookingId);
    const createdBooking = await bookingService.updateBooking(userId, body.roomId, bookingId);

    return res.status(httpStatus.OK).send(createdBooking);
  } catch (error) {
    return res.sendStatus(error.status);
  }
}
