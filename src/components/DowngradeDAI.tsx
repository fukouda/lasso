import { useState } from "react";
import { web3Provider } from "../config/config";
import { ethers } from "ethers";
import { Box, Heading, Button, Input, FormControl } from "@chakra-ui/react";

async function daiDowngrade(amount: string) {
  const { provider, sf } = await web3Provider();

  const signer = sf.createSigner({ web3Provider: provider });

  const DAIx = await sf.loadWrapperSuperToken(
    "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f"
  );

  try {
    console.log(`Downgrading $${amount} fDAIx...`);
    const amountToDowngrade = ethers.utils.parseEther(amount.toString());
    const downgradeOperation = DAIx.downgrade({
      amount: amountToDowngrade.toString(),
    });
    const downgradeTxn = await downgradeOperation.exec(signer);
    await downgradeTxn.wait().then(function (tx: any) {
      console.log(
        `
        Congrats - you've just downgraded DAI to DAIx!
        You can see this tx at https://ropsten.etherscan.io/tx/${tx.transactionHash}
        Network: Ropsten
      `
      );
    });
  } catch (error) {
    console.error(error);
  }
}

export const DowngradeDAI = () => {
  const [amount, setAmount] = useState("");
  const [isDowngradeButtonLoading, setIsDowngradeButtonLoading] =
    useState(false);

  const handleAmountChange = (e: any) => {
    setAmount(() => ([e.target.name] = e.target.value));
  };

  return (
    <Box my={10}>
      <Heading as="h2" size="2xl" mb={3}>
        Downgrade DAIx to DAI
      </Heading>
      <form>
        <FormControl>
          <Input
            id="amount2"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Enter the DAIx amount you'd like to downgrade"
          />
        </FormControl>
        <Button
          mt={2}
          colorScheme="blue"
          isLoading={isDowngradeButtonLoading}
          onClick={() => {
            setIsDowngradeButtonLoading(true);
            daiDowngrade(amount);
            setTimeout(() => {
              setIsDowngradeButtonLoading(false);
            }, 1000);
          }}
        >
          Click to Downgrade Your Tokens
        </Button>
      </form>
    </Box>
  );
};
