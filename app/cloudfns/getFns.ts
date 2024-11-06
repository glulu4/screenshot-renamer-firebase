import {User} from "app/types/types";
import {functions, httpsCallable} from "../../firebaseConfig";
import {HttpsCallableResult} from "firebase/functions";

type GetFireStoreResponse<T> = {
    message: string;
    success: boolean;
    data: T;
};

const fetchFirestoreData = async <T, P>(
    params: P,
    functionName: string
): Promise<T> => {
    const callableFunction = httpsCallable<P, GetFireStoreResponse<T>>(functions, functionName);
    try {
        const response: HttpsCallableResult<GetFireStoreResponse<T>> = await callableFunction(params);
        const {message, success, data} = response.data;
        if (!success || !data) throw new Error(`Error in ${functionName}: ${message}`);
        return data;
    } catch (error: unknown) {
        console.log("Error: ", error)
        return [] as unknown as T; // Return an empty array or object based on the expected return type
    }
};


export const getUser = async (uid: string): Promise<User> => {
    return fetchFirestoreData<User, string>(uid, 'get-getUser');
};