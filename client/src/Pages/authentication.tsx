import { Amplify } from 'aws-amplify';
import { Authenticator, withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import fetchJWT from "../fetchJWT";
import awsExports from '../aws-exports';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { buildPath } from "../utils/utils";

Amplify.configure(awsExports);

const fetchData = async (user: any): Promise<boolean | undefined> => {
  if (user != null && user.userId) {
    const JWT = await fetchJWT();
    const response = await fetch(
      buildPath(`user/get-accepted-terms/?userId=${user.userId}`), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JWT}`,
        },
      }
    );

    const data = await response.json();
    return data.length > 0 ? data[0].accepted_terms : undefined;
  }
};

function Auth() {
  const navigate = useNavigate();

  return (
    <Authenticator>
      {({ signOut, user }) => {
        useEffect(() => {
          const handleNavigation = async () => {
            if (user) {
              const acceptedTermsBoolean = await fetchData(user);
              if (acceptedTermsBoolean) {
                navigate('/collections'); // Redirect if terms are accepted
              } else {
                navigate('/optin'); // Redirect if terms are not accepted
              }
            }
          };

          handleNavigation();
        }, [user, navigate]);

        return (
          <div>
            {user ? (
              <p>Redirecting...</p> // While redirecting, show this message
            ) : (
              <p>Sign in below:</p> // This will show before sign-in
            )}
          </div>
        );
      }}
    </Authenticator>
  );
}

export default withAuthenticator(Auth);
