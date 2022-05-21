import { AddIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { DocumentData } from "firebase/firestore/lite";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WalletConnectLogo } from "../assets/logos";
import useWalletProvider from "../hooks/useWalletProvider";
import { getServices } from "../utils/firebase";

function Services() {
  return GeneralServices();
}

function GeneralServices() {
  const { provider, account, connectWallet } = useWalletProvider();
  const [subscriptionList, setSubscriptionList] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const navigate = useNavigate();

  const handleCreate = () => navigate("/create");

  const getSubscriptionList = async () => {
    if (!account) {
      await connectWallet();
      setLoading(true);
      return;
    }
    try {
      const subscriptions = await getServices(account);
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
        py={{ base: 2 }}
      >
        <Stack py={{ base: 8, sm: 12, lg: 20 }} spacing={{ base: 8 }}>
          <Heading fontSize={{ base: "5xl" }}>Manage your services</Heading>
          <Flex justifyContent={"flex-end"}>
            <Button
              variant={"solid"}
              bgColor={"#0A7CFF"}
              color={"#FFF"}
              maxWidth={"200px"}
              size={"md"}
              ml={"auto"}
              onClick={handleCreate}
              leftIcon={<AddIcon />}
            >
              Create Service
            </Button>
          </Flex>
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
                          <Td>
                            {subscription["active"] ? "Active" : "Inactive"}
                          </Td>
                          <Td>{subscription["subscriptionType"]}</Td>
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

export default Services;
