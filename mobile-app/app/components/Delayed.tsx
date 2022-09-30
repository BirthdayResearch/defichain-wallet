import { useEffect, useState } from "react";

type DelayedProps = {
  children: React.ReactElement;
  waitBeforeShow?: number;
};

export function Delayed({
  children,
  waitBeforeShow = 300,
}: DelayedProps): JSX.Element {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShown(true);
    }, waitBeforeShow);
    return () => clearTimeout(timer);
  }, [waitBeforeShow]);

  return isShown ? children : <></>;
}
