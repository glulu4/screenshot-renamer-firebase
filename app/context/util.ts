import {Timestamp} from 'firebase/firestore';
import {User} from "app/types/types";

export function createTestUser(uid: string, firstName: string, lastName: string, email: string): User {
        return {
            uid,
            firstName,
            lastName,
            email,
            phoneNumber:"123-456-7890",
            dateOfBirth: new Date(),
            createdAt: Timestamp.now(),
        };
    }