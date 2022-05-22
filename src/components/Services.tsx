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
  HStack,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { ethers } from "ethers";
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
import {
  getService,
  getServices,
  getSubscriptionsByServiceId,
} from "../utils/firebase";
import { calculateSecondsFromDateToNow } from "../utils/superfluid";

function Services() {
  let { id } = useParams();
  if (!!id) {
    return <ServiceById id={id} />;
  }
  return <GeneralServices />;
}

function ServiceById(id: any) {
  const { provider, account, connectWallet, framework } = useWalletProvider();
  const [subscriptionList, setSubscriptionList] = useState<DocumentData[]>([]);
  const [netFlow, setNetFlow] = useState("");
  const [service, setService] = useState<DocumentData>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const getSubscriptionList = async () => {
    try {
      console.log(id);
      const subscriptions = await getSubscriptionsByServiceId(id.id);
      subscriptions.forEach(async (subscription) => {
        subscription.data["active"]
          ? (subscription.data["earnings"] = await getFlowToMerchant(
              subscription.data["subscriber"]
            ))
          : (subscription.data["earnings"] = 0);
      });
      setService(await getService(id.id));
      console.log(subscriptions);
      setSubscriptionList(subscriptions);
      setLoading(false);
    } catch {
      setError(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      getSubscriptionList();
      setNetFlow(await getNetFlow());
    };

    fetchData();
  }, [, account]);

  const getFlowToMerchant = async (sender: string) => {
    if (framework && account) {
      const DAIx = await framework.loadWrapperSuperToken("fDAIx");

      const flowToMerchant = await framework.cfaV1.getFlow({
        superToken: DAIx.address,
        sender,
        receiver: account,
        providerOrSigner: provider,
      });

      return (
        calculateSecondsFromDateToNow(flowToMerchant.timestamp) *
        parseFloat(ethers.utils.formatEther(flowToMerchant.flowRate))
      ).toFixed(5);
    }
  };

  const getNetFlow = async () => {
    if (framework && account) {
      const DAIx = await framework.loadWrapperSuperToken("fDAIx");

      return parseFloat(
        ethers.utils.formatEther(
          await framework.cfaV1.getNetFlow({
            superToken: DAIx.address,
            account: account,
            providerOrSigner: provider,
          })
        )
      ).toFixed(8);
    }
    return "";
  };

  return (
    <Box position={"relative"}>
      <Container
        as={SimpleGrid}
        maxW={"7xl"}
        spacing={{ base: 10, lg: 32 }}
        py={{ base: 2 }}
      >
        <Stack py={{ base: 8, sm: 12, lg: 20 }} spacing={{ base: 8 }}>
          <Stack
            py={{ base: 8, sm: 12, lg: 20 }}
            spacing={{ base: 10, md: 20 }}
          >
            <HStack spacing={{ base: 10, md: 20 }} marginX={"auto"}>
              <Box border={"solid 2px #8C8C8C"} padding={12} rounded={"xl"}>
                <Heading
                  lineHeight={1.1}
                  fontSize={{ base: "3xl", sm: "4xl", md: "5xl", lg: "6xl" }}
                >
                  <Text color={"gray.500"} fontSize={{ base: "sm", sm: "md" }}>
                    Active Subscribers
                  </Text>
                  {
                    subscriptionList.filter(
                      (subscription) => subscription.data["active"]
                    ).length
                  }
                </Heading>
              </Box>
              <Box border={"solid 2px #8C8C8C"} padding={12} rounded={"xl"}>
                <Heading
                  lineHeight={1.1}
                  fontSize={{ base: "3xl", sm: "4xl", md: "5xl", lg: "6xl" }}
                >
                  <Text color={"gray.500"} fontSize={{ base: "sm", sm: "md" }}>
                    Monthly Cost
                  </Text>
                  {service && service["monthlyRate"]} DAI
                </Heading>
              </Box>
              <Box border={"solid 2px #8C8C8C"} padding={12} rounded={"xl"}>
                <Heading
                  lineHeight={1.1}
                  fontSize={{ base: "3xl", sm: "4xl", md: "5xl", lg: "6xl" }}
                >
                  <Text color={"gray.500"} fontSize={{ base: "sm", sm: "md" }}>
                    Total Earnings
                  </Text>
                  {netFlow} DAI
                </Heading>
              </Box>
            </HStack>
          </Stack>
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
                    <Th>Date Subscribed</Th>
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
                          <Td>{subscription.data["earnings"]}</Td>
                          <Td>
                            {subscription.data["date"].toDate().toDateString()}
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

function GeneralServices() {
  const { provider, account, connectWallet, framework } = useWalletProvider();
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
      subscriptions.forEach(async (subscription) => {
        subscription.data["active"]
          ? (subscription.data["earnings"] = await getFlowToMerchant())
          : (subscription.data["earnings"] = 0);
      });
      setSubscriptionList(subscriptions);
      setLoading(false);
    } catch {
      setError(true);
    }
  };

  useEffect(() => {
    getSubscriptionList();
  }, [, account]);

  const getFlowToMerchant = async () => {
    if (framework && account) {
      const DAIx = await framework.loadWrapperSuperToken("fDAIx");

      const flowToMerchant = await framework.cfaV1.getAccountFlowInfo({
        superToken: DAIx.address,
        account,
        providerOrSigner: provider,
      });

      return (
        calculateSecondsFromDateToNow(flowToMerchant.timestamp) *
        parseFloat(ethers.utils.formatEther(flowToMerchant.flowRate))
      ).toFixed(19);
    }
  };

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
                          <Td>{service.data["earnings"]}</Td>
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
