/*
 * Extracted and adapted from @mealection/react-native-boring-avatars@1.1.2.
 *
 * MIT License
 *
 * Copyright (c) 2020 Luke Hartman
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 */

import { useId } from "react";
import Svg, { Circle, G, Line, Mask, Rect } from "react-native-svg";

export interface RandomAvatarProps {
  name?: string;
  size: number;
}

const BASE_SIZE = 80;
const ELEMENTS = 4;
const COLORS = ["#FF008C", "#5B10FF", "#FFAC47", "#00AD1D", "#112E91"];

function getNumber(name?: string): number {
  let sum = 0;

  for (const character of Array.from(name ?? "")) {
    sum += character.charCodeAt(0);
  }

  return sum;
}

function getDigit(value: number, digitIndex: number): number {
  return Math.floor((value / 10 ** digitIndex) % 10);
}

function getBoolean(value: number, digitIndex: number): boolean {
  return getDigit(value, digitIndex) % 2 === 0;
}

function getUnit(value: number, range: number, digitIndex?: number): number {
  const normalized = value % range;

  if (digitIndex !== undefined && getDigit(value, digitIndex) % 2 === 0) {
    return -normalized;
  }

  return normalized;
}

function createScaleNumber(originalBaseNumber: number, newBaseNumber: number) {
  return function scaleNumber(originalNumber: number): number {
    return Math.ceil((originalNumber / originalBaseNumber) * newBaseNumber);
  };
}

export function RandomAvatar({ name, size }: RandomAvatarProps): JSX.Element {
  const avatarName = name ?? "";
  const numericSeed = getNumber(avatarName);
  const scaleNumber = createScaleNumber(BASE_SIZE, size);
  const maskId = `random-avatar-mask-${useId().replace(/:/g, "_")}`;

  const secondRectTranslateX = scaleNumber(60);
  const secondRectTranslateY = scaleNumber(20);
  const secondRectHeightModifier = scaleNumber(8);
  const lineStrokeWidth = scaleNumber(5);

  const properties = Array.from({ length: ELEMENTS }, (_, index) => {
    const translateModifier = scaleNumber(index + 17);

    return {
      color: COLORS[(numericSeed + index) % COLORS.length],
      translateX: getUnit(
        numericSeed * (index + 1),
        size / 2 - translateModifier,
        1,
      ),
      translateY: getUnit(
        numericSeed * (index + 1),
        size / 2 - translateModifier,
        2,
      ),
      rotate: getUnit(numericSeed * (index + 1), 360),
      isSquare: getBoolean(numericSeed, 2),
    };
  });

  return (
    <Svg viewBox={`0 0 ${size} ${size}`} fill="none" width={size} height={size}>
      <Mask
        id={maskId}
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={size}
        height={size}
      >
        <Rect width={size} height={size} rx={size * 2} fill="white" />
      </Mask>
      <G mask={`url(#${maskId})`}>
        <Rect width={size} height={size} fill={properties[0].color} />
        <Rect
          x={(size - secondRectTranslateX) / 2}
          y={(size - secondRectTranslateY) / 2}
          width={size}
          height={
            properties[1].isSquare ? size : size / secondRectHeightModifier
          }
          fill={properties[1].color}
          transform={`translate(${properties[1].translateX} ${properties[1].translateY}) rotate(${properties[1].rotate} ${size / 2} ${size / 2})`}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill={properties[2].color}
          r={size / 5}
          transform={`translate(${properties[2].translateX} ${properties[2].translateY})`}
        />
        <Line
          x1={0}
          y1={size / 2}
          x2={size}
          y2={size / 2}
          strokeWidth={lineStrokeWidth}
          stroke={properties[3].color}
          transform={`translate(${properties[3].translateX} ${properties[3].translateY}) rotate(${properties[3].rotate} ${size / 2} ${size / 2})`}
        />
      </G>
    </Svg>
  );
}
