import { User as FirebaseUser } from "firebase/auth";

export class User {
  private static instance?: User;

  private token?: string;

  private firebaseUser?: FirebaseUser;

  private authenticated = false;

  private constructor() { }

  public static getInstance() {
    if (!User.instance) {
      User.instance = new User();
    }

    return User.instance;
  }

  public getFirebaseUser() {
    return this.firebaseUser;
  }

  public setAuthenticated() {
    this.authenticated = true;
  }

  public isAuthenticated() {
    return this.authenticated;
  }

  public setFirebaseUser(user: FirebaseUser) {
    this.firebaseUser = user;
  }

  public clear() {
    this.firebaseUser = undefined;
    this.token = undefined;
    this.authenticated = false;
  }

  public setToken(token: string) {
    this.token = token;
  }

  public getToken() {
    return this.token;
  }
}
