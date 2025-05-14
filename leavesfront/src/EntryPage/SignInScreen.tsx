import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { firebase } from "../firebase"; // compat 기반 firebase import

const uiConfig = {
  signInFlow: "popup",
  signInSuccessUrl: "/main",
  signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID, firebase.auth.EmailAuthProvider.PROVIDER_ID],
};

function SignInScreen() {
  return (
    <div>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
    </div>
  );
}

export default SignInScreen;
