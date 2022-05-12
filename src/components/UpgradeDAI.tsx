import { useState } from "react";
import { daiABI, web3Provider } from "../config/config";
import { ethers } from "ethers";
import {
  Box,
  HStack,
  Heading,
  Button,
  Input,
  FormControl,
} from "@chakra-ui/react";

//will be used to approve super token contract to spend DAI
async function daiApprove(amount: string) {
  const { provider, sf } = await web3Provider();

  const signer = sf.createSigner({ web3Provider: provider });

  //fDAI on ropsten
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
        `Congrats, you just approved your DAI spend. You can see this tx at https://ropsten.etherscan.io/tx/${tx.hash}`
      );
    });
  } catch (error) {
    console.error(error);
  }
}

async function daiUpgrade(amount: string) {
  const { provider, sf } = await web3Provider();

  const signer = sf.createSigner({ web3Provider: provider });

  const DAIx = await sf.loadWrapperSuperToken(
    "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f"
  );

  try {
    console.log(`upgrading $${amount} DAI to DAIx`);
    const amountToUpgrade = ethers.utils.parseEther(amount.toString());
    const upgradeOperation = DAIx.upgrade({
      amount: amountToUpgrade.toString(),
    });
    const upgradeTxn = await upgradeOperation.exec(signer);
    await upgradeTxn.wait().then(function (tx: any) {
      console.log(
        `
        Congrats - you've just upgraded DAI to DAIx!
      `
      );
    });
  } catch (error) {
    console.error(error);
  }
}

export const UpgradeDAI = () => {
  const [amount, setAmount] = useState("");
  const [isUpgradeButtonLoading, setIsUpgradeButtonLoading] = useState(false);
  const [isApproveButtonLoading, setIsApproveButtonLoading] = useState(false);

  const handleAmountChange = (e: any) => {
    setAmount(() => ([e.target.name] = e.target.value));
  };

  return (
    <Box mt={10}>
      <Heading as="h2" size="2xl" mt={5} mb={3}>
        Upgrade DAI to DAIx
      </Heading>
      <form>
        <FormControl>
          <Input
            id="amount"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Enter the DAI amount you'd like to upgrade"
          />
        </FormControl>
        <HStack spacing="32px" mt={2}>
          <Button
            colorScheme="blue"
            isLoading={isApproveButtonLoading}
            onClick={() => {
              setIsApproveButtonLoading(true);
              daiApprove(amount);
              setTimeout(() => {
                setIsApproveButtonLoading(false);
              }, 1000);
            }}
          >
            Click to Approve Token Upgrade
          </Button>
          <Button
            colorScheme="blue"
            isLoading={isUpgradeButtonLoading}
            onClick={() => {
              setIsUpgradeButtonLoading(true);
              daiUpgrade(amount);
              setTimeout(() => {
                setIsUpgradeButtonLoading(false);
              }, 1000);
            }}
          >
            Click to Upgrade Your Tokens
          </Button>
        </HStack>
      </form>
    </Box>
  );
};
