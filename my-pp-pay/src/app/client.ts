import { createThirdwebClient } from "thirdweb";

const clientID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;


if (!clientID) {
    throw new Error("Client ID or secret key is not set");
}


export const Client = createThirdwebClient({ 
    clientId: clientID, 
}); 