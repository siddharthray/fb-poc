// module.exports = {
//     facebookAuth: {
//         clientID: "",
//         clientSecret: "",
//         callbackURL: "example.com/auth/facebook/callback",
//     },
// };
const secret = require("@aws-sdk/client-secrets-manager");
const secret_name = "note-fb-demo";

const client = new secret.SecretsManagerClient({
    region: "ap-south-1",
});

// let secretKeys;

const secretKeys = async () => {
    try {
        response = await client.send(
            new secret.GetSecretValueCommand({
                SecretId: secret_name,
                VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
            })
        );
        return response.SecretString;
    } catch (error) {
        throw error;
    }
};

module.exports = secretKeys;
