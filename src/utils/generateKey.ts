const generateKey = (): string => {
  const random = (from: number, to: number): number => {
    return Math.floor(from + Math.random() * (to + 1 - from));
  };

  const alphabetArray: string[] = "abcdefghijklmnopqrstuvwxyz".split("");
  const totalArray: Array<string | number> = [];

  for (let i: number = 0; i < 8; i++) {
    totalArray.push(alphabetArray[random(0, alphabetArray.length - 1)]);
    totalArray.push(random(0, 9));
  }

  return totalArray.sort(() => 0.5 - Math.random()).join("");
};

export default generateKey;
