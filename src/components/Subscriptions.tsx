import { CloseIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Container,
  Heading,
  SimpleGrid,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { IWeb3FlowInfo } from "@superfluid-finance/sdk-core";
import { ethers } from "ethers";
import { DocumentData } from "firebase/firestore/lite";
import { useEffect, useState } from "react";
import { web3Provider } from "../config/config";
import useWalletProvider from "../hooks/useWalletProvider";
import { toTitleCase } from "../utils";
import { getSubscriptions, toggleSubscription } from "../utils/firebase";
import { calculateSecondsFromDateToNow } from "../utils/superfluid";

function Subscriptions() {
  return GeneralSubscriptions();
}

function GeneralSubscriptions() {
  const { provider, account, connectWallet, framework } = useWalletProvider();
  const [subscriptionList, setSubscriptionList] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const getSubscriptionList = async () => {
    if (!account) {
      await connectWallet();
      setLoading(true);
      return;
    }
    try {
      const subscriptions = await getSubscriptions(account);
      subscriptions.forEach(async (subscription) => {
        subscription.data["active"]
          ? (subscription.data["paidSoFar"] = await getFlowToMerchant(
              subscription.data["owner"]
            ))
          : (subscription.data["paidSoFar"] = 0);
      });
      setSubscriptionList(subscriptions);
      setLoading(false);
      console.log(subscriptions);
    } catch {
      setError(true);
    }
  };

  useEffect(() => {
    getSubscriptionList();
  }, [, account]);

  const getFlowToMerchant = async (receiver: string) => {
    if (framework && account) {
      const DAIx = await framework.loadWrapperSuperToken("fDAIx");

      const flowToMerchant = await framework.cfaV1.getFlow({
        superToken: DAIx.address,
        sender: account,
        receiver,
        providerOrSigner: provider,
      });

      console.log(account);
      console.log(receiver);

      console.log("flowToMerchant: ", flowToMerchant);

      return (
        calculateSecondsFromDateToNow(flowToMerchant.timestamp) *
        parseFloat(ethers.utils.formatEther(flowToMerchant.flowRate))
      ).toFixed(5);
    }
  };

  const deleteFlow = async (recipient: string) => {
    if (framework && account) {
      const signer = framework.createSigner({ web3Provider: provider });

      const DAIx = await framework.loadWrapperSuperToken("fDAIx");

      try {
        const deleteFlowOperation = framework.cfaV1.deleteFlow({
          sender: account,
          receiver: recipient,
          superToken: DAIx.address,
        });

        await deleteFlowOperation.exec(signer);

        console.log(
          `Congrats - you've just deleted your money stream!
         Network: Mumbai
         Super Token: DAIx
         Sender: ${account}
         Receiver: ${recipient}
      `
        );
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  };

  const handleCancel = async (subscription: DocumentData) => {
    try {
      await deleteFlow(subscription.data["owner"])
        .then(async () => {
          const subscriptions = await toggleSubscription(subscription.id);
          getSubscriptionList();
        })
        .catch((error) => {
          setError(true);
          console.error(error);
        });
    } catch {
      setError(true);
    }
  };

  return (
    <Box position={"relative"}>
      <Container
        as={SimpleGrid}
        maxW={"7xl"}
        spacing={{ base: 10, lg: 32 }}
        py={{ base: 6 }}
      >
        <Stack py={{ base: 8, sm: 12, lg: 20 }} spacing={{ base: 10, md: 20 }}>
          <Heading fontSize={{ base: "5xl" }}>
            Manage your subscriptions
          </Heading>
          <Stack spacing={{ base: 10, md: 20 }}>
            <TableContainer border={"solid 1px #8C8C8C"} rounded={"lg"}>
              <Table size="md" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Service</Th>
                    <Th>Status</Th>
                    <Th>Type</Th>
                    <Th>Monthly Rate</Th>
                    <Th>Paid So Far</Th>
                    <Th>Date Activated</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {!!subscriptionList.length &&
                    subscriptionList.map((subscription, index) => {
                      return (
                        <Tr key={index}>
                          <Td>{subscription.data["serviceTitle"]}</Td>
                          <Td>
                            {subscription.data["active"]
                              ? "Active"
                              : "Inactive"}
                          </Td>
                          <Td>{toTitleCase(subscription.data["type"])}</Td>
                          <Td>{subscription.data["monthlyRate"]}</Td>
                          <Td>{subscription.data["paidSoFar"]}</Td>
                          <Td>
                            {subscription.data["date"].toDate().toDateString()}
                          </Td>
                          <Td>
                            {subscription.data["active"] ? (
                              <Button
                                fontFamily={"heading"}
                                w={"full"}
                                bgGradient={"linear(to-r, red.400,pink.400)"}
                                color={"white"}
                                _hover={{
                                  bgColor: "#0D0D0D",
                                  boxShadow: "xl",
                                }}
                                leftIcon={<CloseIcon />}
                                onClick={() => handleCancel(subscription)}
                              >
                                Cancel
                              </Button>
                            ) : null}
                          </Td>
                        </Tr>
                      );
                    })}
                </Tbody>
              </Table>
            </TableContainer>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

export default Subscriptions;
