// Retrieves JWT from local storage
async function fetchJWT(): Promise<string | null> {
    try {
        // Construct the key for the access token based on the known pattern
        const keyPrefix = 'CognitoIdentityServiceProvider.';
        const keys = Object.keys(localStorage);
        const accessTokenKey = keys.find(key => key.startsWith(keyPrefix) && key.endsWith('.accessToken'));

        if (accessTokenKey) {
            const token = localStorage.getItem(accessTokenKey);
            return token; // Return the access token directly from local storage
        } else {
            console.log('Access token not found in local storage');
            return null;
        }
    } catch (error) {
        console.log('Error getting access token:', error);
        return null;
    }
}

export default fetchJWT;
