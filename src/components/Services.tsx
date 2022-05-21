import { AddIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Link,
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
import {
  useNavigate,
  useParams,
  Link as ReactRouterLink,
} from "react-router-dom";
import { WalletConnectLogo } from "../assets/logos";
import useWalletProvider from "../hooks/useWalletProvider";
import { toTitleCase } from "../utils";
import { getServices, getSubscriptionsByServiceId } from "../utils/firebase";

function Services() {
  let { id } = useParams();
  if (!!id) {
    return <ServiceById id={id} />;
  }
  return <GeneralServices />;
}

function ServiceById(id: any) {
  const { provider, account, connectWallet } = useWalletProvider();
  const [subscriptionList, setSubscriptionList] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const getSubscriptionList = async () => {
    try {
      console.log(id);
      const subscriptions = await getSubscriptionsByServiceId(id.id);
      console.log(subscriptions);
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
          <Heading fontSize={{ base: "5xl" }}>Subscribers</Heading>
          <Stack spacing={{ base: 10, md: 20 }}>
            <TableContainer border={"solid 1px #8C8C8C"} rounded={"lg"}>
              <Table size="md" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Address</Th>
                    <Th>Handle</Th>
                    <Th>Status</Th>
                    <Th>Monthly Rate</Th>
                    <Th>Paid So Far</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {!!subscriptionList.length &&
                    subscriptionList.map((subscription) => {
                      return (
                        <Tr>
                          <Td>{subscription.data["subscriber"]}</Td>
                          <Td>{subscription.data["handle"]}</Td>
                          <Td>
                            {subscription.data["active"]
                              ? "Active"
                              : "Inactive"}
                          </Td>
                          <Td>{subscription.data["monthlyRate"]}</Td>
                          <Td>124.0{/* REPLACE */}</Td>
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
                    <Th>Monthly Rate</Th>
                    <Th>Earnings - total</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {!!subscriptionList.length &&
                    subscriptionList.map((service) => {
                      return (
                        <Tr>
                          <Td>{service.data["title"]}</Td>
                          <Td>
                            {service.data["active"] ? "Active" : "Inactive"}
                          </Td>
                          <Td>
                            {toTitleCase(service.data["subscriptionType"])}
                          </Td>
                          <Td>{service.data["monthlyRate"]}</Td>
                          <Td>124.0{/* REPLACE */}</Td>
                          <Td>
                            <Link
                              as={ReactRouterLink}
                              style={{ textDecoration: "none" }}
                              to={`/services/${service.id}`}
                            >
                              <Button
                                fontFamily={"heading"}
                                w={"full"}
                                bgGradient={"linear(to-r, red.400,pink.400)"}
                                color={"white"}
                                _hover={{
                                  bgColor: "#0D0D0D",
                                  boxShadow: "xl",
                                }}
                                rightIcon={<ChevronRightIcon />}
                              >
                                View
                              </Button>
                            </Link>
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

export default Services;
