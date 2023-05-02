import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getBookingByUser, booking, updateBooking } from '@/controllers';

const bookingRouter = Router();

bookingRouter
  .all('/*', authenticateToken)
  .get('/', getBookingByUser)
  .post('/', booking)
  .put('/:bookingId', updateBooking);

export { bookingRouter };
