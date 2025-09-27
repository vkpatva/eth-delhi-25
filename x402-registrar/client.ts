import axios from "axios";
import { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { withPaymentInterceptor, decodeXPaymentResponse } from "x402-axios";
import dotenv from "dotenv";
dotenv.config();

const baseURL = "http://localhost:4020"; // e.g. https://example.com
const endpointPath = "/register";
if (!process.env.PRIVATE_KEY) {
  throw new Error("Private key must be set in .env file");
}

const account = privateKeyToAccount(process.env.PRIVATE_KEY as Hex);
const api = withPaymentInterceptor(
  axios.create({
    baseURL,
  }),
  account
);

api
  .post(endpointPath, {
    signature:
      "0x1234567890123456789012345678901234567890123456789012345678901234",
    chainId: 1,
    address: "0x1234567890123456789012345678901234567890",
  })
  .then(async (response) => {
    console.log("inside api");
    console.log(response.data);

    const paymentResponse = await decodeXPaymentResponse(
      response.headers["x-payment-response"]
    );
    console.log("inside payment response");
    console.log(paymentResponse);
  })
  .catch((error) => {
    console.log("error", error);
    console.error(error.response?.data);
  });
