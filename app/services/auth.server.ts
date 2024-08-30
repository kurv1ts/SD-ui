import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "../services/session.server";
import { IUser } from "../model/user";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<IUser>(sessionStorage);

// Tell the Authenticator to use the form strategy
authenticator.use(
    new FormStrategy(async ({ form }) => {
        let email = form.get("email");
        let password = form.get("password");
        let user = { id: "1", email: "asd@hot.ee", name: "John Doe", password } as IUser;
        if (email !== user.email || password !== user.password) {
            throw new Error("Invalid email or password");
        }
        // the type of this user must match the type you pass to the Authenticator
        // the strategy will automatically inherit the type if you instantiate
        // directly inside the `use` method
        return user;
    }),
    // each strategy has a name and can be changed to use another one
    // same strategy multiple times, especially useful for the OAuth2 strategy.
    "user-pass"
);