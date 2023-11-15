/**
 * This is just Babylon.j boilerplate that was generated when I exported from the playground. 
 * 
 * This calls the createScene function which is where the real action is. As such, the function should be defined before this script is run. 
 */

import { Engine } from "@babylonjs/core/Engines/engine";

import { createScene } from "./scene";

const canvas = document.getElementById("renderCanvas");

const startRenderLoop = function (engine, canvas) {
  engine.runRenderLoop(function () {
    if (sceneToRender && sceneToRender.activeCamera) {
      sceneToRender.render();
    }
  });
};



let sceneToRender = null;
const createDefaultEngine = function () {
  return new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: false,
  });
};

window.initFunction = async function () {

  
  const asyncEngineCreation = async function () {
    try {
      return createDefaultEngine();
    } catch (e) {
      console.log(
        "the available createEngine function failed. Creating the default engine instead"
      );
      return createDefaultEngine();
    }
  };

 
  window.engine = await asyncEngineCreation();
  if (!engine) throw "engine should not be null.";
  startRenderLoop(engine, canvas);
  window.scene = await createScene(engine, canvas);
};


initFunction().then(() => {
  sceneToRender = scene;
});

// Resize
window.addEventListener("resize", function () {
  engine.resize();
});
