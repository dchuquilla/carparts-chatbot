export class Session {
  constructor(
    public readonly userId: string,
    public state: string,
    public data: Record<string, any>,
    public readonly createdAt: Date = new Date()
  ) {}

  toJSON(): string {
    return JSON.stringify({
      userId: this.userId,
      state: this.state,
      data: this.data,
      createdAt: this.createdAt.toISOString(),
    });
  }

  static fromJSON(json: string): Session {
    const data = JSON.parse(json);
    return new Session(
      data.userId,
      data.state,
      data.data,
      new Date(data.createdAt)
    );
  }
}
