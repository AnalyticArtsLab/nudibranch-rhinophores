import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder  } from "@babylonjs/core";

// import { roundedCylinder } from "./utils";

import { pulpitMesh } from "./rhinophores/pulpit";

import { lamellateMesh } from "./rhinophores/lamellate";
import { simpleRhinophoreMesh } from "./rhinophores/basic";




export const createScene = async function (engine, canvas) {
  // This creates a basic Babylon Scene object (non-mesh)
  const scene = new Scene(engine);
  scene.clearColor = new Color3(0.94, 0.95, 0.89);

  // This creates and positions a free camera (non-mesh)
  const camera1 = new ArcRotateCamera(
    "camera1",
    Math.PI / 2,
    Math.PI / 2,
    25,
    new Vector3(0, 5, 0),
    scene
  );
  camera1.attachControl(canvas, true);
  scene.activeCameras.push(camera1);

  const light = new HemisphericLight(
    "light",
    new Vector3(-1.5, 1.5, 0.75),
    scene
  );

  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 0.7;



  const pulpitOptions = {
    thickness: { type: "range", min: 0.1, max: 2, value: 0.2 },
    length: { type: "range", min: 1, max: 20, value: 6 },
    shaftNoiseFactor: { type: "range", min: 0, max: 5, value: 2 },
    tipPercentage: { type: "range", min: 0.05, max: 0.9, value: 0.1 },
    baseFlarePercentage: { type: "range", min: 0.0, max: 2, value: 0.8 },
    baseFalloff: { type: "range", min: 4, max: 16, value: 5 },

    pulpitThickness: { type: "range", min: 0.1, max: 2, value: 2 },
    pulpitLengthPercentage: { type: "range", min: 0.1, max: 1, value: 0.8 },
    baseRadiusPercentage: { type: "range", min: 0.1, max: 1, value: 0.6 },
    horizontalNoiseZoom: { type: "range", min: 0.1, max: 1, value: 0.2 },
    verticalNoiseZoom: { type: "range", min: 0.1, max: 1, value: 0.2 },
    radiusNoiseFactor: { type: "range", min: 0.1, max: 1, value: 0.7 },
    pulpitSkewFactor: { type: "range", min: 0.1, max: 1, value: 0.03 },
    centralShaft: { type: "boolean", value: true},
  };
  pulpitMesh(pulpitOptions);
  // simpleRhinophoreMesh(pulpitOptions);

  const lamellateOptions = {
    thickness: { type: "range", min: 0.1, max: 2, value: 0.4 },
    length: { type: "range", min: 1, max: 20, value: 8 },
    shaftNoiseFactor: { type: "range", min: 0, max: 5, value: 2 },
    tipPercentage: { type: "range", min: 0.05, max: 0.9, value: 0.6 },
    baseFlarePercentage: { type: "range", min: 0.0, max: 2, value: 0.8 },
    baseFalloff: { type: "range", min: 4, max: 16, value: 20 },

    pulpitThickness: { type: "range", min: 0.1, max: 2, value: 2 },
    pulpitLengthPercentage: { type: "range", min: 0.1, max: 1, value: 0.8 },
    baseRadiusPercentage: { type: "range", min: 0.1, max: 1, value: 0.6 },
    horizontalNoiseZoom: { type: "range", min: 0.1, max: 1, value: 0.2 },
    verticalNoiseZoom: { type: "range", min: 0.1, max: 1, value: 0.2 },
    radiusNoiseFactor: { type: "range", min: 0.1, max: 1, value: 0.7 },
    pulpitSkewFactor: { type: "range", min: 0.1, max: 1, value: 0.03 },
    centralShaft: { type: "boolean", value: true},
  };
  // lamellateMesh(lamellateOptions);


  return scene;
};
