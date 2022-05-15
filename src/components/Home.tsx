import {
  Box,
  Stack,
  Heading,
  Text,
  Container,
  Input,
  Button,
  SimpleGrid,
  InputGroup,
  InputRightElement,
  Select,
} from "@chakra-ui/react";
import { BigNumber, ethers } from "ethers";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { web3Provider } from "../config/config";
import { createSubscription } from "../utils/firebase";

export default function Home() {
  const [provider, setProvider] = useState<any>();
  const [account, setAccount] = useState<string>();
  const [error, setError] = useState<string>("");

  const [subscriptionName, setSubscriptionName] = useState<string>("");
  const [monthlyRate, setMonthlyRate] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("");

  const navigate = useNavigate();

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

  function calculateFlowRate(amountInEther: number) {
    if (
      typeof Number(amountInEther) !== "number" ||
      isNaN(Number(amountInEther)) === true
    ) {
      console.log(typeof Number(amountInEther));
      alert("You can only calculate a flowRate based on a number");
      return;
    } else if (typeof Number(amountInEther) === "number") {
      const monthlyAmount: BigNumber = ethers.utils.parseEther(
        amountInEther.toString()
      );
      const calculatedFlowRate = monthlyAmount.div(3600).div(24).div(30);
      return calculatedFlowRate;
    }
  }

  const handleSubscriptionNameChange = (e: any) => {
    setSubscriptionName(() => ([e.target.name] = e.target.value));
  };

  const handleMonthlyRateChange = (e: any) => {
    setMonthlyRate(() => ([e.target.name] = e.target.value));
  };

  const handleSubmit = async () => {
    if (!account) return;
    const subscriptionData = {
      owner: account,
      title: subscriptionName,
      subscriptionType: "discord",
      monthlyRate,
      flowRate: calculateFlowRate(monthlyRate)?.toString(),
    };

    console.log(subscriptionData);
    const id = await createSubscription(subscriptionData);

    navigate(`/subscribe/${id}`);
  };
  return (
    <Box position={"relative"}>
      <Container
        as={SimpleGrid}
        maxW={"7xl"}
        columns={{ base: 1, md: 2 }}
        spacing={{ base: 10, lg: 32 }}
        py={{ base: 10, sm: 20, lg: 32 }}
      >
        <Stack spacing={{ base: 10, md: 20 }}>
          <Heading
            lineHeight={1.1}
            fontSize={{ base: "3xl", sm: "4xl", md: "5xl", lg: "6xl" }}
          >
            On-chain, anonymous crypto subscriptions in a matter of seconds
            <Text color={"gray.500"} fontSize={{ base: "sm", sm: "md" }}>
              There is no strife, no prejudice, no national conflict in outer
              space as yet. Its hazards are hostile to us all.
            </Text>
          </Heading>
        </Stack>
        <Stack
          bg={"white"}
          rounded={"xl"}
          border={"solid 2px #D9D9D9"}
          p={{ base: 4, sm: 6, md: 8 }}
          spacing={{ base: 8 }}
          maxW={{ lg: "lg" }}
        >
          <Stack spacing={4}>
            <Heading
              color={"gray.800"}
              lineHeight={1.1}
              fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
            >
              Get Started 🚀
            </Heading>
            <Text color={"gray.500"} fontSize={{ base: "sm", sm: "md" }}>
              Set up your one-click subscription stream
            </Text>
          </Stack>
          <Box as={"form"} mt={10}>
            <Stack spacing={4}>
              <Text color={"gray.500"} fontSize={{ base: "sm", sm: "md" }}>
                What service are you providing?
              </Text>
              <Input
                placeholder="e.g Paid Private Discord"
                onChange={handleSubscriptionNameChange}
              />
              <Text color={"gray.500"} fontSize={{ base: "sm", sm: "md" }}>
                How much are you charging per cycle?
              </Text>
              <InputGroup>
                <Input
                  placeholder="e.g. 100.0"
                  onChange={handleMonthlyRateChange}
                />
                <InputRightElement
                  children={
                    <Select size="md" placeholder="DAI">
                      <option value="option1">USDC</option>
                      <option value="option2">USDT</option>
                    </Select>
                  }
                />
              </InputGroup>
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
                  bgColor={"#0D0D0D"}
                  color={"white"}
                  onClick={handleSubmit}
                  _hover={{
                    bgGradient: "linear(to-r, red.400,pink.400)",
                    boxShadow: "xl",
                  }}
                >
                  Submit
                </Button>
                <Text color={"gray.500"} fontSize={{ base: "sm", sm: "md" }}>
                  Connected Wallet: {account}
                </Text>
              </>
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
