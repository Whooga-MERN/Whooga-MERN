// Imports the Amplify library from 'aws-amplify' package. This is used to configure your app to interact with AWS services.
import {Amplify} from 'aws-amplify';

// Imports the Authenticator and withAuthenticator components from '@aws-amplify/ui-react'.
// Authenticator is a React component that provides a ready-to-use sign-in and sign-up UI.
// withAuthenticator is a higher-order component that wraps your app component to enforce authentication.
import { Authenticator, withAuthenticator } from '@aws-amplify/ui-react';

// Imports the default styles for the Amplify UI components. This line ensures that the authenticator looks nice out of the box.
import '@aws-amplify/ui-react/styles.css';

// Imports the awsExports configuration file generated by the Amplify CLI. This file contains the AWS service configurations (like Cognito, AppSync, etc.) specific to your project.
import awsExports from '../aws-exports';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

// Configures the Amplify library with the settings from aws-exports.js, which includes all the AWS service configurations for this project.
Amplify.configure(awsExports);

function Auth() {
   const  navigate = useNavigate();
  return (
    <Authenticator>
      {({ signOut, user }) => {
        // Use an effect to handle navigation after login
        useEffect(() => {
          if (user) {
            navigate('/collections'); // Redirect after sign-in
          }
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