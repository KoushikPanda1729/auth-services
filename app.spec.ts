import app from "./src/app";
import { calculateSum } from "./src/utils";
import request from "supertest";
describe("App", () => {
  it("should be calculate the sum", () => {
    const sum = calculateSum(10, 20);
    expect(sum).toBe(30);
  });

  it("should return correct status code", async () => {
    const response = await request(app).get("/").send();
    expect(response.status).toBe(200);
  });
});
