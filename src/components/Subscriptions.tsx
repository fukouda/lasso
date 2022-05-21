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
import { DocumentData } from "firebase/firestore/lite";
import { useEffect, useState } from "react";
import useWalletProvider from "../hooks/useWalletProvider";
import { toTitleCase } from "../utils";
import { getSubscriptions, toggleSubscription } from "../utils/firebase";

function Subscriptions() {
  return GeneralSubscriptions();
}

function GeneralSubscriptions() {
  const { provider, account, connectWallet } = useWalletProvider();
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
      setSubscriptionList(subscriptions);
      setLoading(false);
    } catch {
      setError(true);
    }
  };

  useEffect(() => {
    getSubscriptionList();
  }, [, account]);

  const handleCancel = async (subscriptionId: string) => {
    try {
      const subscriptions = await toggleSubscription(subscriptionId);
      getSubscriptionList();
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
                    subscriptionList.map((subscription) => {
                      return (
                        <Tr>
                          <Td>{subscription.data["serviceTitle"]}</Td>
                          <Td>
                            {subscription.data["active"]
                              ? "Active"
                              : "Inactive"}
                          </Td>
                          <Td>{toTitleCase(subscription.data["type"])}</Td>
                          <Td>{subscription.data["monthlyRate"]}</Td>
                          <Td>124.0{/* REPLACE */}</Td>
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
                                onClick={() => handleCancel(subscription.id)}
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
