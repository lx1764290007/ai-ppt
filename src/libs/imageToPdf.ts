import { jsPDF } from "jspdf";
import { getRandomString } from "@/libs/random";


export const imageToPDF = async (base64List: string[]) => {
  return new Promise<'ok'|PromiseRejectedResult>((resolve, reject) => {
    const WIDTH = 280, HEIGHT = WIDTH * 9 / 16;
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [WIDTH, HEIGHT]
    });
    for(let i = 0; i < base64List.length; i++) {
      if (i > 0) {
        doc.addPage(); // 每次添加新图片前添加一页
      }
      doc.addImage(base64List[i], 'PNG', 0, 0,WIDTH,  HEIGHT); // 添加图片到PDF
    }
    try{
      const fileName = getRandomString(10);
      doc.save('if-' + fileName + ".pdf");
      resolve('ok');
    } catch (e) {
      reject(e);
    }
  })

}
