import { ApplicationError } from '@/protocols';

export function invalidCepAddress(): ApplicationError {
  return {
    name: 'invalidCepAddress',
    message: 'this address is invalid',
  };
}
