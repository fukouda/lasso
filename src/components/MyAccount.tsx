import { Center, Flex, Heading, Text } from "@chakra-ui/react";
import { IWeb3FlowInfo } from "@superfluid-finance/sdk-core";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { web3Provider } from "../config/config";
import {
  calculateMonthlyPrice,
  calculateSecondsFromDateToNow,
} from "../utils/superfluid";
import SignButton from "./SignButton";

async function getFlowToMerchant(receiver: string) {
  const { provider, sf, accounts } = await web3Provider();

  const DAIx = await sf.loadWrapperSuperToken("fDAIx");

  return await sf.cfaV1.getFlow({
    superToken: DAIx.address,
    sender: accounts[0],
    receiver,
    providerOrSigner: provider,
  });
}

async function getNetFlow() {
  const { provider, sf, accounts } = await web3Provider();

  const DAIx = await sf.loadWrapperSuperToken("fDAIx");

  return await sf.cfaV1.getNetFlow({
    superToken: DAIx.address,
    account: accounts[0],
    providerOrSigner: provider,
  });
}

function MyAccount() {
  const [flowToMerchants, setFlowToMerchants] = useState<IWeb3FlowInfo[]>([]);
  const [netFlow, setNetFlow] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setNetFlow(await getNetFlow());
      setFlowToMerchants([
        await getFlowToMerchant("0x6e3E96F044bf41a071F4D8dccb8C037cbEE57441"),
        await getFlowToMerchant("0x6eA4d3dAB05f63495a002feD5AdAf0BA8FF6Bd94"),
        await getFlowToMerchant("0xa127655415e9fe2C36Ab1D7A6b1b2F0a5fE54A92"),
      ]);
    };

    fetchData();
  }, []);

  return (
    <Center>
      <Flex direction="column" alignItems="center" w="50vw">
        <Heading as="h1" size="4xl">
          My account
        </Heading>
        <Flex
          direction="column"
          alignItems="center"
          border="1px solid blue"
          w="50%"
          p={5}
          my={5}
        >
          <Text>Monthly cost on all subscriptions:</Text>
          <Text>{calculateMonthlyPrice(netFlow) * -1} DAI</Text>
        </Flex>
        {flowToMerchants.map((flow) => (
          <Flex
            direction="column"
            alignItems=""
            border="1px solid blue"
            w="80%"
            p={5}
            my={5}
          >
            <Text>Title: Subscription title (MOCK)</Text>
            <Text>{`Subscription started on: ${flow.timestamp}`}</Text>
            <Text>
              Wallet: 0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B (MOCK)
            </Text>
            <Text>{`Monthly cost: ${calculateMonthlyPrice(
              flow.flowRate
            )} DAI`}</Text>
            <Text>{`How much was paid so far: ${
              calculateSecondsFromDateToNow(flow.timestamp) *
              parseFloat(ethers.utils.formatEther(flow.flowRate))
            } DAI`}</Text>
          </Flex>
        ))}
        <SignButton />
      </Flex>
    </Center>
  );
}

export default MyAccount;
