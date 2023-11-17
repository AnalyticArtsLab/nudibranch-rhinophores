import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core";

import { HEMesh } from "he-mesh/src/he-mesh";
import { loopSubdivision } from "he-mesh/src/subdivision";

import { tee3D } from "he-mesh/test/meshes";

function renderPoints(
  points,
  faces,
  name = "mesh",
  showWireframe = false,
  renderBackface = false
) {
  const rawPoints = [];
  points.forEach((p) => {
    rawPoints.push(p.x);
    rawPoints.push(p.y);
    rawPoints.push(p.z);
  });

  const rawFaces = faces.reduce((flat, item) => flat.concat(item));

  // a wireframe of the original shape
  const mesh = new Mesh(name);

  const normals = [];
  VertexData.ComputeNormals(rawPoints, rawFaces, normals);

  const vertexData = new VertexData();
  vertexData.positions = rawPoints;
  vertexData.indices = rawFaces;
  vertexData.normals = normals;
  if (points[0].color) {
    const colors = [];
    points.forEach((p) => {
      colors.push(p.color[0]);
      colors.push(p.color[1]);
      colors.push(p.color[2]);
      colors.push(p.color[3]);
    });
    vertexData.colors = colors;
  }

  vertexData.applyToMesh(mesh);

  const material = new StandardMaterial("texture1");
  material.wireframe = showWireframe;
  mesh.material = material;

  material.backFaceCulling = !renderBackface;
  return mesh;
}

export function simpleRhinophoreMesh2(options) {
  const LENGTH = options.length.value;
  const THICKNESS = options.thickness.value;
  const TIP_PERCENTAGE = options.tipPercentage.value;

  // percentage of the THICKNESS to add for the flare at the base
  const BASE_FLARE_PERCENTAGE = options.baseFlarePercentage.value;

  // how quickly the flare falls off, larger numbers fall off more quickly 4-16 is a good range. Larger values create a single step flare, and smaller values haven't collapsed down enough to meet the cap
  const BASE_FALLOFF = options.baseFalloff.value;
  const STEPS = 10;
  const LOOP_LENGTH = 12;
  const SHAFT_LENGTH = (1 - TIP_PERCENTAGE) * LENGTH;

  const path = [];
  for (let i = 0; i < STEPS; i++) {
    const y = (i * SHAFT_LENGTH) / STEPS - 0.02;
    path.push(new Vector3(0, y, 0));
  }

  const calcThickness = (i) =>
    THICKNESS +
    THICKNESS *
      BASE_FLARE_PERCENTAGE *
      (2 - 2 / (1 + Math.exp((-i / STEPS) * BASE_FALLOFF)));

  const rhinophoreOptions = {
    path,
    tessellation: LOOP_LENGTH,
    radiusFunction: calcThickness,
  };

  const rhinophore = MeshBuilder.CreateTube(
    "simple rhinophore",
    rhinophoreOptions
  );

  const diameter = calcThickness(STEPS-1) * 2;

  const endCap = MeshBuilder.CreateSphere("end cap", 
  {diameterX:diameter,
    diameterZ:diameter, 
    diameterY: 1.9 * LENGTH * TIP_PERCENTAGE, 
    subdivisions: LOOP_LENGTH, 
    arc:1.0, 
    slice:0.51});
  endCap.position = path[path.length - 1];


const rhinophoreMesh = Mesh.MergeMeshes([rhinophore, endCap], true, true);


  return rhinophore;
}

export function simpleRhinophoreMesh(options) {
  const positions = [];
  const indices = [];

  const LENGTH = options.length.value;
  const THICKNESS = options.thickness.value;
  const TIP_PERCENTAGE = options.tipPercentage.value;

  // percentage of the THICKNESS to add for the flare at the base
  const BASE_FLARE_PERCENTAGE = options.baseFlarePercentage.value;

  // how quickly the flare falls off, larger numbers fall off more quickly 4-16 is a good range. Larger values create a single step flare, and smaller values haven't collapsed down enough to meet the cap
  const BASE_FALLOFF = options.baseFalloff.value;

  const STEPS = 10;
  const LOOP_LENGTH = 12;

  const SHAFT_LENGTH = (1 - TIP_PERCENTAGE) * LENGTH;

  for (let i = 0; i < STEPS; i++) {
    const y = (i * SHAFT_LENGTH) / STEPS - 0.02;
    let radius = THICKNESS;

    // add the flare at the base
    radius +=
      THICKNESS *
      BASE_FLARE_PERCENTAGE *
      (2 - 2 / (1 + Math.exp((-i / STEPS) * BASE_FALLOFF)));

    for (let a = 0; a < 2 * Math.PI; a += (2 * Math.PI) / LOOP_LENGTH) {
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;
      positions.push(new Vector3(x, y, z));
    }
  }

  // add the end cap
  // this is in the shape of a dome

  const POINTS_PER_LOOP = positions.length / STEPS;
  const TIP_HEIGHT = LENGTH * TIP_PERCENTAGE;
  const shaftTop = positions[positions.length - 1].y;

  // we start one step in to not duplicate the points along the top of the shaft
  const domeStep = Math.PI / STEPS;
  for (let alpha = domeStep; alpha <= Math.PI / 2; alpha += domeStep) {
    for (
      let beta = 0;
      beta < 2 * Math.PI;
      beta += (2 * Math.PI) / LOOP_LENGTH
    ) {
      const x = Math.cos(beta) * THICKNESS * Math.cos(alpha);
      const y = Math.sin(alpha) * TIP_HEIGHT + shaftTop;
      const z = Math.sin(beta) * THICKNESS * Math.cos(alpha);
      positions.push(new Vector3(x, y, z));
    }
  }

  for (let i = 0; i < positions.length / LOOP_LENGTH - 1; i++) {
    for (let j = 0; j < POINTS_PER_LOOP; j++) {
      const current = i * POINTS_PER_LOOP + j;
      const next = i * POINTS_PER_LOOP + ((j + 1) % POINTS_PER_LOOP);
      indices.push([current, next, current + POINTS_PER_LOOP]);
      indices.push([next, next + POINTS_PER_LOOP, current + POINTS_PER_LOOP]);
    }
  }

  // const endLoopStart = positions.length - LOOP_LENGTH;

  positions.forEach((p) => {
    p.color = [0.8, 0.8, 1.0, 1];
  });

  const rhinophore = renderPoints(
    positions,
    indices,
    "rhinophore",
    false,
    true
  );
  return rhinophore;
}

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

  const options = {
    thickness: { type: "range", min: 0.1, max: 2, value: 0.5 },
    length: { type: "range", min: 1, max: 20, value: 10 },
    tipPercentage: { type: "range", min: 0.05, max: 0.9, value: 0.1 },
    baseFlarePercentage: { type: "range", min: 0.0, max: 2, value: 0.8 },
    baseFalloff: { type: "range", min: 4, max: 16, value: 5 },
  };

  simpleRhinophoreMesh2(options);

  return scene;
};
