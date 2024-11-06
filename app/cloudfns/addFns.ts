import { functions, httpsCallable } from "../../firebaseConfig";
import {User} from "../types/types"

type AddFirestoreResponse = {
  message: string;
  success: boolean;
};

interface AddNewUserResponse {
	message: string;
	success: boolean;
	user: User;
}

// Simplified Firestore Operation Handler
const handleFirestoreOperation = async <P>(
  params: P,
  functionName: string
): Promise<boolean> => {
  const callableFunction = httpsCallable<P, AddFirestoreResponse>(functions, functionName);
  try {
    const result = await callableFunction(params);
    const { message, success } = result.data;

    if (!success) throw new Error(`Error in ${functionName}`);

    return true;
  } catch (error) {
    console.log("error: ", error);
    
    return false;
  }
};




export const addNewUser = async(userToAdd:User):Promise<User | null> => {

    try {
        const addUserFunction = httpsCallable<User, AddNewUserResponse>(functions, 'addNewUser');
        const result = await addUserFunction(userToAdd);
        const {message, success, user } = result.data;
        console.log("message: ", message);
        if (!success) throw new Error("Error adding user");
        return user
        
    } catch (error) {
        return null;
        
    }

}