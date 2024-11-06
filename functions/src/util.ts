import {Timestamp} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
export type TimeStampJSONObj = {_seconds: number, _nanoseconds: number}
/**
 *
 * @param {Object} createdAt -
 * JSON object with `_seconds` and `_nanoseconds` properties.
 * @return {Timestamp} A newly formed `Timestamp`.
 * @throws {Error} If `seconds` or `nanoseconds` values are invalid.
 */
export function createTimestampFromObject(
  createdAt: TimeStampJSONObj
): Timestamp {
  try {
    let seconds = createdAt._seconds;
    let nanoseconds = createdAt._nanoseconds;

    if (nanoseconds < 0 || nanoseconds > 999999999) {
      // If nanoseconds out of bounds, adjust by rolling excess into seconds
      seconds += Math.floor(nanoseconds / 1000000000);
      // Keep nanoseconds within [0, 999999999]
      nanoseconds = nanoseconds % 1000000000;
      logger.info("Adjusted nanoseconds overflow by converting to seconds", {
        adjustedSeconds: seconds,
        adjustedNanoseconds: nanoseconds,
      });
    }
    return new Timestamp(seconds, nanoseconds);
  } catch (error) {
    logger.info("Failed the first attempt to make a Timestamp, trying agaoin");
    logger.info("Error: ", error);

    try {
      const [seconds, nanoseconds] = Object.values(createdAt);
      if (typeof seconds === "number" && typeof nanoseconds === "number") {
        return new Timestamp(seconds, nanoseconds);
      } else {
        throw new Error("Invalid seconds or nanoseconds values");
      }
    } catch (error) {
      logger.error("Failed both attempts to make a Timestamp");
      throw new Error(`Error: , ${error}`);
    }
  }
}
