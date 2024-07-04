export interface AuthBody {
  uid: string;
  email: string;
}

export class User {
  public constructor(
    private id: string,
    private uid: string,
    private email: string
  ) { }

  public getId() {
    return this.id;
  }

  public getUid() {
    return this.uid;
  }

  public getEmail() {
    return this.email;
  }
}
