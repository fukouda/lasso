import { useState } from "react";
import { ethers } from "ethers";
import {
  Text,
  Box,
  Heading,
  Button,
  Input,
  FormControl,
} from "@chakra-ui/react";
import { web3Provider } from "../config/config";

async function createNewFlow(recipient: string, flowRate: string) {
  const { provider, sf } = await web3Provider();

  const signer = sf.createSigner({ web3Provider: provider });

  const DAIxContract = await sf.loadWrapperSuperToken("fDAIx");
  const DAIx = DAIxContract.address;

  try {
    const createFlowOperation = sf.cfaV1.createFlow({
      flowRate: flowRate,
      receiver: recipient,
      superToken: DAIx,
    });

    console.log("Creating your stream...");

    const result = await createFlowOperation.exec(signer);
    console.log(result);

    console.log(
      `Congrats - you've just created a money stream!
    View Your Stream At: https://app.superfluid.finance/dashboard/${recipient}
    Network: Mumbai
    Super Token: DAIx
    Sender: 0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721
    Receiver: ${recipient},
    FlowRate: ${flowRate}
    `
    );
  } catch (error) {
    console.log(
      "Hmmm, your transaction threw an error. Make sure that this stream does not already exist, and that you've entered a valid Ethereum address!"
    );
    console.error(error);
  }
}

export const CreateFlow = () => {
  const [recipient, setRecipient] = useState("");
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [flowRate, setFlowRate] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");

  function calculateMonthlyPrice(amount: string): number {
    if (typeof Number(amount) !== "number" || isNaN(Number(amount)) === true) {
      alert("You can only calculate a flowRate based on a number");
      return 0;
    } else if (typeof Number(amount) === "number") {
      if (Number(amount) === 0) {
        return 0;
      }
      const amountInWei = ethers.BigNumber.from(amount);
      const monthlyAmount = ethers.utils.formatEther(amountInWei.toString());
      const calculatedFlowRate = parseFloat(monthlyAmount) * 3600 * 24 * 30;
      return calculatedFlowRate;
    }

    return 0;
  }

  const handleRecipientChange = (e: any) => {
    setRecipient(() => ([e.target.name] = e.target.value));
  };

  const handleFlowRateChange = (e: any) => {
    setFlowRate(() => ([e.target.name] = e.target.value));
    let newMonthlyPrice = calculateMonthlyPrice(e.target.value);
    setMonthlyPrice(newMonthlyPrice.toString());
  };

  return (
    <Box mt={6}>
      <Heading as="h2" size="2xl" mt={5} mb={3}>
        Setup a Stream
      </Heading>
      <Text fontSize="lg">
        Monthly Price: {monthlyPrice ? monthlyPrice : 0}
      </Text>
      <form>
        <FormControl>
          <Input
            id="recipient"
            value={recipient}
            onChange={handleRecipientChange}
            placeholder="Enter recipient address"
          />
        </FormControl>
        <FormControl>
          <Input
            id="flowRate"
            value={flowRate}
            onChange={handleFlowRateChange}
            placeholder="Enter a flowRate in wei"
          />
        </FormControl>
        <Button
          mt={2}
          colorScheme="blue"
          isLoading={isButtonLoading}
          onClick={() => {
            setIsButtonLoading(true);
            createNewFlow(recipient, flowRate);
            setTimeout(() => {
              setIsButtonLoading(false);
            }, 1000);
          }}
        >
          Click to Create Your Stream
        </Button>
      </form>
    </Box>
  );
};
