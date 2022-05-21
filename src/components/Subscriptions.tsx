import {
  Box,
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
import { getSubscriptions } from "../utils/firebase";

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
                    <Th>Subscribers</Th>
                    <Th>Earnings - last month</Th>
                    <Th>Earnings - total</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {!!subscriptionList.length &&
                    subscriptionList.map((subscription) => {
                      return (
                        <Tr>
                          <Td>{subscription["title"]}</Td>
                          <Td>Active</Td>
                          <Td>{subscription["type"]}</Td>
                          <Td>124</Td>
                          <Td>{subscription["monthlyRate"]}</Td>
                          <Td>0</Td>
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
