export class MyError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
