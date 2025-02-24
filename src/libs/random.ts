export const getRandomString = (total: number): string => {
  const target1 = ["0", "1", "2", "3", "4", "5", "6", "7", "7", "8", "9"],
    target2 = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n","o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
    target3 = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
  const len1 = target1.length, len2 = target2.length, len3 = target3.length;
  let res:string = "";
  for (let i = 0; i < total; i++) {
    const start = Math.random();
    if(start < 0.33){
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      res = res + target1[Math.floor(Math.random() * len1)];
    } else if(start >= 0.33 && start < 0.66){
      res = res + target2[Math.floor(Math.random() * len2)];
    } else {
      res = res + target3[Math.floor(Math.random() * len3)];
    }
  }
  return res;
};