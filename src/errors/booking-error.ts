import httpStatus from 'http-status';
import { ApplicationBookingError } from '@/protocols';

export function roomNotFoundError(): ApplicationBookingError {
  return {
    name: 'BookingError',
    message: 'No result for this seach',
    status: httpStatus.NOT_FOUND,
  };
}

export function roomIsFullError(): ApplicationBookingError {
  return {
    name: 'BookingError',
    message: 'Room is full',
    status: httpStatus.FORBIDDEN,
  };
}

export function userHasntBookingError(): ApplicationBookingError {
  return {
    name: 'BookingError',
    message: "User hasn't booking to update",
    status: httpStatus.FORBIDDEN,
  };
}

export function userNotFoundBookingError(): ApplicationBookingError {
  return {
    name: 'BookingError',
    message: 'Not found user for this booking',
    status: httpStatus.FORBIDDEN,
  };
}
export function bookingRulesErros(): ApplicationBookingError {
  return {
    name: 'BookingError',
    message: 'It is necessary to have a face-to-face ticket and paid accommodation',
    status: httpStatus.FORBIDDEN,
  };
}
