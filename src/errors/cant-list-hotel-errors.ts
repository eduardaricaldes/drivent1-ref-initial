import { ApplicationError } from '@/protocols';

export function cantListHotelErrors(): ApplicationError {
  return {
    name: 'CantListHotelErrors',
    message: "Can't list hotels",
  };
}
