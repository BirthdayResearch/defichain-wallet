import { useEffect } from "react";

export default function Index(): JSX.Element {
  useEffect(() => {
    window.location.href = "https://defichain.com";
  }, []);
  return (
    <div>
      <span />
    </div>
  );
}
