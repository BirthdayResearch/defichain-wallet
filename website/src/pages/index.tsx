import { Container } from "@components/commons/Container";
import { useEffect } from "react";

export default function Index(): JSX.Element {
  useEffect(() => {
    window.location.href = "https://defichain.com";
  }, []);
  return (
    <Container className="py-12">
      <h1 className="text-3xl font-semibold">DeFiChain Wallet</h1>
    </Container>
  );
}
