import { ReactNode, useEffect, useState } from "react";
import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  Button,
  useDisclosure,
  Stack,
  StackDivider,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { Link as ReactRouterLink } from "react-router-dom";
import {
  DAIxLogo,
  LassoLogo,
  WalletConnectLogo,
  AvatarLogo,
} from "../assets/logos";
import useWalletProvider from "../hooks/useWalletProvider";
import { daiABI } from "../config/config";
import { ethers } from "ethers";

const Links = ["Create", "Subscriptions", "Service"];

const NavLink = ({ children }: { children: string }) => (
  <Link
    as={ReactRouterLink}
    px={2}
    py={1}
    rounded={"md"}
    color={"#fff"}
    _hover={{
      textDecoration: "none",
      bgColor: "#fff",
      color: "#000",
    }}
    to={`/${children.toLowerCase()}`}
  >
    {children}
  </Link>
);

function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { provider, account, framework, connectWallet } = useWalletProvider();
  const [DAIBalance, setDAIBalance] = useState("");
  const [DAIxBalance, setDAIxBalance] = useState("");

  const getBalances = async () => {
    if (!framework || !account) return;

    const signer = framework.createSigner({ web3Provider: provider });

    //fDAI on mumbai
    const DAI = new ethers.Contract(
      "0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7",
      daiABI,
      signer
    );

    const DAIx = await framework.loadWrapperSuperToken("fDAIx");

    setDAIBalance(ethers.utils.formatEther(await DAI.balanceOf(account)));
    setDAIxBalance(
      parseFloat(
        ethers.utils.formatEther(
          await DAIx.balanceOf({ account: account, providerOrSigner: signer })
        )
      )
        .toFixed(2)
        .toString()
    );
  };

  useEffect(() => {
    getBalances();
  });

  return (
    <>
      <Box bg={"#000"} px={8}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton
            size={"md"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={16} alignItems={"center"} width={"100%"}>
            <Box>
              <LassoLogo />
            </Box>
            <HStack
              as={"nav"}
              spacing={8}
              width={"100%"}
              display={{ base: "none", md: "flex" }}
            >
              {Links.map((link) => (
                <NavLink key={link}>{link}</NavLink>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={"center"}>
            {!account ? (
              <Button
                variant={"solid"}
                bgColor={"#0A7CFF"}
                color={"#FFF"}
                size={"md"}
                mr={4}
                onClick={connectWallet}
                leftIcon={<WalletConnectLogo />}
              >
                Connect Wallet
              </Button>
            ) : (
              <HStack
                spacing={4}
                divider={<StackDivider borderColor="rgb(255, 255, 255, 0.5)" />}
              >
                <Flex
                  bgColor={"#1A1A1A"}
                  color={"#fff"}
                  rounded={"md"}
                  paddingX={"6"}
                  paddingY={"2"}
                  justifyContent={"space-between"}
                  textAlign={"center"}
                  minWidth={"170px"}
                >
                  <DAIxLogo /> {DAIxBalance} DAIx
                </Flex>
                <Flex
                  color={"#fff"}
                  rounded={"md"}
                  paddingY={"2"}
                  justifyContent={"space-between"}
                  minWidth={"145px"}
                >
                  <AvatarLogo />{" "}
                  {`${account.substring(0, 6)}...${account.substring(
                    account.length - 4,
                    account.length
                  )}`}
                </Flex>
              </HStack>
            )}
          </Flex>
        </Flex>
      </Box>

      {isOpen ? (
        <Box pb={4} display={{ md: "none" }}>
          <Stack as={"nav"} spacing={4}>
            {Links.map((link) => (
              <NavLink key={link}>{link}</NavLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </>
  );
}

export default Navbar;
