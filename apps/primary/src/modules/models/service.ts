import { modelsDB } from "@repo/db-config";
import type { modelSchema } from "./model.js";
import { MyError } from "../../types/error.type.js";

export abstract class Models {
  static async getAllModels() {
    try {
      return await modelsDB.findMany({
        select: {
          id: true,
          name: true,
        },
      });
    } catch (err) {
      console.error("Database error retrieving models:", err);
      throw new MyError(
        500,
        "Database error occurred while retrieving models.",
      );
    }
  }

  static async addNewModel({ name, companyId }: modelSchema["newModelBody"]) {
    try {
      return await modelsDB.create({
        data: { name, company: { connect: { id: companyId } } },
      });
    } catch (err) {
      console.error("Database error adding new model:", err);
      throw new MyError(500, "Database error occurred while adding new model.");
    }
  }
}
