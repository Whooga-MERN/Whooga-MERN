const { CognitoJwtVerifier } = require("aws-jwt-verify");

const authenticateJWTToken = async (request, response, next) => {
    // Verifier that expects valid access tokens:
    const verifier = CognitoJwtVerifier.create({
        userPoolId: process.env.USER_POOL_ID,
        tokenUse: "access",
        clientId: [process.env.CLIENT_ID_WEB, process.env.CLIENT_ID_APP],
    });

    try {
        token = (request.headers.authorization).split(" ")[1];
        
        if(!token)
            return response.status(401).send("Unauthorized: No token provided");
        console.log(token);

        const payload = await verifier.verify(token);
        console.log("Token is valid. Payload:", payload);
        //response.status(200).send("Authorized");
        next();
    } catch {
        console.log("Token not valid!");
        response.status(401).send("Unauthorized");
    }
};

module.exports = { authenticateJWTToken };

