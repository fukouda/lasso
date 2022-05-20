import { Button } from "@chakra-ui/react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { web3Provider } from "../config/config";

async function signMessage(nonce: number) {
  const { rawProvider, provider, sf, accounts } = await web3Provider();

  const signer = sf.createSigner({ web3Provider: provider });

  let signature;
  if (rawProvider.wc) {
    signature = await provider.send("personal_sign", [
      ethers.utils.hexlify(ethers.utils.toUtf8Bytes(nonce.toString())),
      accounts[0],
    ]);
  } else {
    signature = await signer.signMessage(nonce.toString());
  }

  return signature;
}

function SignButton() {
  const [signature, setSignature] = useState("");
  const [isSignButtonLoading, setIsSignButtonLoading] = useState(false);

  useEffect(() => {
    if (signature !== "") {
      const decodedAddress = ethers.utils.verifyMessage("10000", signature);
      console.log(decodedAddress);
    }
  }, [signature]);

  return (
    <Button
      mt={2}
      colorScheme="blue"
      isLoading={isSignButtonLoading}
      onClick={async () => {
        setIsSignButtonLoading(true);
        setSignature(await signMessage(10000));
        setTimeout(() => {
          setIsSignButtonLoading(false);
        }, 1000);
      }}
    >
      Click to Sign Message
    </Button>
  );
}

export default SignButton;
