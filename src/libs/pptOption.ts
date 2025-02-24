export const getImageOption = (img: HTMLImageElement) => {
  const { width, height } = window.getComputedStyle(img);
  console.log(width, height);
}