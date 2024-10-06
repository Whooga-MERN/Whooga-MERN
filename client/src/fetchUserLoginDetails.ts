// Retrieves the sign in details from local storage
// contains json of : {"loginId":"johndoe@gmail.com","authFlowType":"USER_SRP_AUTH"}

async function fetchUserLoginDetails(): Promise<any> {
    try {
        // Construct the key for the access token based on the known pattern
        const keyPrefix = 'CognitoIdentityServiceProvider.';
        const keys = Object.keys(localStorage);
        const user = keys.find(key => key.startsWith(keyPrefix) && key.endsWith('.signInDetails'));

        if (user) {
            const token = localStorage.getItem(user);
            if(token) {
                const parsedToken = JSON.parse(token);
                return parsedToken;
            }
            return null; // Return the access token directly from local storage
        } else {
            console.log('User Sign in details not found in local storage');
            return null;
        }
    } catch (error) {
        console.log('Error retrieving sign in details:', error);
        return null;
    }
}

export default fetchUserLoginDetails;