import { Canvas, Circle, Polygon, Line, type XY } from "fabric";
import { markRaw } from "vue";

let globalFabric: Canvas | null = null;

let polygons: XY[] = [],
  lines: any[] = [];
let circles: any[] = [],
  removeAbleLines: any[] = [];

let md: any, mu: any, mm: any, os: any, om: any, ct: any, rm: any;
export const createPolygon = (
  canvas: HTMLCanvasElement,
  fn1: (value?: boolean) => void,
  fn2: (style: { left: number; top: number }) => void,
  fabricCanvas: Canvas
) => {
  let polygon: any,
    isDown: boolean,
    isDragging: boolean = false,
    origX: any,
    origY: any;

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
    if (circles[0]?.containsPoint?.(pointer)) {
      onCreate();
      return;
    }
    const circle = new Circle({
      left: pointer.x,
      top: pointer.y,
      centeredScaling: true,
      originX: "center",
      originY: "center",
      width: 16,
      height: 16,
      radius: 8,
      fill: circles.length > 0 ? "rgb(149,198,248)" : "red",
      selectable: false,
      evented: false
    });
    fabricCanvas.add(circle);
    if (lines.length > 3) {
      lines.splice(0, 2);
    }
    lines.push(pointer.x);
    lines.push(pointer.y);
    circles.push(circle);
    polygons.push({ x: pointer.x, y: pointer.y });
    fn1();
  };
  const onMouseUp = (event: any) => {
    isDown = false;
    isDragging = false;
    if (lines.length < 4) return;
    const line = new Line(lines as [number, number, number, number], {
      stroke: "rgb(41,141,237)",
      strokeWidth: 2,
      selectable: false,
      evented: false
    });
    fabricCanvas.add(line);
    removeAbleLines.push(line);
  };
  const onScaling = (event: any) => {
    const target = event.target;
    fn2({ left: target.oCoords.tr.x, top: target.oCoords.tr.y });
  };
  const onObjectMoving = (event: any) => {
    const target = event.target;
    fn2({ left: target.oCoords.tr.x, top: target.oCoords.tr.y });
  };

  const onMouseMove = (event: any) => {};
  const onCreate = () => {
    if (polygons.length < 3) return;

    // 创建多边形
    const polygon = new Polygon(polygons, {
      stroke: "rgb(149,198,248)",
      fill: "rgba(0,0,0,0.1)",
      strokeWidth: 2,
      selectable: true,
      evented: true
    });
    fabricCanvas.add(markRaw(polygon));
    fabricCanvas.renderAll();
    polygons = [];
    lines = [];
    removeAllCircleHandle();
    removeAllLineHandle();
  };
  const removeAllCircleHandle = () => {
    if (circles.length) {
      for (const x of circles) {
        fabricCanvas.remove(x);
      }
    }
    circles = [];
  };
  const removeAllLineHandle = () => {
    if (removeAbleLines.length) {
      for (const x of removeAbleLines) {
        fabricCanvas.remove(x);
      }
      removeAbleLines = [];
    }
    lines = [];
  };
  const removeAllPolygonPointHandle = () => {
    polygons = [];
  };
  fabricCanvas.on("mouse:move", onMouseMove);
  // 结束框选
  fabricCanvas.on("mouse:up", onMouseUp);
  fabricCanvas.on("mouse:down", onMouseDown);
  fabricCanvas.on("object:scaling", onScaling);
  fabricCanvas.on("object:moving", onObjectMoving);
  fabricCanvas.on("mouse:dblclick", onCreate);
  mm = onMouseMove;
  md = onMouseDown;
  mu = onMouseUp;
  os = onScaling;
  om = onObjectMoving;
  ct = onCreate;
  rm = () => {
    removeAllCircleHandle();
    removeAllLineHandle();
    removeAllPolygonPointHandle();
  };
};

export const deletePolygon = () => {
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

export const removeAllPolygonEvent = () => {
  if (globalFabric) {
    globalFabric.off("mouse:move", mm);
    // 结束框选
    globalFabric.off("mouse:up", mu);

    globalFabric.off("mouse:down", md);
    globalFabric.off("mouse:dblclick", ct);
    globalFabric.off("object:scaling", os);
    globalFabric.off("object:moving", om);
  }
};

export const removePointAndLine = () => {
  rm && rm();
};
