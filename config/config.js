// module.exports = {
//     facebookAuth: {
//         clientID: "",
//         clientSecret: "",
//         callbackURL: "example.com/auth/facebook/callback",
//     },
// };
const secret = require("@aws-sdk/client-secrets-manager");
const secret_name = "note-fb-demo";
const secret_name2 = "cert-key";

const client = new secret.SecretsManagerClient({
    region: "ap-south-1",
});

// let secretKeys;

const secretKeys = async () => {
    try {
        let response1 = await client.send(
            new secret.GetSecretValueCommand({
                SecretId: secret_name,
                VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
            })
        );
        let response2 = await client.send(
            new secret.GetSecretValueCommand({
                SecretId: secret_name2,
                VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
            })
        );
        return {
            secrets: response1.SecretString,
            certKey: response2.SecretString,
        };
    } catch (error) {
        throw error;
    }
};

module.exports = secretKeys;
