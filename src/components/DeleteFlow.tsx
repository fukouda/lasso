import { useState } from "react";
import { Box, Heading, Button, Input, FormControl } from "@chakra-ui/react";
import { web3Provider } from "../config/config";

async function deleteFlow(recipient: string) {
  const { provider, accounts, sf } = await web3Provider();

  const signer = sf.createSigner({ web3Provider: provider });

  const DAIxContract = await sf.loadWrapperSuperToken("fDAIx");
  const DAIx = DAIxContract.address;

  try {
    const deleteFlowOperation = sf.cfaV1.deleteFlow({
      sender: accounts[0],
      receiver: recipient,
      superToken: DAIx,
    });

    console.log("Deleting your stream...");

    await deleteFlowOperation.exec(signer);

    console.log(
      `Congrats - you've just deleted your money stream!
       Network: Mumbai
       Super Token: DAIx
       Sender: ${accounts[0]}
       Receiver: ${recipient}
    `
    );
  } catch (error) {
    console.error(error);
  }
}

export const DeleteFlow = () => {
  const [recipient, setRecipient] = useState("");
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const handleRecipientChange = (e: any) => {
    setRecipient(() => ([e.target.name] = e.target.value));
  };

  return (
    <Box mt={6}>
      <Heading as="h2" size="2xl" mt={5} mb={3}>
        Cancel a Stream
      </Heading>
      <form>
        <FormControl>
          <Input
            id="recipient"
            value={recipient}
            onChange={handleRecipientChange}
            placeholder="Enter recipient address"
          />
        </FormControl>
        <Button
          mt={2}
          colorScheme="blue"
          isLoading={isButtonLoading}
          onClick={() => {
            setIsButtonLoading(true);
            deleteFlow(recipient);
            setTimeout(() => {
              setIsButtonLoading(false);
            }, 1000);
          }}
        >
          Click to Delete Your Stream
        </Button>
      </form>
    </Box>
  );
};
