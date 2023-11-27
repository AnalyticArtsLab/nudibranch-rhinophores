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

const generateFaces = (points, loopLength, insideFace = false) => {
  const faces = [];
  const STEPS = points.length / loopLength;

  for (let i = 0; i < STEPS - 1; i++) {
    for (let j = 0; j < loopLength; j++) {
      const current = i * loopLength + j;
      const next = i * loopLength + ((j + 1) % loopLength);
      if (insideFace){
        faces.push([current, next, current + loopLength]);
        faces.push([next, next + loopLength, current + loopLength,]);
      }else{
        faces.push([current, current + loopLength, next]);
        faces.push([next,current + loopLength, next + loopLength, ]);
      }
      
    }
  }

  return faces;
};

export function pulpitMesh(options) {
  const LENGTH = options.length.value;
  const THICKNESS = options.thickness.value;
  const BOTTOM_THICKNESS = THICKNESS * 0.6;
  const WALL_THICKNESS = 0.1;
  const STEPS = 10;
  const POINTS_PER_LOOP = 30;

  // generate the points for the inside and the outside at the same time in two separate lists
  const points = [];
  const insidePoints = [];

  for (let i = 0; i <= STEPS; i++) {
    const y = (i * LENGTH) / STEPS;
    for (let j = 0; j < POINTS_PER_LOOP; j++) {
      const radius = BOTTOM_THICKNESS + (THICKNESS-BOTTOM_THICKNESS) * (i / STEPS);
      const x = Math.sin((j * 2 * Math.PI) / POINTS_PER_LOOP) * radius;
      const z = Math.cos((j * 2 * Math.PI) / POINTS_PER_LOOP) * radius;
      points.push(new Vector3(x, y, z));

      const insideX = Math.sin((j * 2 * Math.PI) / POINTS_PER_LOOP) * (radius - WALL_THICKNESS);
      const insideZ = Math.cos((j * 2 * Math.PI) / POINTS_PER_LOOP) * (radius - WALL_THICKNESS);
      insidePoints.push(new Vector3(insideX, y, insideZ));
    }
  }

  // generate the faces for the two surfaces
  const faces = generateFaces(points, POINTS_PER_LOOP);
  const insideFaces =generateFaces(insidePoints, POINTS_PER_LOOP, true);

  // merge the two into a single list
  const allPoints = points.concat(insidePoints);
  insideFaces.forEach((f) => {
    f[0] += points.length;
    f[1] += points.length;
    f[2] += points.length;
  });
  const allFaces = faces.concat(insideFaces);


  // add faces connecting the inside and outside
  // the outside points should start at points.length-POINTS_PER_LOOP
  // the inside points should start at allPoints.length-POINTS_PER_LOOP
  for (let i = 0; i < POINTS_PER_LOOP; i++) {
    const nextBase = (i+1) % POINTS_PER_LOOP;
    const current = points.length - POINTS_PER_LOOP + i;
    const next = points.length - POINTS_PER_LOOP + nextBase;
  
    allFaces.push([current, current+ insidePoints.length, next]);
    allFaces.push([next, current+ insidePoints.length, next+ insidePoints.length]);
  }


  const rhinophore = renderPoints(allPoints, allFaces, "rhinophore",false, false);

  return rhinophore;
}

export function simpleRhinophoreMesh(options) {
  const LENGTH = options.length.value;
  const THICKNESS = options.thickness.value;
  const TIP_PERCENTAGE = options.tipPercentage.value;

  // percentage of the THICKNESS to add for the flare at the base
  const BASE_FLARE_PERCENTAGE = options.baseFlarePercentage.value;

  // how quickly the flare falls off, larger numbers fall off more quickly 4-16 is a good range. Larger values create a single step flare, and smaller values haven't collapsed down enough to meet the cap
  const BASE_FALLOFF = options.baseFalloff.value;
  const STEPS = 10;
  const SHAFT_LENGTH = (1 - TIP_PERCENTAGE) * LENGTH;

  const path = [];

  // main shaft points
  for (let i = 0; i <= STEPS; i++) {
    let y = (i * SHAFT_LENGTH) / STEPS;
    let x = Math.sin((i * 2 * Math.PI) / STEPS) * 0.5;
    path.push(new Vector3(x, y, 0));
  }

  const base = path[STEPS]; // the last point in the shaft
  const direction = path[STEPS].subtract(path[STEPS - 1]).normalize();
  // end cap points
  for (let i = 1; i <= STEPS; i++) {
    const percentage = i / STEPS;
    const alpha = (percentage * Math.PI) / 2;
    const scale = Math.sin(alpha) * LENGTH * TIP_PERCENTAGE;
    path.push(base.add(direction.scale(scale)));
  }

  const calcThickness = (i) => {
    if (i <= STEPS) {
      return (
        THICKNESS +
        THICKNESS *
          BASE_FLARE_PERCENTAGE *
          (2 - 2 / (1 + Math.exp(-(i / STEPS) * BASE_FALLOFF)))
      );
    } else {
      const tipPercentage = (i - STEPS) / STEPS;

      const theta = (tipPercentage * Math.PI) / 2;
      const radius = THICKNESS * Math.cos(theta);
      return radius;
    }
  };

  const rhinophoreOptions = {
    path,
    radiusFunction: calcThickness,
  };

  const rhinophore = MeshBuilder.CreateTube(
    "simple rhinophore",
    rhinophoreOptions
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

  // const options = {
  //   thickness: { type: "range", min: 0.1, max: 2, value: 0.2 },
  //   length: { type: "range", min: 1, max: 20, value: 10 },
  //   tipPercentage: { type: "range", min: 0.05, max: 0.9, value: 0.1 },
  //   baseFlarePercentage: { type: "range", min: 0.0, max: 2, value: 0.8 },
  //   baseFalloff: { type: "range", min: 4, max: 16, value: 5 },
  // };

  // simpleRhinophoreMesh(options);

  const pulpitOptions = {
    thickness: { type: "range", min: 0.1, max: 2, value: 2 },
    length: { type: "range", min: 1, max: 20, value: 4 },
  };
  const pulpit = pulpitMesh(pulpitOptions);

  return scene;
};
