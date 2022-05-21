import { useState, useEffect, useCallback } from "react";
import Web3Modal from "web3modal";
import "../css/App.css";
import { daiABI, web3Provider } from "../config/config";
import {
  Flex,
  Text,
  Box,
  Heading,
  Button,
  Container,
  Input,
  InputGroup,
  InputRightAddon,
  SimpleGrid,
  Stack,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { DowngradeDAI } from "./DowngradeDAI";
import { CreateFlow } from "./CreateFlow";
import { DeleteFlow } from "./DeleteFlow";
import { DAIxLogo } from "../assets/logos";
import { createSubscription, getService } from "../utils/firebase";
import { Service } from "../utils/types";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { DocumentData } from "firebase/firestore/lite";
import { toTitleCase } from "../utils";

const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions: {},
});

function Subscribe() {
  const [provider, setProvider] = useState<any>();
  const [account, setAccount] = useState<string>();
  const [error, setError] = useState<string>("");
  const [DAIBalance, setDAIBalance] = useState("");
  const [DAIxBalance, setDAIxBalance] = useState("");
  const [loading, setLoading] = useState(false);
  const [service, setService] = useState<DocumentData>();

  const [handle, setHandle] = useState("");

  let { id } = useParams();
  const navigate = useNavigate();

  const getServiceInfo = useCallback(async () => {
    if (!id) {
      navigate("/create");
      return;
    }
    try {
      const service = await getService(id);
      if (!service) {
        setError("Error loading service");
        return;
      }
      console.log("setting");
      setService(service);
      setLoading(false);
    } catch {
      setError("Error loading service");
    }
  }, [id]);

  useEffect(() => {
    getServiceInfo();
  }, []);

  const connectWallet = async () => {
    try {
      const { provider, accounts } = await web3Provider();
      setProvider(provider);
      setAccount(accounts[0]);
    } catch (error) {
      console.log(error);
      setError("something went wrong!");
    }
  };

  const refreshState = () => {
    setAccount("");
  };

  const disconnect = () => {
    web3Modal.clearCachedProvider();
    refreshState();
  };

  const getBalances = async () => {
    const { provider, sf, accounts } = await web3Provider();

    const signer = sf.createSigner({ web3Provider: provider });

    //fDAI on mumbai
    const DAI = new ethers.Contract(
      "0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7",
      daiABI,
      signer
    );

    const DAIx = await sf.loadWrapperSuperToken(
      "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f"
    );

    setDAIBalance(ethers.utils.formatEther(await DAI.balanceOf(accounts[0])));
    setDAIxBalance(
      ethers.utils.formatEther(
        await DAIx.balanceOf({ account: accounts[0], providerOrSigner: signer })
      )
    );
  };

  useEffect(() => {
    getBalances();
  }, [DAIBalance, DAIxBalance]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, []);

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("accountsChanged", accounts);
        if (accounts) setAccount(accounts[0]);
      };

      const handleDisconnect = () => {
        console.log("disconnect", error);
        disconnect();
      };

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("disconnect", handleDisconnect);

      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [provider]);

  const handleHandleChange = (e: any) => {
    setHandle(() => ([e.target.name] = e.target.value));
  };

  const handleSubscribe = async () => {
    if (!account || !id || !service) return;
    const subscriptionData = {
      service: id,
      subscriber: account,
      handle,
      active: true,
      monthlyRate: service["monthlyRate"],
      date: new Date(),
    };

    console.log(subscriptionData);
    const serviceId = await createSubscription(subscriptionData);

    navigate(`/subscribe/${serviceId}`);
  };

  return (
    <Box position={"relative"}>
      {/*<div className="App">
      <header className="App-header">
        <Heading as="h1" size="4xl" isTruncated>
          Subscriptions with Superfluid
        </Heading>
        {!account ? (
          <Button my={5} onClick={connectWallet}>
            Connect Wallet
          </Button>
        ) : (
          <Box>
            <Heading as="h5" mt={3} size="sm">{`Account: ${account}`}</Heading>
            <Flex justify={"space-around"} mt={1}>
              <Text fontSize="xl">DAI balance: {DAIBalance}</Text>
              <Text fontSize="xl">DAIx balance: {DAIxBalance}</Text>
            </Flex>
            <Box>
              <CreateFlow />
              <DeleteFlow />
              <DowngradeDAI />
            </Box>
          </Box>
        )}
      </header>
        </div>*/}
      <Container
        as={SimpleGrid}
        maxW={"7xl"}
        columns={{ base: 1, md: 2 }}
        spacing={{ base: 10, lg: 32 }}
        py={{ base: 8, sm: 12, lg: 20 }}
      >
        <Stack py={{ base: 8, sm: 12, lg: 20 }} spacing={{ base: 4 }}>
          <Stack spacing={{ base: 1 }}>
            <Text color={"gray.500"} fontSize={{ base: "sm", sm: "md" }}>
              Subscription Type:{" "}
              {service && toTitleCase(service["subscriptionType"])}
            </Text>
            <Heading
              lineHeight={1.1}
              fontSize={{ base: "3xl", sm: "4xl", md: "5xl", lg: "6xl" }}
            >
              {service && service["title"]}
            </Heading>
          </Stack>
          <Stack spacing={{ base: 1 }}>
            <Text color={"gray.500"} fontSize={{ base: "sm", sm: "md" }}>
              Monthly Cost
            </Text>
            <Heading
              lineHeight={1.1}
              fontSize={{ base: "3xl", sm: "4xl", md: "5xl", lg: "6xl" }}
            >
              {service && service["monthlyRate"]} DAIx
            </Heading>
          </Stack>
          <Stack spacing={{ base: 1 }}>
            <Text color={"gray.500"} fontSize={{ base: "sm", sm: "md" }}>
              Merchant Wallet
            </Text>
            <Heading
              lineHeight={1.1}
              fontSize={{ base: "3xl", sm: "4xl", md: "5xl", lg: "6xl" }}
            >
              {service &&
                `${service["owner"].substring(0, 6)}...${service[
                  "owner"
                ].substring(
                  service["owner"].length - 4,
                  service["owner"].length
                )}`}
            </Heading>
          </Stack>
        </Stack>
        <Stack
          rounded={"xl"}
          border={"solid 1px #8C8C8C"}
          p={{ base: 4, sm: 6, md: 8 }}
          spacing={{ base: 8 }}
          maxW={{ lg: "lg" }}
        >
          <Box as={"form"} mt={10}>
            <Stack spacing={8}>
              <Stack>
                <Text fontSize={{ base: "sm", sm: "md" }}>Discord Handle</Text>
                <Input
                  placeholder="e.g. bigb0ss#6969"
                  onChange={handleHandleChange}
                />
              </Stack>
              <Stack>
                <Text fontSize={{ base: "sm", sm: "md" }}>Escrow Amount</Text>
              </Stack>
              <Stack>
                <Text fontSize={{ base: "sm", sm: "md" }}>
                  Your DAIx Balance
                </Text>
                <Text fontSize="xl">{DAIxBalance}</Text>
              </Stack>
            </Stack>
            {!account ? (
              <Button
                fontFamily={"heading"}
                mt={8}
                w={"full"}
                bgColor={"#0D0D0D"}
                onClick={connectWallet}
                color={"white"}
                _hover={{
                  bgGradient: "linear(to-r, red.400,pink.400)",
                  boxShadow: "xl",
                }}
              >
                Connect wallet to continue
              </Button>
            ) : (
              <>
                <Button
                  fontFamily={"heading"}
                  mt={8}
                  w={"full"}
                  bgGradient={"linear(to-r, red.400,pink.400)"}
                  color={"white"}
                  _hover={{
                    bgColor: "#0D0D0D",
                    boxShadow: "xl",
                  }}
                  onClick={handleSubscribe}
                >
                  Subscribe
                </Button>
                <Text
                  color={"gray.500"}
                  mt={2}
                  textAlign={"center"}
                  fontSize={{ base: "sm", sm: "md" }}
                >
                  Connected Wallet:{" "}
                  {`${account.substring(0, 6)}...${account.substring(
                    account.length - 4,
                    account.length
                  )}`}
                </Text>
              </>
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

export default Subscribe;
