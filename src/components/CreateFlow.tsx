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
import { daiABI, web3Provider } from "../config/config";
import { calculateMonthlyPrice } from "../utils/superfluid";

//will be used to approve super token contract to spend DAI
async function daiApprove(amount: string) {
  const { provider, sf } = await web3Provider();

  const signer = sf.createSigner({ web3Provider: provider });

  //fDAI on mumbai
  const DAI = new ethers.Contract(
    "0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7",
    daiABI,
    signer
  );
  try {
    console.log("approving DAI spend");
    await DAI.approve(
      "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f",
      ethers.utils.parseEther(amount.toString())
    ).then(function (tx: any) {
      console.log(
        `Congrats, you just approved your DAI spend. You can see this tx at  https://mumbai.polygonscan.com/tx/${tx.hash}`
      );
    });
  } catch (error) {
    console.error(error);
  }
}

async function executeBatchCall(
  upgradeAmount: string,
  recipient: string,
  flowRate: string
) {
  const { provider, sf, accounts } = await web3Provider();

  const signer = sf.createSigner({ web3Provider: provider });

  const DAIx = await sf.loadWrapperSuperToken("fDAIx");

  try {
    const amountToUpgrade = ethers.utils.parseEther(upgradeAmount.toString());
    const upgradeOperation = DAIx.upgrade({
      amount: amountToUpgrade.toString(),
    });
    //upgrade and create stream at once
    const createFlowOperation = sf.cfaV1.createFlow({
      flowRate: flowRate,
      receiver: recipient,
      superToken: DAIx.address,
    });

    console.log("Upgrading tokens and creating stream...");

    await sf
      .batchCall([upgradeOperation, createFlowOperation])
      .exec(signer)
      .then(function (tx) {
        console.log(
          `Congrats - you've just successfully executed a batch call!
          You have completed 2 operations in a single tx 🤯
          View the tx here:  https://mumbai.polygonscan.com/tx/${tx.hash}
          View Your Stream At: https://app.superfluid.finance/dashboard/${recipient}
          Network: Mumbai
          Super Token: DAIx
          Sender: ${accounts[0]}
          Receiver: ${recipient},
          FlowRate: ${flowRate}
          `
        );
      });
  } catch (error) {
    console.log(
      "Hmmm, your transaction threw an error. Make sure that this stream does not already exist, and that you've entered a valid Ethereum address!"
    );
    console.error(error);
  }
}

export const CreateFlow = () => {
  const [approveAmount, setApproveAmount] = useState("");
  const [upgradeAmount, setUpgradeAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [flowRate, setFlowRate] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [isApproveButtonLoading, setIsApproveButtonLoading] = useState(false);
  const [isBatchCallButtonLoading, setIsBatchCallButtonLoading] =
    useState(false);

  const handleApproveAmountChange = (e: any) => {
    setApproveAmount(() => ([e.target.name] = e.target.value));
  };

  const handleUpgradeAmountChange = (e: any) => {
    setUpgradeAmount(() => ([e.target.name] = e.target.value));
  };

  const handleRecipientChange = (e: any) => {
    setRecipient(() => ([e.target.name] = e.target.value));
  };

  const handleFlowRateChange = (e: any) => {
    setFlowRate(() => ([e.target.name] = e.target.value));
    let newMonthlyPrice = calculateMonthlyPrice(e.target.value);
    setMonthlyPrice(newMonthlyPrice.toString());
  };

  return (
    <Box>
      <Heading as="h2" size="2xl" mt={5} mb={3}>
        Approve
      </Heading>
      <form>
        <FormControl>
          <Input
            id="approveAmount"
            value={approveAmount}
            onChange={handleApproveAmountChange}
            placeholder="Enter how many tokens to approve first"
          />
        </FormControl>
        <Button
          mt={2}
          colorScheme="blue"
          isLoading={isApproveButtonLoading}
          onClick={() => {
            setIsApproveButtonLoading(true);
            daiApprove(approveAmount);
            setTimeout(() => {
              setIsApproveButtonLoading(false);
            }, 1000);
          }}
        >
          Click to approve tokens
        </Button>
      </form>
      <Heading as="h2" size="2xl" mt={5} mb={3}>
        Setup a Stream
      </Heading>
      <Text fontSize="lg">
        Monthly Price: {monthlyPrice ? monthlyPrice : 0}
      </Text>
      <form>
        <FormControl>
          <Input
            id="upgradeAmount"
            value={upgradeAmount}
            onChange={handleUpgradeAmountChange}
            placeholder="Enter the dollar amount you'd like to upgrade"
          />
        </FormControl>
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
          isLoading={isBatchCallButtonLoading}
          onClick={() => {
            setIsBatchCallButtonLoading(true);
            executeBatchCall(upgradeAmount, recipient, flowRate);
            setTimeout(() => {
              setIsBatchCallButtonLoading(false);
            }, 1000);
          }}
        >
          Click to Upgrade Tokens and Create Your Stream
        </Button>
      </form>
    </Box>
  );
};
