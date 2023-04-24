import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getHotels, getHotelsRooms } from '@/controllers/hotels-controllers';

const hotelsRouter = Router();

hotelsRouter.all('*/', authenticateToken).get('/', getHotels).get('/:hotelId', getHotelsRooms);

export { hotelsRouter };
