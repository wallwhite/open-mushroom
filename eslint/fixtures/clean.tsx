import { useState } from 'react';

interface GreetingProps {
  name: string;
}

export const Greeting = ({ name }: GreetingProps) => {
  const [count, setCount] = useState(0);

  return (
    <button
      type="button"
      onClick={() => {
        setCount((value) => value + 1);
      }}
    >
      {name}: {count}
    </button>
  );
};
