import { getAuth } from "firebase-admin/auth";
import { initializeApp, applicationDefault } from "firebase-admin/app";

import { AuthError } from "../../errors/auth.error";
import { UserRepository } from "../../db";
import { User } from "../../units";

interface AuthManagerParams {
  userRepository: UserRepository;
}

export class AuthManager {
  public constructor(private params: AuthManagerParams) { }

  public init() {
    initializeApp({
      credential: applicationDefault(),
    });
  }

  public async authUser(token: string): Promise<User> {
    try {
      const { uid, email } = await getAuth().verifyIdToken(token);

      if (!email) {
        throw new AuthError();
      }

      const user = await this.params.userRepository.getUserByAuthBody({ uid, email });

      if (!user) {
        const res = this.params.userRepository.createUser({ uid, email });

        return res;
      }

      return user;
    } catch (err) {
      throw new AuthError();
    }
  }
}
