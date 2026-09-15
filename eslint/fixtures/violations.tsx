import fs from 'node:fs';
import { useState } from 'react';

interface GalleryItem {
  name: string;
}

export const Gallery = ({ items, flag }: { items: any[]; flag: boolean }) => {
  console.log(items, fs.existsSync('.'));
  if (flag) {
    if (items.length > 0) {
      const [count] = useState(0);

      throw Error(`count ${count}`);
    }
  }

  return (
    <ul>
      {items.map((item: GalleryItem) => (
        <li>{item.name}</li>
      ))}
      <img src="mushroom.png" />
      <p>{"double quotes"}</p>
    </ul>
  );
};

/* Banned by the restricted-types rule that took over from ban-types. */
export const banned: object = {};
