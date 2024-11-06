/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import OpenAI from "openai";
import "dotenv/config";

import {onCall} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import {User} from "../../app/types/types";
import {createTimestampFromObject, TimeStampJSONObj} from "./util";
import {Timestamp} from "firebase-admin/firestore";
import db from "./converter";
import * as functions from "firebase-functions";
// Start writing functions
// https://firebase.google.com/docs/functions/typescript


export const addNewUser = onCall(async (request) => {
  const user: User = request.data;

  user.createdAt = createTimestampFromObject(
    user.createdAt as unknown as TimeStampJSONObj
  );
  try {
    user.createdAt = Timestamp.now();
    await db.users.doc(user.uid).set(user);
    const addedUserDoc = await db.users.doc(user.uid).get();
    if (!addedUserDoc.exists) {
      return {
        message: "User document not found after creation.",
        success: false,
        user: null,
      };
    }
    return {
      message: "added and returned user",
      success: true,
      user: addedUserDoc.data(),
    };
  } catch (error) {
    logger.info("error in addNewUser: ", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to add user",
      error
    );
  }
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateCoverLetter = onRequest({cors: true}, async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  const file = req.body.file;
  const jobDesc = req.body.jobDesc;
  logger.info("file: ", file);

  logger.info("jobDesc: ", jobDesc);

  const userPrompt = `Make a cover letter based on this
  job description. ${jobDesc}. If provided, don't make the
  conver letter from scratch, use this and modify it for the role: ${file}`
  const systemPrompt = `Do not user markdown formatting, 
    * or #. Add newlines and bold`;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
        {
          role: "system",
          content: systemPrompt,
        },
      ],
      stream: true,
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content || "";
      res.write(`${content}`);
    }

    res.end();
  } catch (error) {
    console.error("Error generating cover letter:", error);
    res.status(500).json({error: "Failed to generate recipe"});
  }
});


export const getUser = onCall(async (request) => {
  const uid: string = request.data;
  try {
    const userDoc = await db.users.doc(uid).get();
    if (!userDoc.exists) {
      return {
        message: `No user exist with id ${uid}`,
        success: false,
        data: {} as User,
      };
    } else {
      return {
        message: "Successfully retrieved user",
        success: true,
        data: userDoc.data(),
      };
    }
  } catch (error) {
    logger.info("error in getUser: ", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to get user",
      error,
    );
  }
});

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";
// import OpenAI from "openai";
// import "dotenv/config";
// // import * as Busboy from "busboy";
// const busboy = require('busboy');
// import { Request as FirebaseRequest } from "firebase-functions/v2/https"; // Import Firebase's Request type



// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
// type OperateResult = {
//   jobDesc: string;
//   fileData: Buffer | null;
// };

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });


// export const generateCoverLetter = onRequest({cors: true}, async (req, res) => {
//   const { jobDesc, fileData } = await operate(req); // Process file and prompt data
//   const systemPrompt = `Generate a cover letter using the job description
//   and the previous cover letter, if provided.
//   Do not user markdown formatting, 
//     * or #. Add newlines and bold`;
//   const previousCoverLetter = fileData ? fileData.toString("utf-8") : "";

//   const userPrompt = `${jobDesc}\n\nPrevious Cover Letter:\n${previousCoverLetter}`;

//   logger.info("previousCoverLetter: ", previousCoverLetter);
//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         {
//           role: "user",
//           content: userPrompt,
//         },
//         {
//           role: "system",
//           content: systemPrompt,
//         },
//       ],
//       stream: true,
//     });

//     res.setHeader("Content-Type", "text/event-stream");
//     res.setHeader("Cache-Control", "no-cache");
//     res.setHeader("Connection", "keep-alive");

//     for await (const chunk of response) {
//       const content = chunk.choices[0]?.delta?.content || "";
//       res.write(`${content}`);
//     }

//     res.end();
//   } catch (error) {
//     console.error("Error generating cover letter:", error);
//     res.status(500).json({error: "Failed to generate recipe"});
//   }
// });


// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// const operate = (req: FirebaseRequest): Promise<OperateResult> => {
//   return new Promise((resolve, reject) => {
//     const bb = new busboy({ headers: req.headers });
//     let jobDesc = "";
//     let fileData: Buffer | null = null;

//     // Handle fields
//     bb.on("field", (fieldname: string, val: string) => {
//       if (fieldname === "jobDesc") {
//         jobDesc = val;
//       }
//     });

//     // Handle files
//     bb.on("file", (fieldname: string, file: NodeJS.ReadableStream) => {
//       const chunks: Buffer[] = [];
//       file.on("data", (data: Buffer) => chunks.push(data));
//       file.on("end", () => {
//         fileData = Buffer.concat(chunks);
//       });
//     });

//     // Resolve on finish
//     bb.on("finish", () => {
//       resolve({ jobDesc, fileData });
//     });

//     // Reject on error
//     bb.on("error", (error: Error) => {
//       reject(error);
//     });

//     // Pipe request to busboy
//     (req as any).pipe(bb);
//   });
// };