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
  InputRightAddon,
} from "@chakra-ui/react";
import { BigNumber, ethers } from "ethers";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DAIxLogo } from "../assets/logos";
import useWalletProvider from "../hooks/useWalletProvider";
import { createService } from "../utils/firebase";

export default function Create() {
  const [subscriptionName, setSubscriptionName] = useState<string>("");
  const [subscriptionType, setSubscriptionType] = useState<string>("");
  const [monthlyRate, setMonthlyRate] = useState<number>(0);
  const { provider, account, connectWallet } = useWalletProvider();

  const navigate = useNavigate();

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

  const handleSubscriptionTypeChange = (e: any) => {
    setSubscriptionType(() => ([e.target.name] = e.target.value));
  };

  const handleMonthlyRateChange = (e: any) => {
    setMonthlyRate(() => ([e.target.name] = e.target.value));
  };

  const handleSubmit = async () => {
    if (!account) return;
    const subscriptionData = {
      owner: account,
      title: subscriptionName,
      active: true,
      subscriptionType: "discord",
      date: new Date(),
      monthlyRate,
      flowRate: calculateFlowRate(monthlyRate)?.toString(),
    };

    console.log(subscriptionData);
    const id = await createService(subscriptionData);

    navigate(`/subscribe/${id}`);
  };
  return (
    <Box position={"relative"}>
      <Container
        as={SimpleGrid}
        maxW={"7xl"}
        columns={{ base: 1, md: 2 }}
        spacing={{ base: 10, lg: 32 }}
        py={{ base: 8, sm: 12, lg: 20 }}
      >
        <Stack py={{ base: 8, sm: 12, lg: 20 }} spacing={{ base: 10, md: 20 }}>
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
          rounded={"xl"}
          border={"solid 1px #8C8C8C"}
          p={{ base: 4, sm: 6, md: 8 }}
          spacing={{ base: 8 }}
          maxW={{ lg: "lg" }}
        >
          <Stack spacing={4}>
            <Heading
              lineHeight={1.1}
              fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
            >
              Get Started 🚀
            </Heading>
            <Text fontSize={{ base: "sm", sm: "md" }}>
              Set up your one-click subscription stream
            </Text>
          </Stack>
          <Box as={"form"} mt={10}>
            <Stack spacing={4}>
              <Text fontSize={{ base: "sm", sm: "md" }}>Title</Text>
              <Input
                placeholder="e.g Paid Private Discord"
                onChange={handleSubscriptionNameChange}
              />
              <Text fontSize={{ base: "sm", sm: "md" }}>
                What service are you providing?
              </Text>
              <Select
                placeholder="Select type of service"
                _placeholder={{ color: "#141414" }}
              >
                <option value="option1">Discord</option>
                <option value="option2">Twitter</option>
                <option value="option3">Telegram</option>
              </Select>
              <Text fontSize={{ base: "sm", sm: "md" }}>
                How much are you charging per cycle?
              </Text>
              <InputGroup>
                <Input
                  placeholder="e.g. 100.0"
                  onChange={handleMonthlyRateChange}
                />
                <InputRightAddon
                  bgColor={"#333333"}
                  color={"#FFF"}
                  children={
                    <>
                      <DAIxLogo />
                      &nbsp; DAI / Month
                    </>
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
                  bgGradient={"linear(to-r, red.400,pink.400)"}
                  color={"white"}
                  onClick={handleSubmit}
                  _hover={{
                    bgColor: "#0D0D0D",
                    boxShadow: "xl",
                  }}
                >
                  Create Service
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
