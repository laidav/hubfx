import { EmergencyContact } from './EmergencyContact';

export interface Contact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emergencyContacts: EmergencyContact[];
  doctorInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
}
