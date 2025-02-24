import { Canvas, Circle } from "fabric";
import { markRaw } from "vue";

let globalFabric: Canvas | null = null;
let md: any, mu: any, mm: any, os: any, om: any;
export const createCircle = (
  canvas: HTMLCanvasElement,
  fn1: (value?: boolean) => void,
  fn2: (style: { left: number; top: number }) => void,
  fabricCanvas: Canvas
) => {
  let circle: any,
    isDown: boolean,
    isDragging: boolean = false,
    origX: any,
    origY: any;
  // const fabricCanvas = new Canvas(canvas, {
  //   width: canvas.width,
  //   height: canvas.height,
  //   selection: true  // 禁用 Fabric.js 默认的多选
  // });
  globalFabric = fabricCanvas;

  const onMouseDown = (event: any) => {
    const clickedObj = event.target;
    isDown = true;
    const pointer = event.pointer;
    origX = pointer.x;
    origY = pointer.y;
    if (clickedObj) {
      // console.log(clickedObj.oCoords.tr.x, clickedObj.oCoords.tr.y);
      fn2({ left: clickedObj.oCoords.tr.x, top: clickedObj.oCoords.tr.y });
      fn1(true);
      return;
    }
    circle = new Circle({
      left: origX,
      top: origY,
      centeredScaling: true,
      originX: "center",
      originY: "center",
      width: 100,
      height: 100,
      radius: 50,
      strokeWidth: 2,
      stroke: "rgb(149,198,248)",
      fill: "rgba(0,0,0,0.1)",
      selectable: true,
      hasControls: true,
      hasBorders: true, // 显示边框以确认控制点位置
      lockRotation: false,
      cursor: "pointer",
      borderScaleFactor: 1.1,
      borderColor: "rgb(41,141,237)"
    });
    fabricCanvas.add(markRaw(circle));
    fabricCanvas.renderAll();
    fn1();
  };

  const onMouseUp = (event: any) => {
    const target = event.target;
    isDown = false;
    isDragging = false;
    limitBoundaries(target);
    // fabricCanvas.off('mouse:up',onMouseUp);
    // fabricCanvas.off('mouse:down',onMouseDown);
    // fabricCanvas.off('mouse:move',onMouseMove);
  };
  const onScaling = (event: any) => {
    const target = event.target;
    fn2({ left: target.oCoords.tr.x, top: target.oCoords.tr.y });
  };
  const onObjectMoving = (event: any) => {
    const target = event.target;
    fn2({ left: target.oCoords.tr.x, top: target.oCoords.tr.y });
    //limitBoundaries(target);
  };

  const onMouseMove = (event: any) => {
    // if (!isDown) return;
    // const pointer = event.pointer;
    // const target = event.target;
    // if (!target) {
    //   const radius = Math.sqrt(
    //     Math.pow(pointer.x - circle.left, 2) +
    //        Math.pow(pointer.y - circle.top, 2)
    //   );
    //   circle.set({
    //     radius: radius,
    //     left: pointer.x - radius,
    //     top: pointer.y - radius,
    //   });
    // } else if (isDragging) {
    //   const x = pointer.x - target.width / 2, y = pointer.y - target.height / 2;
    //   target.set({
    //     left: x,
    //     top: y
    //   });
    // }
    // fabricCanvas.renderAll();
  };
  const limitBoundaries = (target: any) => {
    const boundingRect = target.getBoundingRect();
    // 限制对象的左边界
    if (boundingRect.left < 0) {
      target.left = boundingRect.width / 2;
    }

    // 限制对象的上边界
    if (boundingRect.top < 0) {
      target.top = boundingRect.width / 2;
    }

    // 限制对象的右边界
    if (boundingRect.left + boundingRect.width > canvas.width) {
      target.left = canvas.width - boundingRect.width / 2;
    }

    // 限制对象的下边界
    if (boundingRect.top + boundingRect.height > canvas.height) {
      target.top = canvas.height - boundingRect.height / 2;
    }
    target.setCoords();
    fabricCanvas.renderAll();
    fn2({ left: target.oCoords.tr.x, top: target.oCoords.tr.y });
  };
  fabricCanvas.on("mouse:move", onMouseMove);
  // 结束框选
  fabricCanvas.on("mouse:up", onMouseUp);
  fabricCanvas.on("mouse:down", onMouseDown);
  fabricCanvas.on("object:scaling", onScaling);
  fabricCanvas.on("object:moving", onObjectMoving);

  mm = onMouseMove;
  md = onMouseDown;
  mu = onMouseUp;
  os = onScaling;
  om = onObjectMoving;
};

export const deleteCircle = () => {
  if (globalFabric) {
    const activeObjects = globalFabric.getActiveObjects();
    activeObjects.forEach((obj) => {
      globalFabric!!.remove(obj);
    });
    // 清除选中的对象状态
    globalFabric.discardActiveObject();
    globalFabric.renderAll();
  }
};
export const removeAllCircleEvent = () => {
  if (globalFabric) {
    globalFabric.off("mouse:move", mm);
    // 结束框选
    globalFabric.off("mouse:up", mu);
    globalFabric.off("mouse:down", md);
    globalFabric.off("object:scaling", os);
    globalFabric.off("object:moving", om);
  }
};
